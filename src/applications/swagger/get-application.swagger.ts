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

export const getApplicationSwagger: ApiDocsSpec = {
  operation: {
    summary: 'Get application',
    description: 'Returns the full application by id.',
  },
  params: [{ name: 'id', description: 'Application id (e.g. APP-10042)' }],
  headers: [
    {
      name: 'X-Mock-Scenario',
      required: false,
      description: 'Optional mock scenario: normal | slow | server-error | validation-error | conflict',
    },
  ],
  responses: {
    200: { description: 'Full application' },
    404: { description: 'Application not found', schema: errorSchema },
    500: { description: 'Simulated or unexpected server error', schema: errorSchema },
  },
};
