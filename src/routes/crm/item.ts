import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../utils/jwtUtils';
import { ROLE_TECHNICAL_DIRECTOR, ROLE_TECHNICAL_SUPPORT, USER_WORKER } from '../../utils/constants';
import { Worker } from '../../models/worker';

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
    const db = request.requestContext.get('db');
    const user = request.requestContext.get('user') as Worker;

    if (!(await db.productType.hasId(request.body.product_type_id))) {
        reply.statusCode = 404;
        return {
            error: 'PRODUCT_TYPE_NOT_FOUND'
        };
    }
    if (!(await db.storageType.hasId(request.body.storage_type_id))) {
        reply.statusCode = 404;
        return {
            error: 'STORAGE_TYPE_NOT_FOUND'
        };
    }

    if (await db.item.hasBarcode(request.body.barcode)) {
        reply.statusCode = 409;
        return {
            error: 'BARCODE_ALREADY_USED'
        };
    }

    await db.item.create(request.body.name, request.body.description, request.body.ingredients,
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