import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_DELIVERYMAN, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_WAREHOUSE_WORKER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';
import { generateQr } from '../../../utils/qr';

async function getList(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Querystring: {
        page: number;
        role_id?: number;
    }
}>, reply: FastifyReply) {
    const db = request.requestContext.get('db');

    if (!(await db.branch.hasId(request.params.branch_id))) {
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

    return await db.worker.getList(request.params.branch_id, request.query.page, request.query.role_id);
}



async function post(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Body: {
        name: string;
        email: string;
        phone_number: string;
        role_id: number;
    }
}>, reply: FastifyReply) {
    const user = request.requestContext.get('user') as Worker;
    
    if (user.role_id === ROLE_MANAGER && 
        (![ROLE_WAREHOUSE_WORKER, ROLE_DELIVERYMAN].includes(request.body.role_id)
            || user.branch_id !== request.params.branch_id)) {
        reply.statusCode = 403;
        return {
            error: 'FORBIDDEN'
        };
    }

    const db = request.requestContext.get('db');

    if (!(await db.branch.hasId(request.params.branch_id))) {
        reply.statusCode = 404;
        return {
            error: 'BRANCH_NOT_FOUND'
        };
    }

    const qr = await generateQr(db.worker);

    if (!qr) {
        reply.statusCode = 500;
        return {
            error: 'INTERNAL_SERVER_ERROR'
        };
    }

    await db.worker.create(request.params.branch_id, request.body.name, request.body.email,
        request.body.phone_number, request.body.role_id, qr, user.id);

    return {
        qr
    };
}



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
                    },
                    role_id: {
                        type: 'number',
                        minimum: 0,
                        maximum: 6
                    }
                }
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, getList));

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
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, post));
}

export const autoPrefix = '/crm/branch/:branch_id/worker';