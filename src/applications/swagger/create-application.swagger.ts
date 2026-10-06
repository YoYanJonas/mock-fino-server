import { ApiDocsSpec } from '../../common/decorators/api-docs.decorator';

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const createApplicationSwagger: ApiDocsSpec = {
  operation: {
    summary: 'Create application',
    description: 'Creates a new DRAFT application with empty data.',
  },
  headers: [
    {
      name: 'X-Mock-Scenario',
      required: false,
      description: 'Optional mock scenario: normal | slow | server-error | validation-error | conflict',
    },
  ],
  body: {
    required: false,
    description: 'Optional empty body',
    schema: { type: 'object', additionalProperties: true },
  },
  responses: {
    201: { description: 'Created draft application' },
    500: { description: 'Simulated or unexpected server error', schema: errorSchema },
  },
};
