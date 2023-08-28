import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { SHA256 } from 'crypto-js';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';
import { generateQr } from '../../../utils/qr';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            params: {
                type: 'object',
                required: ['branch_id'],
                properties: {
                    branch_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    }
                }
            },
            body: {
                type: 'object',
                required: ['name', 'storage_type_id'],
                properties: {
                    name: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z0-9 ]+$'
                    },
                    storage_type_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    }
                }
            }
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, async (request: FastifyRequest<{
        Params: {
            branch_id: number;
        },
        Body: {
            name: string;
            storage_type_id: number;
        }
    }>, reply: FastifyReply) => {
        const user = request.requestContext.get('user') as Worker;

        if ((await opts.db.query('SELECT 1 FROM branch WHERE id = $1', [
            request.params.branch_id])).rowCount === 0) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }

        if ((await opts.db.query('SELECT 1 FROM storage_type WHERE id = $1', [
            request.body.storage_type_id])).rowCount === 0) {
            reply.statusCode = 404;
            return {
                error: 'STORAGE_TYPE_NOT_FOUND'
            };
        }

        const qr = await generateQr(opts.db, 'branch_shelfs');

        if (!qr) {
            reply.statusCode = 500;
            return {
                error: 'INTERNAL_SERVER_ERROR'
            };
        }

        await opts.db.query('INSERT INTO branch_shelfs VALUES(default, $1, $2, $3, true, $4, default, $5)', [
            request.params.branch_id,
            request.body.name,
            request.body.storage_type_id,
            SHA256(qr).toString(),
            user.id
        ]);

        return {
            qr
        };
    }));
}

export const autoPrefix = '/crm/branch/:branch_id/shelf';