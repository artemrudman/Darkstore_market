import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { setJwtCookie } from '../../../utils/jwtUtils';
import { Worker } from '../../../models/worker';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_TECHNICAL_SUPPORT, USER_WORKER } from '../../../utils/constants';

// TODO: Сделать авторизацию по телефону

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
    }, async (request: FastifyRequest<{
        Body: {
            email: string;
        }
    }>, reply: FastifyReply) => {
        const user: Worker = (await opts.db.query('SELECT id, role_id, is_disabled FROM worker WHERE email = $1', [request.body.email])).rows[0];
        
        if (!user) {
            reply.statusCode = 401;
            return {
                error: 'INVALID_CREDENTIALS'
            };
        }

        if (user.is_disabled) {
            reply.statusCode = 401;
            return {
                error: 'USER_DISABLED'
            };
        }

        if (![ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_SUPPORT].includes(user.role_id)) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        return await setJwtCookie(user.id, USER_WORKER, reply);
    });
}

export const autoPrefix = '/crm/auth/login';
