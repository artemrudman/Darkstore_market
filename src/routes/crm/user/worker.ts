import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { SHA256 } from 'crypto-js';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_DELIVERYMAN, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_WAREHOUSE_WORKER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

function generateHex(size: number) {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  
    for (let i = 0; i < size; ++i) {
        result.push(hexRef[Math.floor(Math.random() * 16)]);
    }

    return result.join('');
}

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['branch_id', 'name', 'email', 'phone_number', 'role_id'],
                properties: {
                    branch_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 50,
                        pattern: '^[a-zA-Z_ ]+$'
                    },
                    email: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$'
                    },
                    phone_number: {
                        type: 'string',
                        maxLength: 16,
                        pattern: '^[0-9]+$'
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
        userType: [USER_WORKER],
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Body: {
            branch_id: number;
            name: string;
            email: string;
            phone_number: string;
            role_id: number;
        }
    }>, reply: FastifyReply) => {
        if (!(await opts.db.query('SELECT id FROM branch WHERE id = $1', [request.body.branch_id])).rows[0]) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }
        
        const user = request.requestContext.get('user') as Worker;

        if (user.role_id === ROLE_MANAGER && 
            request.body.role_id !== ROLE_WAREHOUSE_WORKER &&
            request.body.role_id !== ROLE_DELIVERYMAN) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        if ((await opts.db.query('SELECT id FROM worker WHERE email = $1', [request.body.email])).rows[0]) {
            reply.statusCode = 400;
            return {
                error: 'EMAIL_ALREADY_USED'
            };
        }

        if ((await opts.db.query('SELECT id FROM worker WHERE phone_number = $1', [request.body.phone_number])).rows[0]) {
            reply.statusCode = 400;
            return {
                error: 'PHONE_NUMBER_ALREADY_USED'
            };
        }

        let qr;
        let qrFound = false;

        for (let i = 0; i < 10; ++i) {
            qr = generateHex(64);

            if (!(await opts.db.query('SELECT id FROM worker WHERE qr = $1', [qr])).rows[0]) {
                qrFound = true;

                break;
            }
        }

        if (!qrFound) {
            reply.statusCode = 500;
            return {
                error: 'INTERNAL_SERVER_ERROR'
            };
        }

        await opts.db.query('INSERT INTO worker VALUES(default, $1, $2, $3, $4, $5, $6, 0, false, default, $7)', [
            request.body.branch_id,
            request.body.name,
            request.body.email,
            request.body.phone_number,
            SHA256(qr!).toString(),
            request.body.role_id,
            user.id
        ]);

        return {
            qr
        };
    }));
}

export const autoPrefix = '/crm/user/worker';