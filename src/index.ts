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
import { createClient } from 'redis';
import { Pool } from 'pg';

import ws from './ws/ws';

declare module '@fastify/request-context' {
    interface RequestContextData {
        user: any;
        userType: number;
    }
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
    const db = new Pool({ connectionString: process.env.POSTGRES_URL });
    const redis = createClient({ url: process.env.REDIS_URL });

    await redis.connect();

    await app.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        extensions: ['html']
    });
    await app.register(fastifyAutoload, {
        dir: join(__dirname, 'routes'),
        options: {
            db,
            redis
        }
    });
    await app.register(fastifyCookie);
    await app.register(fastifyRequestContext);
    await app.register(fastifyWebsocket);

    await app.register(ws, {
        db,
        redis
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