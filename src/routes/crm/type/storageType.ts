import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z0-9 ]+$'
                    }
                }
            }
        }
    }, protect(opts.db, opts.redis, {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, async (request: FastifyRequest<{
        Body: {
            name: string;
        }
    }>, reply: FastifyReply) => {
        const user = request.requestContext.get('user') as Worker;

        await opts.db.query('INSERT INTO storage_type VALUES(default, $1, default, $2)', [
            request.body.name,
            user.id
        ]);

        return;
    }));
}

export const autoPrefix = '/crm/type/storage';