import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export abstract class DatabaseError extends ApplicationError {
  readonly type = ErrorType.DATABASE;

  protected constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
