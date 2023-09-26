import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import {
  ROLE_EXECUTIVE_DIRECTOR,
  ROLE_TECHNICAL_DIRECTOR,
  USER_WORKER,
} from '../../../utils/constants';
import { Worker } from '../../../models/types';
import { ProductTypeTable } from '../../../models/tables/productType';

async function post(
  request: FastifyRequest<{
    Body: {
      name: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.reqData.user as unknown as Worker;
  const productTypeTable = new ProductTypeTable(request.reqData.pgClient);

  await productTypeTable.create(request.body.name, user.id);

  return;
}

export default async function (
  app: FastifyInstance,
  opts: FastifyPluginOptions
) {
  app.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              maxLength: 50,
              pattern: '^[a-zA-Z0-9 ]+$',
            },
          },
        },
      },
    },
    protect(
      {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR],
      },
      post
    )
  );
}

export const autoPrefix = '/crm/type/product';
