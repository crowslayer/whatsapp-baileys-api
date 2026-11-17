import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { envBoolean, envList, envNumber, envSecurityType, envString } from '@shared/infrastructure/utils/EnvironmentParser';

describe('EnvironmentParser', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('parses configured number, string, boolean and list values', () => {
    // Arrange
    vi.stubEnv('TEST_NUMBER', '12.5');
    vi.stubEnv('TEST_STRING', 'value');
    vi.stubEnv('TEST_BOOL', 'true');
    vi.stubEnv('TEST_LIST', 'one, two,, three ');

    // Act
    const result = [envNumber('TEST_NUMBER'), envString('TEST_STRING'), envBoolean('TEST_BOOL'), envList('TEST_LIST')];

    // Assert
    expect(result).toEqual([12.5, 'value', true, ['one', 'two', 'three']]);
  });

  it('uses defaults and rejects missing or malformed values', () => {
    // Arrange
    vi.stubEnv('TEST_BAD_NUMBER', 'NaN');
    vi.stubEnv('TEST_BAD_BOOL', 'yes');

    // Act & Assert
    expect(envNumber('TEST_MISSING', 5)).toBe(5);
    expect(envString('TEST_MISSING', 'fallback')).toBe('fallback');
    expect(envBoolean('TEST_MISSING', true)).toBe(true);
    expect(envList('TEST_MISSING')).toEqual([]);
    expect(() => envNumber('TEST_BAD_NUMBER')).toThrow();
    expect(() => envBoolean('TEST_BAD_BOOL')).toThrow();
    expect(envSecurityType('jwt')).toBe('jwt');
    expect(() => envSecurityType('other')).toThrow();
  });
});
