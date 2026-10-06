import { ApiDocsSpec } from '../../common/decorators/api-docs.decorator';

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        fields: { type: 'object', additionalProperties: { type: 'string' } },
      },
      required: ['code', 'message'],
    },
  },
};

const mockHeader = {
  name: 'X-Mock-Scenario',
  required: false,
  description: 'Optional mock scenario: normal | slow | server-error | validation-error | conflict',
};

export const listApplicationsSwagger: ApiDocsSpec = {
  operation: {
    summary: 'List applications',
    description: 'Returns application summaries. Supports search and status filters.',
  },
  queries: [
    { name: 'search', required: false, description: 'Filter by business name or application id' },
    {
      name: 'status',
      required: false,
      description: 'Filter by status',
      enum: ['DRAFT', 'SUBMITTED'],
    },
  ],
  headers: [mockHeader],
  responses: {
    200: {
      description: 'Application list',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                businessName: { type: 'string', nullable: true },
                country: { type: 'string', nullable: true },
                currentStep: { type: 'number' },
                completionPercentage: { type: 'number' },
                lastUpdatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    400: { description: 'Invalid query', schema: errorSchema },
    500: { description: 'Simulated or unexpected server error', schema: errorSchema },
  },
};
