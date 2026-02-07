import { ApplicationError } from '@shared/infrastructure/Error/ApplicationError';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';

export abstract class DatabaseError extends ApplicationError {
  readonly type = ErrorType.DATABASE;

  protected constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
