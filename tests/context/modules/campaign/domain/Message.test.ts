import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';

import { Message } from '@modules/campaign/domain/Message';

describe('Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a message with the given value', () => {
    const message = Message.create('Hello there, this is a campaign');

    expect(message.value).toBe('Hello there, this is a campaign');
  });

  it('should throw a ValidationError when the value is empty', () => {
    expect(() => Message.create('')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value has less than two characters', () => {
    expect(() => Message.create('a')).toThrow(ValidationError);
  });

  it('should accept a value with exactly two characters', () => {
    const message = Message.create('ab');

    expect(message.value).toBe('ab');
  });

  it('should accept a value with exactly one thousand characters', () => {
    const message = Message.create('a'.repeat(1000));

    expect(message.value).toHaveLength(1000);
  });

  it('should throw a ValidationError when the value exceeds one thousand characters', () => {
    expect(() => Message.create('a'.repeat(1001))).toThrow(ValidationError);
  });

  it('should be equal to another message with the same value', () => {
    const first = Message.create('Hello there');
    const second = Message.create('Hello there');

    expect(first.equals(second)).toBe(true);
  });

  it('should not be equal to another message with a different value', () => {
    const first = Message.create('Hello there');
    const second = Message.create('Bye there');

    expect(first.equals(second)).toBe(false);
  });
});
