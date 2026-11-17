import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { InstanceId } from '@modules/instances/domain/InstanceId';

const VALID_UUID = '018f6c2a-1b2c-7def-89ab-0123456789ab';

describe('InstanceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a random instance id', () => {
    const instanceId = InstanceId.create();

    expect(instanceId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('creates two different random instance ids', () => {
    const first = InstanceId.create();
    const second = InstanceId.create();

    expect(first.value).not.toBe(second.value);
  });

  it('creates an instance id from a valid uuid string', () => {
    const instanceId = InstanceId.fromString(VALID_UUID);

    expect(instanceId.value).toBe(VALID_UUID);
  });

  it('throws InvalidArgumentError when the uuid is not valid', () => {
    expect(() => InstanceId.fromString('not-a-uuid')).toThrow(InvalidArgumentError);
  });

  it('throws ValidationError when the uuid is empty', () => {
    expect(() => InstanceId.fromString('')).toThrow(ValidationError);
  });

  it('throws ValidationError when the uuid is only whitespace', () => {
    expect(() => InstanceId.fromString('   ')).toThrow(ValidationError);
  });

  it('returns true when comparing two instance ids with the same value', () => {
    const first = InstanceId.fromString(VALID_UUID);
    const second = InstanceId.fromString(VALID_UUID);

    expect(first.equals(second)).toBe(true);
  });

  it('returns false when comparing two instance ids with different values', () => {
    const first = InstanceId.fromString(VALID_UUID);
    const second = InstanceId.create();

    expect(first.equals(second)).toBe(false);
  });

  it('returns the primitive value', () => {
    const instanceId = InstanceId.fromString(VALID_UUID);

    expect(instanceId.toPrimitives()).toBe(VALID_UUID);
  });
});
