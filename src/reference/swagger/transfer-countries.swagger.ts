import { ApiDocsSpec } from '../../common/decorators/api-docs.decorator';

export const transferCountriesSwagger: ApiDocsSpec = {
  operation: {
    summary: 'List transfer countries',
    description: 'Reference data for international transfer country multiselect.',
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
      description: 'Transfer country list',
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
