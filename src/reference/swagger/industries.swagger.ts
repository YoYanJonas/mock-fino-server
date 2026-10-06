import { ApiDocsSpec } from '../../common/decorators/api-docs.decorator';

export const industriesSwagger: ApiDocsSpec = {
  operation: {
    summary: 'List industries',
    description: 'Reference data for industry selects.',
  },
  headers: [
    {
      name: 'X-Mock-Scenario',
      required: false,
      description: 'Optional mock scenario',
    },
  ],
  responses: {
    200: {
      description: 'Industry list',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};
