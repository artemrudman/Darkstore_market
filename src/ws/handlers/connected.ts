import { SocketStream } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

import { Vars } from '../../models/vars';

export default async function(connection: SocketStream, request: FastifyRequest, vars: Vars) {
    console.log('Connected');
}
