import { describe, expect } from 'vitest';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError';

describe('PhoneNumber', () => {
  test('create with valid 10-digit number succeeds', () => {
    const phone = PhoneNumber.create('1234567890');
    expect(phone.value).toBe('1234567890');
  });

  test('create with valid 15-digit number succeeds', () => {
    const phone = PhoneNumber.create('123456789012345');
    expect(phone.value).toBe('123456789012345');
  });

  test('create with letters throws ValidationError', () => {
    expect(() => PhoneNumber.create('12345abcde')).toThrow(ValidationError);
  });

  test('create with too few digits throws ValidationError', () => {
    expect(() => PhoneNumber.create('123456789')).toThrow(ValidationError);
  });

  test('create with too many digits throws ValidationError', () => {
    expect(() => PhoneNumber.create('1234567890123456')).toThrow(ValidationError);
  });

  test('toWhatsAppFormat appends @s.whatsapp.net', () => {
    const phone = PhoneNumber.create('521234567890');
    expect(phone.toWhatsAppFormat()).toBe('521234567890@s.whatsapp.net');
  });
});
