import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import { ROLE_EXECUTIVE_DIRECTOR, ROLE_TECHNICAL_DIRECTOR, USER_WORKER } from '../../../utils/constants';

/* {
    "branch_name": "Vienna Center",
      "barcode": 1234554321,
      "branch_location": "Vienna",
      "address": "Getreidemarkt 10, 1010 Wien, Austria",
      "timezone": "Vienna",
      "branch_status_id": 1,
      "work_hours": "Mon-Fri 7:00-22:00; Sat_Sun 8:00-21:00",
      "phone_number": "321-654-0987",
      "created_by_id": look at p.5,
      "updated_by_id": look at p.5,
} */


export default async function(app: FastifyInstance, opts: FastifyPluginOptions) {
    app.post('/', {
        schema: {
            body: {
                type: 'object',
                required: [],
                properties: {

                }
            }
        }
    }, protect(opts.db, {
        userType: [USER_WORKER],
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR]
    }, async (request: FastifyRequest<{
        Body: {

        }
    }>, reply: FastifyReply) => {

    }));
}

export const autoPrefix = '/crm/user/worker';
