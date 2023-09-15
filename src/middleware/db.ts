import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
// TODO: Optimize
async function db(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.addHook('preHandler', async (request, reply) => {
        const client = await opts.pg.connect();
        
        request.reqData = {
            pgClient: client,
            redisClient: opts.redis
        };
        
        await client.query('BEGIN');
    });
    app.addHook('onError', (request, reply, error, done) => {
        request.reqData.pgClient.query('ROLLBACK', done);
    });
    app.addHook('onSend', async (request, reply) => {
        try {
            await request.reqData.pgClient.query('COMMIT');
        } finally {
            request.reqData.pgClient.release();
        }
    });
}

export default fastifyPlugin(db, {
    fastify: '4.x',
    name: 'db'
});