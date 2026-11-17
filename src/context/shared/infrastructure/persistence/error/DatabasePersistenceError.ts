import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { DatabaseError } from '@shared/infrastructure/persistence/error/DatabaseError';

export class DatabasePersistenceError extends DatabaseError {
  readonly type = ErrorType.DATABASE;
  readonly code = ErrorCode.DB_TRANSACTION_FAILED;
}
