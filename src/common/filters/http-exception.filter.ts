import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          ...(exception.fields ? { fields: exception.fields } : {}),
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : typeof body === 'object' && body !== null && 'message' in body
            ? Array.isArray((body as { message: unknown }).message)
              ? ((body as { message: string[] }).message).join(', ')
              : String((body as { message: unknown }).message)
            : exception.message;

      response.status(status).json({
        error: {
          code:
            status === HttpStatus.NOT_FOUND
              ? ErrorCodes.NOT_FOUND
              : status === HttpStatus.CONFLICT
                ? ErrorCodes.CONFLICT
                : status >= 500
                  ? ErrorCodes.INTERNAL_ERROR
                  : ErrorCodes.BAD_REQUEST,
          message,
        },
      });
      return;
    }

    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred.',
      },
    });
  }
}
