import { FastifySchema } from 'fastify';

export const filterSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      portal_name: { type: 'string' },
      buyer: { type: 'string' },
      status: {
        type: 'string',
        enum: ['Approved', 'Pending Approval', 'Paid', 'Rejected', 'Canceled']
      },
      start_date: { type: 'string', format: 'date-time' },
      end_date: { type: 'string', format: 'date-time' },
      min_total: { type: 'number' },
      max_total: { type: 'number' }
    },
    additionalProperties: true,
    required: []
  }
};
