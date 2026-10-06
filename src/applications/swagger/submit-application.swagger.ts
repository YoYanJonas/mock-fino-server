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
    },
  },
};

export const submitApplicationSwagger: ApiDocsSpec = {
  operation: {
    summary: 'Submit application',
    description: 'Validates full business rules and marks the application as SUBMITTED.',
  },
  params: [{ name: 'id', description: 'Application id' }],
  headers: [
    {
      name: 'X-Mock-Scenario',
      required: false,
      description: 'Optional mock scenario: normal | slow | server-error | validation-error | conflict',
    },
  ],
  responses: {
    200: { description: 'Submitted application' },
    404: { description: 'Not found', schema: errorSchema },
    409: { description: 'Already submitted', schema: errorSchema },
    422: { description: 'Validation failed', schema: errorSchema },
    500: { description: 'Simulated or unexpected server error', schema: errorSchema },
  },
};
