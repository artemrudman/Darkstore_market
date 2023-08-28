import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { SHA256 } from 'crypto-js';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_DELIVERYMAN, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_WAREHOUSE_WORKER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';
import { generateQr } from '../../../utils/qr';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'email', 'phone_number', 'role_id'],
                properties: {
                    branch_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    },
                    name: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z ]+$'
                    },
                    email: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'
                    },
                    phone_number: {
                        type: 'string',
                        maxLength: 16,
                        pattern: '^\\d+$'
                    },
                    role_id: {
                        type: 'number',
                        minimum: 0,
                        maximum: 6
                    }
                }
            }
        }
    }, protect(opts.db, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Body: {
            branch_id?: number;
            name: string;
            email: string;
            phone_number: string;
            role_id: number;
        }
    }>, reply: FastifyReply) => {        
        const user = request.requestContext.get('user') as Worker;
        
        if (user.role_id === ROLE_MANAGER && ![ROLE_WAREHOUSE_WORKER, ROLE_DELIVERYMAN].includes(request.body.role_id)) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        let branchId;

        if (user.role_id !== ROLE_MANAGER) {
            if (!request.body.branch_id) {
                reply.statusCode = 400;
                return {
                    error: 'BAD_REQUEST'
                };
            }

            branchId = request.body.branch_id;
        } else {
            branchId = user.branch_id;
        }

        if (!(await opts.db.query('SELECT id FROM branch WHERE id = $1', [branchId])).rows[0]) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }

        const qr = await generateQr(opts.db, 'worker');

        if (!qr) {
            reply.statusCode = 500;
            return {
                error: 'INTERNAL_SERVER_ERROR'
            };
        }

        await opts.db.query('INSERT INTO worker VALUES(default, $1, $2, $3, $4, $5, 0, false, $6, default, $7)', [
            branchId,
            request.body.name,
            request.body.email,
            request.body.phone_number,
            request.body.role_id,
            SHA256(qr).toString(),
            user.id
        ]);

        return {
            qr
        };
    }));
}

export const autoPrefix = '/crm/user/worker';