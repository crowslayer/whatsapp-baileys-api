import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

import { FlowId } from '@modules/flows/domain/FlowId';

const VALID_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';
const OTHER_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

class OtherUuid extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {}
}

describe('FlowId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a UuidValueObject', () => {
    const flowId = FlowId.fromString(VALID_UUID);

    expect(flowId).toBeInstanceOf(FlowId);
    expect(flowId).toBeInstanceOf(UuidValueObject);
  });

  it('keeps the provided value', () => {
    const flowId = FlowId.fromString(VALID_UUID);

    expect(flowId.value).toBe(VALID_UUID);
    expect(flowId.toPrimitives()).toBe(VALID_UUID);
    expect(flowId.toString()).toBe(VALID_UUID);
  });

  it('creates a new random uuid v7 identifier', () => {
    const flowId = FlowId.create();

    expect(flowId).toBeInstanceOf(FlowId);
    expect(flowId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('creates a different identifier on each call', () => {
    const first = FlowId.create();
    const second = FlowId.create();

    expect(first.value).not.toBe(second.value);
  });

  it('throws ValidationError when the value is an empty string', () => {
    expect(() => FlowId.fromString('')).toThrow(ValidationError);
    expect(() => FlowId.fromString('')).toThrow('FlowId cannot be empty');
  });

  it('throws ValidationError when the value only contains whitespace', () => {
    expect(() => FlowId.fromString('   ')).toThrow(ValidationError);
    expect(() => FlowId.fromString('   ')).toThrow('FlowId cannot be empty');
  });

  it('throws InvalidArgumentError when the value is not a valid uuid', () => {
    expect(() => FlowId.fromString('not-a-uuid')).toThrow(InvalidArgumentError);
    expect(() => FlowId.fromString('not-a-uuid')).toThrow(
      '<FlowId> does not allow the value <not-a-uuid>'
    );
  });

  it('reports the field and the message inside the validation error', () => {
    let caught: unknown;

    try {
      FlowId.fromString('');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ValidationError);
    expect((caught as ValidationError).errors).toEqual([
      { field: 'flowId', message: 'FlowId cannot be empty' },
    ]);
  });

  it('equals another identifier with the same uuid', () => {
    const flowId = FlowId.fromString(VALID_UUID);
    const other = FlowId.fromString(VALID_UUID);

    expect(flowId.equals(other)).toBe(true);
  });

  it('does not equal an identifier with a different uuid', () => {
    const flowId = FlowId.fromString(VALID_UUID);
    const other = FlowId.fromString(OTHER_UUID);

    expect(flowId.equals(other)).toBe(false);
  });

  it('does not equal an identifier of a different value object type', () => {
    const flowId = FlowId.fromString(VALID_UUID);
    const other = new OtherUuid(VALID_UUID);

    expect(flowId.equals(other)).toBe(false);
  });

  it('does not equal undefined or null', () => {
    const flowId = FlowId.fromString(VALID_UUID);

    expect(flowId.equals(undefined as unknown as FlowId)).toBe(false);
    expect(flowId.equals(null as unknown as FlowId)).toBe(false);
  });
});
