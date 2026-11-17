import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EnumValueObject } from '@shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

const VALID_COLORS = ['red', 'green', 'blue'] as const;

class Color extends EnumValueObject<string> {
  constructor(value: string) {
    super(value, VALID_COLORS);
  }

  protected validate(): void {}

  protected throwErrorForInvalidValue(value: string): void {
    throw new InvalidArgumentError(`Invalid color <${value}>`);
  }
}

describe('EnumValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a value that belongs to the valid set', () => {
    const color = new Color('red');

    expect(color.value).toBe('red');
    expect(color.toPrimitives()).toBe('red');
  });

  it('throws when the value does not belong to the valid set', () => {
    expect(() => new Color('purple')).toThrow(InvalidArgumentError);
    expect(() => new Color('purple')).toThrow('Invalid color <purple>');
  });

  it('throws for an empty string when it is not a valid value', () => {
    expect(() => new Color('')).toThrow(InvalidArgumentError);
  });

  it('does not throw when checkValueIsValid receives a valid value', () => {
    const color = new Color('red');

    expect(() => color.checkValueIsValid('blue', VALID_COLORS)).not.toThrow();
  });

  it('throws when checkValueIsValid receives an invalid value', () => {
    const color = new Color('red');

    expect(() => color.checkValueIsValid('purple', VALID_COLORS)).toThrow(
      'Invalid color <purple>'
    );
  });

  it('throws when the valid set is empty', () => {
    expect(() => colorWithEmptySet()).toThrow(InvalidArgumentError);
  });

  it('throws when checking a value against an empty valid set', () => {
    const color = new Color('red');

    expect(() => color.checkValueIsValid('red', [])).toThrow(InvalidArgumentError);
  });
});

function colorWithEmptySet(): EnumValueObject<string> {
  class EmptyColor extends EnumValueObject<string> {
    constructor() {
      super('red', []);
    }

    protected validate(): void {}

    protected throwErrorForInvalidValue(value: string): void {
      throw new InvalidArgumentError(`Invalid color <${value}>`);
    }
  }

  return new EmptyColor();
}
