import { SocketStream } from '@fastify/websocket';
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { readdirSync } from 'fs';
import { join } from 'path';
import { RawData } from 'ws';
import Ajv from 'ajv';

import { Vars } from '../models/vars';
import connected from './handlers/connected';
import disconnected from './handlers/disconnected';

export default async function(app: FastifyInstance, options: FastifyPluginOptions) {
    const handlersPath = join(__dirname, 'handlers');
    const handlers: Map<string, (connection: SocketStream, request: FastifyRequest, vars: Vars, data?: any) => Promise<void>>
         = new Map<string, (connection: SocketStream, request: FastifyRequest, vars: Vars, data?: any) => Promise<void>>();
    const ajv = new Ajv();

    for (const file of readdirSync(handlersPath).filter(file => file.endsWith('.ts'))) {
        const handler = await import(join(handlersPath, file));
        
        if (!handler.event) continue;

        ajv.addSchema(handler.schema, handler.event);
        handlers.set(handler.event, handler.default);
    }

    let vars: Vars = {
        db: options.db,
        redis: options.redis
    };

    app.get('/gateway', { websocket: true }, async (connection: SocketStream, request: FastifyRequest) => {
        await connected(connection, request, vars);

        connection.socket.on('message', async (data: RawData) => {
            let packet;
            
            try {
                packet = JSON.parse(data.toString());
            } catch {
                connection.socket.close();
                return;
            }
            
            if (typeof(packet) !== 'object' || typeof(packet.event) !== 'string') {
                connection.socket.close();
                return;
            }

            const handler = handlers.get(packet.event);

            if (!handler || !ajv.validate(packet.event, packet)) {
                connection.socket.close();
                return;
            }

            await handler(connection, request, vars, packet);
        });

        connection.socket.on('close', async () => { await disconnected(connection, request, vars); });
    });
}