import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/types';
import { generateQr } from '../../../utils/qr';
import { BranchTable } from '../../../models/tables/branch';
import { BranchShelfTable } from '../../../models/tables/branchShelf';
import { StorageTypeTable } from '../../../models/tables/storageType';

async function getList(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Querystring: {
        page: number;
    }
}>, reply: FastifyReply) {
    const branchTable = new BranchTable(request.reqData.pgClient);

    if (!(await branchTable.hasId(request.params.branch_id))) {
        return {
            error: 'BRANCH_NOT_FOUND'
        };
    }

    const user = request.reqData.user as unknown as Worker;

    if (user.role_id === ROLE_MANAGER && user.branch_id !== request.params.branch_id) {
        return {
            error: 'FORBIDDEN'
        };
    }

    const branchShelfTable = new BranchShelfTable(request.reqData.pgClient);

    return await branchShelfTable.getList(request.params.branch_id, request.query.page);
}



async function get(request: FastifyRequest<{
    Params: {
        shelf_id: number;
    }
}>, reply: FastifyReply) {
    const branchShelfTable = new BranchShelfTable(request.reqData.pgClient);
    const shelf = await branchShelfTable.getById(request.params.shelf_id);

    if (!shelf) {
        return {
            error: 'SHELF_NOT_FOUND'
        };
    }

    const user = request.reqData.user as unknown as Worker;

    if (user.role_id === ROLE_MANAGER && user.branch_id !== shelf.branch_id) {
        return {
            error: 'FORBIDDEN'
        };
    }

    return shelf;
}



async function post(request: FastifyRequest<{
    Params: {
        branch_id: number;
    },
    Body: {
        name: string;
        storage_type_id: number;
    }
}>, reply: FastifyReply){
    const user = request.reqData.user as unknown as Worker;
    const branchTable = new BranchTable(request.reqData.pgClient);

    if (!(await branchTable.hasId(request.params.branch_id))) {
        return {
            error: 'BRANCH_NOT_FOUND'
        };
    }

    const storageTypeTable = new StorageTypeTable(request.reqData.pgClient);

    if (!(await storageTypeTable.hasId(request.body.storage_type_id))) {
        return {
            error: 'STORAGE_TYPE_NOT_FOUND'
        };
    }

    const branchShelfTable = new BranchShelfTable(request.reqData.pgClient);
    const qr = await generateQr(branchShelfTable);

    if (!qr) {
        return {
            error: 'INTERNAL_SERVER_ERROR'
        };
    }

    await branchShelfTable.create(request.params.branch_id, request.body.name,
        request.body.storage_type_id, qr, user.id);

    return {
        qr
    };
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.get('/:branch_id/shelf/list', {
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
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, getList));

    app.get('/shelf/:shelf_id', {
        schema: {
            params: {
                type: 'object',
                required: ['shelf_id'],
                properties: {
                    worker_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    }
                }
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, get));

    app.post('/:branch_id/shelf', {
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
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, post));
}

export const autoPrefix = '/crm/branch';