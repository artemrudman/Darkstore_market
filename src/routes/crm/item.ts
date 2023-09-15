import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../utils/jwtUtils';
import { ROLE_TECHNICAL_DIRECTOR, ROLE_TECHNICAL_SUPPORT, USER_WORKER } from '../../utils/constants';
import { Worker } from '../../models/types';
import { ProductTypeTable } from '../../models/tables/productType';
import { StorageTypeTable } from '../../models/tables/storageType';
import { ItemTable } from '../../models/tables/item';

async function post(request: FastifyRequest<{
    Body: {
        name: string;
        description: string;
        ingredients: string;
        weight: number;
        product_type_id: number;
        storage_type_id: number;
        barcode: string;
    }
}>, reply: FastifyReply){
    const user = request.reqData.user as unknown as Worker;
    const productTypeTable = new ProductTypeTable(request.reqData.pgClient);

    if (!(await productTypeTable.hasId(request.body.product_type_id))) {
        return {
            error: 'PRODUCT_TYPE_NOT_FOUND'
        };
    }

    const storageTypeTable = new StorageTypeTable(request.reqData.pgClient);

    if (!(await storageTypeTable.hasId(request.body.storage_type_id))) {
        return {
            error: 'STORAGE_TYPE_NOT_FOUND'
        };
    }

    const itemTable = new ItemTable(request.reqData.pgClient);

    if (await itemTable.hasBarcode(request.body.barcode)) {
        return {
            error: 'BARCODE_ALREADY_USED'
        };
    }

    await itemTable.create(request.body.name, request.body.description, request.body.ingredients,
        request.body.weight, request.body.product_type_id, request.body.storage_type_id, 'PICTURE UUID',
        request.body.barcode, user.id);

    return;
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                // TODO: Add schema
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_TECHNICAL_SUPPORT]
    }, post));
}

export const autoPrefix = '/crm/item';