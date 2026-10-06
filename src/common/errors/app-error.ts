import { ErrorCode, ErrorCodes } from './error-codes';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly fields?: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.fields = fields;
  }

  static validation(message: string, fields: Record<string, string>): AppError {
    return new AppError(ErrorCodes.VALIDATION_ERROR, message, 422, fields);
  }

  static notFound(message: string): AppError {
    return new AppError(ErrorCodes.NOT_FOUND, message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCodes.CONFLICT, message, 409);
  }

  static badRequest(message: string, fields?: Record<string, string>): AppError {
    return new AppError(ErrorCodes.BAD_REQUEST, message, 400, fields);
  }

  static internal(message = 'An unexpected error occurred.'): AppError {
    return new AppError(ErrorCodes.INTERNAL_ERROR, message, 500);
  }
}
