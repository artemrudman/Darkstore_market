import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyAutoload from '@fastify/autoload';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import { join } from 'path';
import { config } from 'dotenv';
import { RedisClientType, RedisFunctions, RedisModules, RedisScripts, createClient } from 'redis';

import { User } from './models/types';
import { Worker } from 'cluster';
import { Pool, PoolClient } from 'pg';
import db from './middleware/db';

declare module 'fastify' {
    interface FastifyRequest {
        reqData: {
            user?: User | Worker;
            pgClient: PoolClient;
            redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
        }
    }
};

async function run() {
    config();

    const redis = createClient({ url: process.env.REDIS_URL });
    const pg = new Pool({ connectionString: process.env.POSTGRES_URL });

    await redis.connect();

    const app = fastify({
        logger: process.env.NODE_ENV !== 'production'
    });

    await app.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        extensions: ['html']
    });
    await app.register(fastifyAutoload, {
        dir: join(__dirname, 'routes')
    });
    await app.register(fastifyCookie);
    await app.register(db, {
        pg,
        redis
    });
    await app.register(fastifyWebsocket);

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