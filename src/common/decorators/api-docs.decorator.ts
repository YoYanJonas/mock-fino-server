import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export interface ApiDocsQuery {
  name: string;
  required?: boolean;
  description?: string;
  type?: string;
  enum?: string[];
}

export interface ApiDocsParam {
  name: string;
  description?: string;
  type?: string;
}

export interface ApiDocsHeader {
  name: string;
  description?: string;
  required?: boolean;
}

export interface ApiDocsBody {
  description?: string;
  type?: Type<unknown> | string;
  schema?: Record<string, unknown>;
  required?: boolean;
}

export interface ApiDocsResponse {
  description: string;
  type?: Type<unknown>;
  schema?: Record<string, unknown>;
}

export interface ApiDocsSpec {
  operation: {
    summary: string;
    description?: string;
  };
  params?: ApiDocsParam[];
  queries?: ApiDocsQuery[];
  headers?: ApiDocsHeader[];
  body?: ApiDocsBody;
  responses: Record<number, ApiDocsResponse>;
}

export function ApiDocs(spec: ApiDocsSpec) {
  const decorators = [
    ApiOperation({
      summary: spec.operation.summary,
      description: spec.operation.description,
    }),
  ];

  for (const param of spec.params ?? []) {
    decorators.push(
      ApiParam({
        name: param.name,
        description: param.description,
        type: param.type ?? 'string',
      }),
    );
  }

  for (const query of spec.queries ?? []) {
    decorators.push(
      ApiQuery({
        name: query.name,
        required: query.required ?? false,
        description: query.description,
        type: query.type ?? 'string',
        enum: query.enum,
      }),
    );
  }

  for (const header of spec.headers ?? []) {
    decorators.push(
      ApiHeader({
        name: header.name,
        description: header.description,
        required: header.required ?? false,
      }),
    );
  }

  if (spec.body) {
    decorators.push(
      ApiBody({
        description: spec.body.description,
        required: spec.body.required ?? true,
        ...(spec.body.type ? { type: spec.body.type } : {}),
        ...(spec.body.schema ? { schema: spec.body.schema } : {}),
      }),
    );
  }

  for (const [status, response] of Object.entries(spec.responses)) {
    decorators.push(
      ApiResponse({
        status: Number(status),
        description: response.description,
        ...(response.type ? { type: response.type } : {}),
        ...(response.schema ? { schema: response.schema } : {}),
      }),
    );
  }

  return applyDecorators(...decorators);
}
