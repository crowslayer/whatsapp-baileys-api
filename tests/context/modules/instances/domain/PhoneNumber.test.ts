import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';

import { PhoneNumber } from '@modules/instances/domain/PhoneNumber';

describe('PhoneNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a phone number with ten digits', () => {
    const phone = PhoneNumber.create('1234567890');

    expect(phone.value).toBe('1234567890');
  });

  it('creates a phone number with fifteen digits', () => {
    const phone = PhoneNumber.create('123456789012345');

    expect(phone.value).toBe('123456789012345');
  });

  it('throws ValidationError when the phone has nine digits', () => {
    expect(() => PhoneNumber.create('123456789')).toThrow(ValidationError);
  });

  it('throws ValidationError when the phone has sixteen digits', () => {
    expect(() => PhoneNumber.create('1234567890123456')).toThrow(ValidationError);
  });

  it('throws ValidationError when the phone contains letters', () => {
    expect(() => PhoneNumber.create('123456789a')).toThrow(ValidationError);
  });

  it('throws ValidationError when the phone contains spaces', () => {
    expect(() => PhoneNumber.create('123 456 7890')).toThrow(ValidationError);
  });

  it('throws ValidationError when the phone is empty', () => {
    expect(() => PhoneNumber.create('')).toThrow(ValidationError);
  });

  it('exposes the validation errors with the phonenumber field', () => {
    try {
      PhoneNumber.create('abc');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors[0].field).toBe('phonenumber');
    }
  });

  it('converts the phone number to the WhatsApp format', () => {
    const phone = PhoneNumber.create('1234567890');

    expect(phone.toWhatsAppFormat()).toBe('1234567890@s.whatsapp.net');
  });

  it('returns true when comparing two phone numbers with the same value', () => {
    const first = PhoneNumber.create('1234567890');
    const second = PhoneNumber.create('1234567890');

    expect(first.equals(second)).toBe(true);
  });

  it('returns false when comparing two phone numbers with different values', () => {
    const first = PhoneNumber.create('1234567890');
    const second = PhoneNumber.create('9876543210');

    expect(first.equals(second)).toBe(false);
  });
});
