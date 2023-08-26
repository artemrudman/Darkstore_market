import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyAutoload from '@fastify/autoload';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fastifyRequestContext from '@fastify/request-context';
import https from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

import ws from './ws/ws';

declare module '@fastify/request-context' {
    interface RequestContextData {
        user: null // TODO: Users models: Worker | User;
    }
}

function initDB() {
    return new Pool({
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT!),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
    });
}

async function run() {
    config();
    
    let https: https.ServerOptions | null = null;
    
    if (process.env.NODE_ENV === 'production') {
        https = {};
        https.key = readFileSync(join(__dirname, '..', 'tls', 'key.pem'));
        https.cert = readFileSync(join(__dirname, '..', 'tls', 'cert.pem'));
    }

    const app = fastify({
        logger: process.env.NODE_ENV !== 'production',
        https
    });
    const db = initDB();

    await app.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        extensions: ['html']
    });
    await app.register(fastifyAutoload, {
        dir: join(__dirname, 'routes'),
        options: {
            db
        }
    });
    await app.register(fastifyCookie);
    await app.register(fastifyRequestContext);
    await app.register(fastifyWebsocket);

    await app.register(ws, {
        db
    });
    
    try {
        await app.listen({
            host: '0.0.0.0',
            port: parseInt(process.env.PORT!)
        });

        console.log('Server started successfully!');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

run();