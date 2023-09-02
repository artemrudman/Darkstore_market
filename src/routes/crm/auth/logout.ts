import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { TokenInterface, jwtVerify } from '../../../utils/jwtUtils';

async function post(request: FastifyRequest, reply: FastifyReply) {
    if (!request.cookies.token) {
        reply.statusCode = 401;
        return {
            error: 'UNAUTHORIZED'
        };
    }

    let decoded;

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

    const redis = request.requestContext.get('redis');

    await redis.set(request.cookies.token, '', {
        EX: decoded.exp - Math.floor(Date.now() / 1000) + 1
    });

    return;
}



export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', post);
}

export const autoPrefix = '/crm/auth/logout';