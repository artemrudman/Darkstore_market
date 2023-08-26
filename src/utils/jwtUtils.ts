import { FastifyReply, FastifyRequest } from 'fastify';
import { verify, sign, SignOptions } from 'jsonwebtoken';
import { Pool } from 'pg';

interface TokenInterface {
    id: number;
    type: string;
}

type ProtectOptions = {
    userType?: string;
    role?: string;
};

async function jwtVerify(token: string) {
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

export async function setJwtCookie(id: Number, type: string, reply: FastifyReply) {
    const token = await jwtSign({ id, type }, {
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
        secure: process.env.NODE_ENV === 'production'
    });

    return;
}

// TODO: Add protect function