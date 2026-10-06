import { ApiDocsSpec } from '../../common/decorators/api-docs.decorator';

export const countriesSwagger: ApiDocsSpec = {
  operation: {
    summary: 'List countries',
    description: 'Reference data for country selects.',
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
      description: 'Country list',
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
