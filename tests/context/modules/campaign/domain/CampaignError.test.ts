import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

import { CampaignError } from '@modules/campaign/domain/CampaignError';

describe('CampaignError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a domain error', () => {
    const error = new CampaignError('Invalid state transition');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should expose the business rule violation code', () => {
    const error = new CampaignError('Invalid state transition');

    expect(error.code).toBe(ErrorCode.BUSINESS_RULE_VIOLATION);
  });

  it('should expose the domain violation type', () => {
    const error = new CampaignError('Invalid state transition');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('should keep the original message', () => {
    const error = new CampaignError('Only draft campaigns can be scheduled');

    expect(error.message).toBe('Only draft campaigns can be scheduled');
  });

  it('should use the class name as error name', () => {
    const error = new CampaignError('boom');

    expect(error.name).toBe('CampaignError');
  });

  it('should be throwable and catchable as a domain error', () => {
    const throwError = (): never => {
      throw new CampaignError('boom');
    };

    expect(throwError).toThrow(CampaignError);
    expect(throwError).toThrow('boom');
  });
});
