import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';

import { CampaignName } from '@modules/campaign/domain/CampaignName';

describe('CampaignName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a name with the given value', () => {
    const name = CampaignName.create('Winter Campaign');

    expect(name.value).toBe('Winter Campaign');
  });

  it('should trim the surrounding whitespace', () => {
    const name = CampaignName.create('  Winter Campaign  ');

    expect(name.value).toBe('Winter Campaign');
  });

  it('should throw a ValidationError when the value is empty', () => {
    expect(() => CampaignName.create('')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value only contains whitespace', () => {
    expect(() => CampaignName.create('    ')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value has less than two characters', () => {
    expect(() => CampaignName.create('a')).toThrow(ValidationError);
  });

  it('should accept a value with exactly two characters', () => {
    const name = CampaignName.create('ab');

    expect(name.value).toBe('ab');
  });

  it('should accept a value with exactly fifty characters', () => {
    const name = CampaignName.create('a'.repeat(50));

    expect(name.value).toHaveLength(50);
  });

  it('should throw a ValidationError when the value exceeds fifty characters', () => {
    expect(() => CampaignName.create('a'.repeat(51))).toThrow(ValidationError);
  });

  it('should be equal to another name with the same value', () => {
    const first = CampaignName.create('Winter Campaign');
    const second = CampaignName.create('Winter Campaign');

    expect(first.equals(second)).toBe(true);
  });

  it('should not be equal to another name with a different value', () => {
    const first = CampaignName.create('Winter Campaign');
    const second = CampaignName.create('Summer Campaign');

    expect(first.equals(second)).toBe(false);
  });
});
