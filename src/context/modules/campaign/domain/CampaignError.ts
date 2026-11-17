import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';

export class CampaignError extends DomainError {
  readonly code = ErrorCode.BUSINESS_RULE_VIOLATION;
}
