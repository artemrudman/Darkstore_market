import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_DELIVERYMAN, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER, ROLE_TECHNICAL_DIRECTOR, ROLE_WAREHOUSE_WORKER, USER_WORKER } from '../../../utils/constants';
import { Worker } from '../../../models/worker';

/* 

CREATE TABLE worker(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone_number VARCHAR(16) NOT NULL,
    qr_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,

        0. technical director
        1. executive director
        2. manager
        3. warehouse worker
        4. deliveryman
        5. technical support
        6. customer support

        status SMALLINT NOT NULL,

            Deliveryman: 
            0. available
            1. returning
            2. break
            3. handling over orders
            4. on the way to client
            5. picking up order
            Worker:
            0. available
            1. not available
            2. break
            3. collects and prepare order

        sale_promocode JSON NOT NULL,
        is_disabled BOOLEAN NOT NULL,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER NOT NULL
    );

*/


export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['branch_id', 'name', 'email', 'phone_number', 'role_id'],
                properties: {
                    branch_id: {
                        type: 'number',
                        minimum: 1,
                        maximum: 2147483647
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 50,
                        pattern: '^[a-zA-Z_ ]+$'
                    },
                    email: {
                        type: 'string',
                        maxLength: 50,
                        pattern: '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$'
                    },
                    phone_number: {
                        type: 'string',
                        maxLength: 16,
                        pattern: '^[0-9]+$'
                    },
                    role_id: {
                        type: 'number',
                        minimum: 0,
                        maximum: 6
                    }
                }
            }
        }
    }, protect(opts.db, {
        userType: [USER_WORKER],
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER]
    }, async (request: FastifyRequest<{
        Body: {
            branch_id: number;
            name: string;
            email: string;
            phone_number: string;
            role_id: number
        }
    }>, reply: FastifyReply) => {
        if (!(await opts.db.query('SELECT id FROM branch WHERE id = $1', [request.body.branch_id])).rows[0]) {
            reply.statusCode = 404;
            return {
                error: 'BRANCH_NOT_FOUND'
            };
        }

        const user = request.requestContext.get('user') as Worker;

        if (user.role_id === ROLE_MANAGER && (
            request.body.role_id !== ROLE_WAREHOUSE_WORKER
            && request.body.role_id !== ROLE_DELIVERYMAN)) {
            reply.statusCode = 403;
            return {
                error: 'FORBIDDEN'
            };
        }

        // TODO: Add query
    }));
}

export const autoPrefix = '/crm/user/worker';
