import { normalizeBulk } from '../../../../src/shared/infrastructure/utils/normalizeBulk';

describe('normalizeBulk', () => {
  test('returns valid numbers as jids and empty invalid array for all-valid input', () => {
    const result = normalizeBulk(['+525512345678', '+528112345678']);
    expect(result.valid).toEqual(['5215512345678@s.whatsapp.net', '5218112345678@s.whatsapp.net']);
    expect(result.invalid).toEqual([]);
  });

  test('returns empty valid array and all numbers as invalid for all-invalid input', () => {
    const result = normalizeBulk(['not-a-number', 'also-invalid']);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(['not-a-number', 'also-invalid']);
  });

  test('deduplicates valid numbers', () => {
    const result = normalizeBulk(['+525512345678', '+525512345678']);
    expect(result.valid).toHaveLength(1);
    expect(result.valid).toEqual(['5215512345678@s.whatsapp.net']);
  });

  test('mixed valid and invalid numbers', () => {
    const result = normalizeBulk(['+525512345678', 'invalid', '+528112345678', 'bad']);
    expect(result.valid).toEqual(['5215512345678@s.whatsapp.net', '5218112345678@s.whatsapp.net']);
    expect(result.invalid).toEqual(['invalid', 'bad']);
  });

  test('empty input returns empty arrays', () => {
    const result = normalizeBulk([]);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });
});
