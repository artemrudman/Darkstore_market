import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

async function post(request: FastifyRequest<{
    Body: {
        name: string;
    }
}>, reply: FastifyReply) {
    const db = request.requestContext.get('db');
    const user = request.requestContext.get('user') as Worker;

    await db.productType.create(request.body.name, user.id);

    return;
}

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z0-9 ]+$'
                    }
                }
            }
        }
    }, protect({
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, post));
}

export const autoPrefix = '/crm/type/product';