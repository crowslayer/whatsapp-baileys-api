import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

class Moment extends DateValueObject {
  protected validate(): void {}
}

class OtherMoment extends DateValueObject {
  protected validate(): void {}
}

describe('DateValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores a defensive copy of the provided date', () => {
    const source = new Date('2024-01-01T00:00:00.000Z');
    const moment = new Moment(source);

    expect(moment.value).not.toBe(source);
    expect(moment.value.getTime()).toBe(source.getTime());
  });

  it('throws InvalidArgumentError for an invalid date', () => {
    expect(() => new Moment(new Date('invalid'))).toThrow(InvalidArgumentError);
    expect(() => new Moment(new Date('invalid'))).toThrow('Invalid Date value');
  });

  it('throws TypeError when the provided value is not a Date instance', () => {
    expect(() => new Moment(undefined as unknown as Date)).toThrow(TypeError);
  });

  it('throws TypeError when the provided value is null', () => {
    expect(() => new Moment(null as unknown as Date)).toThrow(TypeError);
  });

  it('returns a new Date instance from toDate', () => {
    const moment = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const result = moment.toDate();

    expect(result).not.toBe(moment.value);
    expect(result.getTime()).toBe(moment.value.getTime());
  });

  it('returns the ISO string representation of the date', () => {
    const moment = new Moment(new Date('2024-03-04T05:06:07.000Z'));

    expect(moment.toISOString()).toBe('2024-03-04T05:06:07.000Z');
  });

  it('returns true when the date is before another date', () => {
    const before = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const after = new Moment(new Date('2024-02-01T00:00:00.000Z'));

    expect(before.isBefore(after)).toBe(true);
  });

  it('returns false when the date is not before another date', () => {
    const before = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const after = new Moment(new Date('2024-02-01T00:00:00.000Z'));

    expect(after.isBefore(before)).toBe(false);
  });

  it('returns false when comparing a date with itself using isBefore', () => {
    const moment = new Moment(new Date('2024-01-01T00:00:00.000Z'));

    expect(moment.isBefore(moment)).toBe(false);
  });

  it('returns true when the date is after another date', () => {
    const before = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const after = new Moment(new Date('2024-02-01T00:00:00.000Z'));

    expect(after.isAfter(before)).toBe(true);
  });

  it('returns false when the date is not after another date', () => {
    const before = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const after = new Moment(new Date('2024-02-01T00:00:00.000Z'));

    expect(before.isAfter(after)).toBe(false);
  });

  it('returns false when comparing a date with itself using isAfter', () => {
    const moment = new Moment(new Date('2024-01-01T00:00:00.000Z'));

    expect(moment.isAfter(moment)).toBe(false);
  });

  it('returns true when two dates share the same timestamp', () => {
    const a = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const b = new Moment(new Date('2024-01-01T00:00:00.000Z'));

    expect(a.equals(b)).toBe(true);
  });

  it('returns false when two dates have different timestamps', () => {
    const a = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const b = new Moment(new Date('2024-01-01T00:00:00.001Z'));

    expect(a.equals(b)).toBe(false);
  });

  it('compares timestamps regardless of the concrete subclass', () => {
    const a = new Moment(new Date('2024-01-01T00:00:00.000Z'));
    const b = new OtherMoment(new Date('2024-01-01T00:00:00.000Z'));

    expect(a.equals(b)).toBe(true);
  });

  it('throws TypeError when equals receives undefined', () => {
    const moment = new Moment(new Date('2024-01-01T00:00:00.000Z'));

    expect(() => moment.equals(undefined as unknown as Moment)).toThrow(TypeError);
  });
});
