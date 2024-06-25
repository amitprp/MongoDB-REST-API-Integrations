import { FastifySchema } from 'fastify';

export const deleteSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id'],
    additionalProperties: false
  }
};
