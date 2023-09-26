import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import { protect } from '../../../utils/jwtUtils';
import {
  ROLE_DELIVERYMAN,
  ROLE_EXECUTIVE_DIRECTOR,
  ROLE_MANAGER,
  ROLE_TECHNICAL_DIRECTOR,
  ROLE_WAREHOUSE_WORKER,
  USER_WORKER,
} from '../../../utils/constants';
import { Worker } from '../../../models/types';
import { generateQr } from '../../../utils/qr';
import { BranchTable } from '../../../models/tables/branch';
import { WorkerTable } from '../../../models/tables/worker';

async function getList(
  request: FastifyRequest<{
    Params: {
      branch_id: number;
    };
    Querystring: {
      page: number;
      role_id?: number;
    };
  }>,
  reply: FastifyReply
) {
  const branchTable = new BranchTable(request.reqData.pgClient);

  if (!(await branchTable.hasId(request.params.branch_id))) {
    return { error: 'BRANCH_NOT_FOUND' };
  }

  const user = request.reqData.user as unknown as Worker;

  if (
    user.role_id === ROLE_MANAGER &&
    user.branch_id !== request.params.branch_id
  ) {
    return { error: 'FORBIDDEN' };
  }

  const workerTable = new WorkerTable(request.reqData.pgClient);

  return await workerTable.getList(
    request.params.branch_id,
    request.query.page,
    request.query.role_id
  );
}

async function get(
  request: FastifyRequest<{
    Params: {
      worker_id: number;
    };
  }>,
  reply: FastifyReply
) {
  const workerTable = new WorkerTable(request.reqData.pgClient);
  const worker = await workerTable.getById(request.params.worker_id);

  if (!worker) {
    return { error: 'WORKER_NOT_FOUND' };
  }

  const user = request.reqData.user as unknown as Worker;

  if (user.role_id === ROLE_MANAGER && user.branch_id !== worker.branch_id) {
    return { error: 'FORBIDDEN' };
  }

  return {
    id: worker.id,
    branch_id: worker.branch_id,
    name: worker.name,
    role_id: worker.role_id,
    status: worker.status,
    is_disabled: worker.is_disabled,
  };
}

async function post(
  request: FastifyRequest<{
    Params: {
      branch_id: number;
    };
    Body: {
      name: string;
      email: string;
      phone_number: string;
      role_id: number;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.reqData.user as unknown as Worker;

  if (
    user.role_id === ROLE_MANAGER &&
    (![ROLE_WAREHOUSE_WORKER, ROLE_DELIVERYMAN].includes(
      request.body.role_id
    ) ||
      user.branch_id !== request.params.branch_id)
  ) {
    return { error: 'FORBIDDEN' };
  }

  const branchTable = new BranchTable(request.reqData.pgClient);

  if (!(await branchTable.hasId(request.params.branch_id))) {
    return { error: 'BRANCH_NOT_FOUND' };
  }

  const workerTable = new WorkerTable(request.reqData.pgClient);
  const qr = await generateQr(workerTable);

  if (!qr) {
    return { error: 'INTERNAL_SERVER_ERROR' };
  }

  await workerTable.create(
    request.params.branch_id,
    request.body.name,
    request.body.email,
    request.body.phone_number,
    request.body.role_id,
    qr,
    user.id
  );

  return { qr };
}

export default async function (
  app: FastifyInstance,
  opts: FastifyPluginOptions
) {
  app.get(
    '/:branch_id/worker/list',
    {
      schema: {
        params: {
          type: 'object',
          required: ['branch_id'],
          properties: {
            branch_id: {
              type: 'number',
              minimum: 1,
              maximum: 2147483647,
            },
          },
        },
        querystring: {
          type: 'object',
          required: ['page'],
          properties: {
            page: {
              type: 'number',
              minimum: 0,
            },
            role_id: {
              type: 'number',
              minimum: 0,
              maximum: 6,
            },
          },
        },
      },
    },
    protect(
      {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER],
      },
      getList
    )
  );

  app.get(
    '/worker/:worker_id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['worker_id'],
          properties: {
            worker_id: {
              type: 'number',
              minimum: 1,
              maximum: 2147483647,
            },
          },
        },
      },
    },
    protect(
      {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER],
      },
      get
    )
  );

  app.post(
    '/:branch_id/worker',
    {
      schema: {
        params: {
          type: 'object',
          required: ['branch_id'],
          properties: {
            branch_id: {
              type: 'number',
              minimum: 1,
              maximum: 2147483647,
            },
          },
        },
        body: {
          type: 'object',
          required: ['name', 'email', 'phone_number', 'role_id'],
          properties: {
            name: {
              type: 'string',
              maxLength: 50,
              pattern: '^[a-zA-Z ]+$',
            },
            email: {
              type: 'string',
              maxLength: 50,
              pattern:
                "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
            },
            phone_number: {
              type: 'string',
              maxLength: 16,
              pattern: '^\\d+$',
            },
            role_id: {
              type: 'number',
              minimum: 0,
              maximum: 6,
            },
          },
        },
      },
    },
    protect(
      {
        userType: USER_WORKER,
        role: [ROLE_TECHNICAL_DIRECTOR, ROLE_EXECUTIVE_DIRECTOR, ROLE_MANAGER],
      },
      post
    )
  );
}

export const autoPrefix = '/crm/branch';
