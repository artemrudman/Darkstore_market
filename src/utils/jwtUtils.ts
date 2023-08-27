import { FastifyReply, FastifyRequest } from 'fastify';
import { verify, sign, SignOptions } from 'jsonwebtoken';
import { Pool } from 'pg';

import { USER_CLIENT, USER_WORKER } from './constants';
import { Worker } from '../models/worker';
import { User } from '../models/user';

interface TokenInterface {
    i: number;
    t: number;
}

type ProtectOptions = {
    userType: number;
    role?: number[]
};

export async function jwtVerify(token: string) {
    return new Promise((resolve, reject) => {
        verify(token, process.env.JWT_SECRET!, (err, decoded) => {
            if (err) return reject(err);

            resolve(decoded);
        });
    });
}

async function jwtSign(payload: object, options: SignOptions) {
    return new Promise((resolve, reject) => {
        sign(payload, process.env.JWT_SECRET!, options, (err, encoded) => {
            if (err) return reject(err);

            resolve(encoded);
        });
    });
}

export async function setJwtCookie(id: number, type: number, reply: FastifyReply) {
    const token = await jwtSign({ i: id, t: type }, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    if (typeof(token) !== 'string') {
        reply.statusCode = 500;
        return {
            error: 'INTERNAL_SERVER_ERROR'
        };
    }

    reply.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000 * 24 * parseInt(process.env.JWT_COOKIE_EXPIRES_IN!),
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });

    return;
}

export function protect(db: Pool, options: ProtectOptions, next: any) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
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
        
        if (options.userType && options.userType !== decoded.t) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        let user;

        if (decoded.t === USER_CLIENT) {
            user = (await db.query('SELECT * FROM user_ WHERE id = $1', [decoded.i])).rows[0] as User;
        } else if (decoded.t === USER_WORKER) {
            user = (await db.query('SELECT * FROM worker WHERE id = $1', [decoded.i])).rows[0] as Worker;

            if (user && options.role && !options.role.includes(user.role_id)) {
                reply.statusCode = 403;
                return {
                    error: 'FORBIDDEN'
                };
            }
        } else {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        if (!user || user.is_disabled) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        request.requestContext.set('user', user);
        request.requestContext.set('userType', decoded.t);

        return await next(request, reply);
    };
}