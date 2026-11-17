import { beforeEach, describe, expect, it, vi } from 'vitest';

const uuidMock = vi.hoisted(() => ({
  validate: vi.fn<(uuid: string) => boolean>(),
  v7: vi.fn<() => string>(),
}));

vi.mock('uuid', () => uuidMock);

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

const v7Mock = uuidMock.v7;
const validateMock = uuidMock.validate;

class UserId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {}
}

const VALID_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';

describe('UuidValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateMock.mockReturnValue(true);
    v7Mock.mockReturnValue(VALID_UUID);
  });

  it('keeps a valid uuid value', () => {
    const id = new UserId(VALID_UUID);

    expect(id.value).toBe(VALID_UUID);
    expect(id.toPrimitives()).toBe(VALID_UUID);
  });

  it('throws InvalidArgumentError when the value is not a valid uuid', () => {
    validateMock.mockReturnValue(false);

    expect(() => new UserId('not-a-uuid')).toThrow(InvalidArgumentError);
    expect(() => new UserId('not-a-uuid')).toThrow(
      `<UserId> does not allow the value <not-a-uuid>`
    );
  });

  it('validates the uuid through the uuid library', () => {
    new UserId(VALID_UUID);

    expect(validateMock).toHaveBeenCalledWith(VALID_UUID);
    expect(validateMock).toHaveBeenCalledTimes(1);
  });

  it('creates a new instance with a uuid v7 through random', () => {
    const id = UserId.random();

    expect(id).toBeInstanceOf(UserId);
    expect(id.value).toBe(VALID_UUID);
    expect(v7Mock).toHaveBeenCalledTimes(1);
  });

  it('throws when random produces an invalid uuid', () => {
    v7Mock.mockReturnValue('invalid-uuid');
    validateMock.mockReturnValue(false);

    expect(() => UserId.random()).toThrow(InvalidArgumentError);
  });

  it('compares instances with the same uuid as equal', () => {
    const a = new UserId(VALID_UUID);
    const b = new UserId(VALID_UUID);

    expect(a.equals(b)).toBe(true);
  });

  it('compares instances with different uuids as not equal', () => {
    const a = new UserId(VALID_UUID);
    const b = new UserId('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');

    expect(a.equals(b)).toBe(false);
  });
});
