import { SocketStream } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';
import { JSONSchemaType } from 'ajv';

import { Vars } from '../../models/vars';

type Data = {
    param: number
};

export default async function(connection: SocketStream, request: FastifyRequest, vars: Vars, data: Data) {
    console.log('Start', data);
}

export const schema: JSONSchemaType<Data> = {
    type: 'object',
    required: ['param'],
    properties: {
        param: {
            type: 'number'
        }
    }
};
export const event = 'start';