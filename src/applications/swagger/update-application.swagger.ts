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

export const updateApplicationSwagger: ApiDocsSpec = {
  operation: {
    summary: 'Update application draft',
    description: 'Partially updates application data. Submitted applications cannot be edited.',
  },
  params: [{ name: 'id', description: 'Application id' }],
  headers: [
    {
      name: 'X-Mock-Scenario',
      required: false,
      description: 'Optional mock scenario: normal | slow | server-error | validation-error | conflict',
    },
  ],
  body: {
    description: 'Partial application payload under data',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object', additionalProperties: true },
      },
    },
  },
  responses: {
    200: { description: 'Updated application' },
    400: { description: 'Invalid body', schema: errorSchema },
    404: { description: 'Not found', schema: errorSchema },
    409: { description: 'Conflict — submitted application', schema: errorSchema },
    500: { description: 'Simulated or unexpected server error', schema: errorSchema },
  },
};
