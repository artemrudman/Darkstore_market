import { FastifyReply, FastifyRequest } from 'fastify';
import { verify, sign, SignOptions } from 'jsonwebtoken';

import { USER_CLIENT, USER_WORKER } from './constants';
import { Worker, User } from '../models/types';
import { UserTable } from '../models/tables/user';
import { WorkerTable } from '../models/tables/worker';

export interface TokenInterface {
    i: number;
    t: number;
    iat: number;
    exp: number;
};

type ProtectOptions = {
    userType: number;
    role?: number[];
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
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    if (typeof(token) !== 'string') {
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

export function protect(options: ProtectOptions,
    next: (request: FastifyRequest<any>, reply: FastifyReply) => Promise<any>) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.cookies.token) {
            return {
                error: 'UNAUTHORIZED'
            };
        }

        let decoded: TokenInterface;

        try {
            decoded = await jwtVerify(request.cookies.token) as TokenInterface;
        } catch {
            return {
                error: 'UNAUTHORIZED'
            };
        }

        if (await request.reqData.redisClient.get(request.cookies.token) !== null) {
            return {
                error: 'UNAUTHORIZED'
            };
        }
        
        if (options.userType && options.userType !== decoded.t) {
            return {
                error: 'FORBIDDEN'
            };
        }

        let user;

        if (decoded.t === USER_CLIENT) {
            const client = await (new UserTable(request.reqData.pgClient)).getById(decoded.i);

            if (!client) {
                return {
                    error: 'FORBIDDEN'
                };
            }

            user = client;
        } else if (decoded.t === USER_WORKER) {
            const worker = await (new WorkerTable(request.reqData.pgClient)).getById(decoded.i);
            
            if (!worker || (worker && options.role && !options.role.includes(worker.role_id))) {
                return {
                    error: 'FORBIDDEN'
                };
            }

            user = worker;
        } else {
            return {
                error: 'FORBIDDEN'
            };
        }

        if (!user || user.is_disabled) {
            return {
                error: 'FORBIDDEN'
            };
        }
        
        request.reqData.user = user;

        return await next(request, reply);
    };
}