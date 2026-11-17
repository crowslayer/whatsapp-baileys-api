import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';

describe('CampaignNotFoundError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a domain error', () => {
    const error = new CampaignNotFoundError('Campaign not found');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should expose the resource not found code', () => {
    const error = new CampaignNotFoundError('Campaign not found');

    expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
  });

  it('should expose the domain violation type', () => {
    const error = new CampaignNotFoundError('Campaign not found');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('should keep the original message', () => {
    const error = new CampaignNotFoundError('Campaign not found');

    expect(error.message).toBe('Campaign not found');
  });

  it('should use the class name as error name', () => {
    const error = new CampaignNotFoundError('boom');

    expect(error.name).toBe('CampaignNotFoundError');
  });

  it('should be throwable and catchable', () => {
    const throwError = (): never => {
      throw new CampaignNotFoundError('Campaign not found');
    };

    expect(throwError).toThrow(CampaignNotFoundError);
    expect(throwError).toThrow('Campaign not found');
  });
});
