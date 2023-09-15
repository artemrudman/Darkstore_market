import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { setJwtCookie } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_TECHNICAL_SUPPORT, USER_WORKER } from '../../../utils/constants';
import { WorkerTable } from '../../../models/tables/worker';
// TODO: Сделать авторизацию по телефону

async function post(request: FastifyRequest<{
    Body: {
        email: string;
    }
}>, reply: FastifyReply) {
    const workerTable = new WorkerTable(request.reqData.pgClient);
    const user = await workerTable.getByEmail(request.body.email);
    
    if (!user) {
        return {
            error: 'INVALID_CREDENTIALS'
        };
    }

    if (user.is_disabled) {
        return {
            error: 'USER_DISABLED'
        };
    }

    if (![ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_SUPPORT].includes(user.role_id)) {
        return {
            error: 'FORBIDDEN'
        };
    }

    return await setJwtCookie(user.id, USER_WORKER, reply);
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'
                    }
                }
            }
        }
    }, post);
}

export const autoPrefix = '/crm/auth/login';