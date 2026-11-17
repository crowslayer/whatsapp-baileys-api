import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

describe('PhoneNormalizer', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('normalizes valid Mexican numbers and preserves valid JIDs', () => {
    // Arrange
    const normalizer = new PhoneNormalizer();

    // Act
    const normalized = normalizer.normalize('5512345678');
    const jid = normalizer.toJid('5512345678');
    const existingJid = normalizer.toJid('12345@g.us');

    // Assert
    expect(normalized).toBe('5215512345678');
    expect(jid).toBe('5215512345678@s.whatsapp.net');
    expect(existingJid).toBe('12345@g.us');
  });

  it('returns null for invalid values', () => {
    // Arrange
    const normalizer = new PhoneNormalizer();

    // Act
    const normalized = normalizer.normalize('not a phone');
    const jid = normalizer.toJid('not a phone');

    // Assert
    expect(normalized).toBeNull();
    expect(jid).toBeNull();
  });
});
