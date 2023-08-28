import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { TokenInterface, jwtVerify } from '../../../utils/jwtUtils';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.cookies.token) {
            reply.statusCode = 401;
            return {
                error: 'UNAUTHORIZED'
            };
        }

        let decoded: TokenInterface;

        try {
            decoded = await jwtVerify(request.cookies.token) as TokenInterface;
        } catch {
            reply.statusCode = 401;
            return {
                error: 'UNAUTHORIZED'
            };
        }

        reply.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });

        await opts.redis.set(request.cookies.token, '', {
            EX: decoded.exp - Math.floor(Date.now() / 1000) + 1
        });

        return;
    });
}

export const autoPrefix = '/crm/auth/logout';
