import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { CampaignId } from '@modules/campaign/domain/CampaignId';

const VALID_UUID = '9c858901-8a57-4791-81fe-4c455b099bc9';

describe('CampaignId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a random uuid v7 identifier', () => {
    const id = CampaignId.create();

    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should create two different identifiers', () => {
    const first = CampaignId.create();
    const second = CampaignId.create();

    expect(first.value).not.toBe(second.value);
  });

  it('should build an identifier from a valid uuid string', () => {
    const id = CampaignId.fromString(VALID_UUID);

    expect(id.value).toBe(VALID_UUID);
  });

  it('should throw a ValidationError when the value is empty', () => {
    expect(() => CampaignId.fromString('')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value only contains spaces', () => {
    expect(() => CampaignId.fromString('   ')).toThrow(ValidationError);
  });

  it('should throw an InvalidArgumentError when the value is not a uuid', () => {
    expect(() => CampaignId.fromString('not-a-uuid')).toThrow(InvalidArgumentError);
  });

  it('should be equal to another identifier with the same value', () => {
    const first = CampaignId.fromString(VALID_UUID);
    const second = CampaignId.fromString(VALID_UUID);

    expect(first.equals(second)).toBe(true);
  });

  it('should not be equal to an identifier with a different value', () => {
    const first = CampaignId.fromString(VALID_UUID);
    const second = CampaignId.fromString('3f2504e0-4f89-41d3-9a0c-0305e82c3301');

    expect(first.equals(second)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const id = CampaignId.fromString(VALID_UUID);

    expect(id.equals(undefined as unknown as CampaignId)).toBe(false);
  });
});
