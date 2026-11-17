import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class MongoInfrastructureError extends InfrastructureError {
  readonly code: ErrorCode;
  public readonly details: Record<string, unknown> | undefined;

  constructor(message: string, code: ErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
