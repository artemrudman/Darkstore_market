import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

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

async function getList(request: FastifyRequest<{
    Querystring: {
        only_name?: number;
        page: number;
    }
}>, reply: FastifyReply) {
    const db = request.requestContext.get('db');

    return await db.branch.getList(request.query.page, !!request.query.only_name);
}

async function get(request: FastifyRequest<{
    Params: {
        branch_id: number;
    }
}>, reply: FastifyReply) {
    const user = request.requestContext.get('user') as Worker;

    if (user.role_id === ROLE_MANAGER && user.branch_id !== request.params.branch_id) {
        reply.statusCode = 403;
        return {
            error: 'FORBIDDEN'
        };
    }

    const db = request.requestContext.get('db');
    const branch = await db.branch.getById(request.params.branch_id);

    if (!branch) {
        reply.statusCode = 404;
        return {
            error: 'NOT_FOUND'
        };
    }

    return {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        timezone: branch.timezone,
        phone_number: branch.phone_number,
        status: branch.status,
        schedule: await db.branchSchedule.get(request.params.branch_id)
    };
}

async function post(request: FastifyRequest<{
    Body: {
        name: string;
        address: string;
        timezone: string;
        phone_number: string;
        schedule: string[];
    }
}>, reply: FastifyReply) {
    if (!checkTimezone(request.body.timezone)) {
        reply.statusCode = 400;
        return {
            error: 'BAD_REQUEST'
        };
    }

    const db = request.requestContext.get('db');
    const qr = await generateQr(db.branch);

    if (!qr) {
        reply.statusCode = 500;
        return {
            error: 'INTERNAL_SERVER_ERROR'
        };
    }

    const user = request.requestContext.get('user') as Worker;
    const branchId = await db.branch.create(request.body.name, request.body.address, request.body.timezone,
        request.body.phone_number, qr, user.id);
    
    await db.branchSchedule.create(branchId, request.body.schedule);
    
    return {
        qr
    };
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
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, getList));

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
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, get));

    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'address', 'timezone', 'phone_number', 'schedule'],
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
                    schedule: {
                        type: 'array',
                        minItems: 7,
                        maxItems: 7,
                        items: {
                            type: 'string',
                            pattern: '^((([01]\\d|2[0-3]):[0-5]\\d-(0[0-9]|1[0-9]|2[0-3]):[0-5]\\d)|Closed)$'
                        }
                    }
                }
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, post));
}

export const autoPrefix = '/crm/branch';