import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { AppError } from '../errors/app-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value ?? {});
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
        if (!fields[path]) {
          fields[path] = issue.message;
        }
      }
      throw AppError.badRequest('Invalid request.', fields);
    }
    return result.data;
  }
}

export function ZodPipe(schema: ZodSchema) {
  return new ZodValidationPipe(schema);
}
