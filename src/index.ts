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
import { RedisClientType, RedisFunctions, RedisModules, RedisScripts, createClient } from 'redis';

import ws from './ws/ws';
import { DB } from './models/db';

declare module '@fastify/request-context' {
    interface RequestContextData {
        user?: any;
        userType?: number;
        db: DB;
        redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    }

    interface RequestContext {
        get<K extends keyof RequestContextData>(key: K): RequestContextData[K];
    }
}

async function run() {
    config();

    const db = new DB();
    const redis = createClient({ url: process.env.REDIS_URL });

    await redis.connect();
    
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

    await app.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        extensions: ['html']
    });
    await app.register(fastifyAutoload, {
        dir: join(__dirname, 'routes')
    });
    await app.register(fastifyCookie);
    await app.register(fastifyRequestContext, {
        defaultStoreValues: {
            db,
            redis
        }
    });
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