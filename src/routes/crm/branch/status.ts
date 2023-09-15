import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_MANAGER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/types';
import { BranchTable } from '../../../models/tables/branch';

async function post(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Body: {
        status: number;
    }
}>, reply: FastifyReply){
    const user = request.reqData.user as unknown as Worker;

    if (user.branch_id !== request.params.branch_id) {
        return {
            error: 'FORBIDDEN'
        };
    }

    const branchTable = new BranchTable(request.reqData.pgClient);
    
    if (!(await branchTable.hasId(request.params.branch_id))) {
        return {
            error: 'BRANCH_NOT_FOUND'
        };
    }

    await branchTable.updateStatus(request.params.branch_id, request.body.status);

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