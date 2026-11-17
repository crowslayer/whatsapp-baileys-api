import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class EventSubscriberNotFoundError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.EVENT_SUBSCRIPTION_FAILED;
}
