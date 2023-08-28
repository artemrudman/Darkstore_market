import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { SHA256 } from 'crypto-js';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_DELIVERYMAN, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_WAREHOUSE_WORKER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';
import { generateQr } from '../../../utils/qr';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.get('/list', {
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
            querystring: {
                type: 'object',
                required: ['page'],
                properties: {
                    page: {
                        type: 'number',
                        minimum: 0
                    }
                }
            }
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Params: {
            branch_id: number;
        },
        Querystring: {
            page: number;
        }
    }>, reply: FastifyReply) => {
        if ((await opts.db.query('SELECT 1 FROM branch WHERE id = $1', [
            request.params.branch_id])).rowCount === 0) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }

        const user = request.requestContext.get('user') as Worker;

        if (user.role_id === ROLE_MANAGER && user.branch_id !== request.params.branch_id) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        return (await opts.db.query('SELECT id, branch_id, name, role_id, status, is_disabled FROM worker LIMIT 15 OFFSET $1', [
            request.query.page * 15
        ])).rows;
    }));

    app.get('/:worker_id', {
        schema: {
            params: {
                type: 'object',
                required: ['branch_id', 'worker_id'],
                properties: {
                    branch_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    },
                    worker_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    }
                }
            },
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Params: {
            branch_id: number;
            worker_id: number;
        }
    }>, reply: FastifyReply) => {
        if ((await opts.db.query('SELECT 1 FROM branch WHERE id = $1', [
            request.params.branch_id])).rowCount === 0) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }

        const user = request.requestContext.get('user') as Worker;

        if (user.role_id === ROLE_MANAGER && user.branch_id !== request.params.branch_id) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        const worker = (await opts.db.query('SELECT id, branch_id, name, role_id, status, is_disabled FROM worker WHERE id = $1', [
            request.params.worker_id
        ])).rows[0];

        if (!worker) {
            reply.statusCode = 404;
            return {
                error: 'NOT_FOUND'
            };
        }

        return worker;
    }));

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
                required: ['name', 'email', 'phone_number', 'role_id'],
                properties: {
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
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Params: {
            branch_id: number;
        },
        Body: {
            name: string;
            email: string;
            phone_number: string;
            role_id: number;
        }
    }>, reply: FastifyReply) => {
        const user = request.requestContext.get('user') as Worker;
        
        if (user.role_id === ROLE_MANAGER && 
            (![ROLE_WAREHOUSE_WORKER, ROLE_DELIVERYMAN].includes(request.body.role_id)
                || user.branch_id !== request.params.branch_id)) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        if ((await opts.db.query('SELECT 1 FROM branch WHERE id = $1', [
            request.params.branch_id])).rowCount === 0) {
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
            request.params.branch_id,
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

export const autoPrefix = '/crm/branch/:branch_id/worker';