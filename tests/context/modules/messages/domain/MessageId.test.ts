import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validate as uuidValidate } from 'uuid';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { MessageId } from '@modules/messages/domain/MessageId';

const VALID_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

describe('MessageId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a valid uuid v7 identifier', () => {
    const messageId = MessageId.create();

    expect(uuidValidate(messageId.value)).toBe(true);
  });

  it('generates a different identifier on each call', () => {
    const first = MessageId.create();
    const second = MessageId.create();

    expect(first.value).not.toBe(second.value);
  });

  it('creates an instance from a valid uuid string', () => {
    const messageId = MessageId.fromString(VALID_UUID);

    expect(messageId.value).toBe(VALID_UUID);
  });

  it('throws a ValidationError when the value is empty', () => {
    expect(() => MessageId.fromString('')).toThrow(ValidationError);
  });

  it('throws a ValidationError when the value only contains whitespace', () => {
    expect(() => MessageId.fromString('   ')).toThrow(ValidationError);
  });

  it('throws a ValidationError carrying the messageId field detail', () => {
    expect(() => MessageId.fromString('')).toThrow(/messageId cannot be empty/);
  });

  it('throws an InvalidArgumentError when the value is not a uuid', () => {
    expect(() => MessageId.fromString('not-a-uuid')).toThrow(InvalidArgumentError);
  });

  it('returns the primitive value through toPrimitives', () => {
    const messageId = MessageId.fromString(VALID_UUID);

    expect(messageId.toPrimitives()).toBe(VALID_UUID);
  });

  it('returns the string representation of the value', () => {
    const messageId = MessageId.fromString(VALID_UUID);

    expect(messageId.toString()).toBe(VALID_UUID);
  });

  it('equals another identifier with the same value', () => {
    const first = MessageId.fromString(VALID_UUID);
    const second = MessageId.fromString(VALID_UUID);

    expect(first.equals(second)).toBe(true);
  });

  it('does not equal an identifier with a different value', () => {
    const first = MessageId.fromString(VALID_UUID);
    const second = MessageId.fromString('0198f3a2-1b4c-7d5e-8f90-aaaaaaaaaaaa');

    expect(first.equals(second)).toBe(false);
  });
});
