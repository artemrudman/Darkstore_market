import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { compare } from 'bcrypt';

import { jwtVerify, setJwtCookie } from '../../../utils/jwtUtils';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'
                    },
                    password: {
                        type: 'string',
                        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@#$%^&+=]{8,64}$'
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{
        Body: {
            email: string;
            password: string;
        }
    }>, reply: FastifyReply) => {
        if (request.cookies.token) {
            try {
                await jwtVerify(request.cookies.token); 
                
                reply.statusCode = 409;
                return {
                    error: 'ALREADY_AUTHORIZED'
                };
            } catch {
            }
        }

        const client = (await opts.db.query('SELECT * FROM worker WHERE email = $1', [request.body.email]))[0];

        if (!client || !(await compare(request.body.password, client.password))) {
            reply.statusCode = 401;
            return {
                error: 'INVALID_CREDENTIALS'
            };
        }

        return await setJwtCookie(client.id, 'crm', reply);
    });
}

export const autoPrefix = '/crm/auth/login';
