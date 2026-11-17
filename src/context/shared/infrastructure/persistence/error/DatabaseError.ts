import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export abstract class DatabaseError extends InfrastructureError {
  readonly type = ErrorType.DATABASE;
}
