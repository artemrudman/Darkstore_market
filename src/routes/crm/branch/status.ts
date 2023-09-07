import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_MANAGER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

async function post(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Body: {
        status: number;
    }
}>, reply: FastifyReply){
    const db = request.requestContext.get('db');
    const user = request.requestContext.get('user') as Worker;

    if (user.branch_id !== request.params.branch_id) {
        reply.statusCode = 403;
        return {
            error: 'FORBIDDEN'
        };
    }
    
    if (!(await db.branch.hasId(request.params.branch_id))) {
        reply.statusCode = 404;
        return {
            error: 'BRANCH_NOT_FOUND'
        };
    }

    await db.branch.updateStatus(request.params.branch_id, request.body.status);

    return;
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/:branch_id/status', {
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
                required: ['status'],
                properties: {
                    status: {
                        type: 'number',
                        minimum: 0,
                        maximum: 3
                    }
                }
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_MANAGER]
    }, post));
}

export const autoPrefix = '/crm/branch';