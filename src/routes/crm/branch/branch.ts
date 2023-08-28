import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { SHA256 } from 'crypto-js';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';
import { generateQr } from '../../../utils/qr';

function checkTimezone(timeZone: string) {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        throw new Error('Time zones are not available in this environment');
    }

    try {
        Intl.DateTimeFormat(undefined, {timeZone});
        
        return true;
    }
    catch {
        return false;
    }
}

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.get('/list', {
        schema: {
            querystring: {
                type: 'object',
                required: ['page'],
                properties: {
                    only_name: {
                        type: 'number',
                        enum: [0, 1]
                    },
                    page: {
                        type: 'number',
                        minimum: 0
                    }
                }
            }
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, async (request: FastifyRequest<{
        Querystring: {
            only_name?: number;
            page: number;
        }
    }>, reply: FastifyReply) => {
        if (request.query.only_name) {
            return (await opts.db.query('SELECT name FROM branch LIMIT 15 OFFSET $1', [
                request.query.page * 15
            ])).rows;
        }

        return (await opts.db.query('SELECT name, timezone FROM branch LIMIT 15 OFFSET $1', [
            request.query.page * 15
        ])).rows;
    }));

    app.get('/:branch_id', {
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
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Params: {
            branch_id: number;
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

        const branch = (await opts.db.query('SELECT id, name, address, timezone, phone_number, status FROM branch WHERE id = $1', [
            request.params.branch_id
        ])).rows[0];

        if (!branch) {
            reply.statusCode = 404;
            return {
                error: 'NOT_FOUND'
            };
        }

        return branch;
    }));

    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'address', 'timezone', 'phone_number'],
                properties: {
                    name: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z ]+$'
                    },
                    address: {
                        type: 'string',
                        maxLength: 100,
                        pattern: '^[a-zA-Z0-9\\s,.\'-]+$'
                    },
                    timezone: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 50
                    },
                    phone_number: {
                        type: 'string',
                        maxLength: 16,
                        pattern: '^\\d+$'
                    },
                }
            }
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, async (request: FastifyRequest<{
        Body: {
            name: string;
            address: string;
            timezone: string;
            phone_number: string;
        }
    }>, reply: FastifyReply) => {
        if (!checkTimezone(request.body.timezone)) {
            reply.statusCode = 400;
            return {
                error: 'BAD_REQUEST'
            };
        }

        const qr = await generateQr(opts.db, 'branch');

        if (!qr) {
            reply.statusCode = 500;
            return {
                error: 'INTERNAL_SERVER_ERROR'
            };
        }

        const user = request.requestContext.get('user') as Worker;

        await opts.db.query('INSERT INTO branch VALUES(default, $1, $2, $3, $4, 0, $5, default, $6)', [
            request.body.name,
            request.body.address,
            request.body.timezone,
            request.body.phone_number,
            SHA256(qr).toString(),
            user.id
        ]);

        return {
            qr
        };
    }));
}

export const autoPrefix = '/crm/branch';