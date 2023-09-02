import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

async function get(request: FastifyRequest<{
    Params: {
        worker_id: number;
    }
}>, reply: FastifyReply) {
    const db = request.requestContext.get('db');
    const worker = await db.worker.getById(request.params.worker_id);

    if (!worker) {
        reply.statusCode = 404;
        return {
            error: 'NOT_FOUND'
        };
    }

    const user = request.requestContext.get('user') as Worker;

    if (user.role_id === ROLE_MANAGER && user.branch_id !== worker.branch_id) {
        reply.statusCode = 403;
        return {
            error: 'FORBIDDEN'
        };
    }

    return {
        id: worker.id,
        branch_id: worker.branch_id,
        name: worker.name,
        role_id: worker.role_id,
        status: worker.status,
        is_disabled: worker.is_disabled
    };
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.get('/', {
        schema: {
            params: {
                type: 'object',
                required: ['worker_id'],
                properties: {
                    worker_id: {
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
}

export const autoPrefix = '/crm/user/worker/:worker_id';