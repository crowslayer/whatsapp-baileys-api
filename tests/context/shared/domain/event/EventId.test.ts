import { beforeEach, describe, expect, it, vi } from 'vitest';

const uuidMock = vi.hoisted(() => ({
  v4: vi.fn<() => string>(),
}));

vi.mock('uuid', () => uuidMock);

import { ValidationError } from '@shared/domain/error/ValidationError';
import { EventId } from '@shared/domain/event/EventId';

const v4Mock = uuidMock.v4;

const GENERATED_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';

describe('EventId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    v4Mock.mockReturnValue(GENERATED_UUID);
  });

  it('creates an id with a generated uuid v4', () => {
    const eventId = EventId.create();

    expect(eventId.value).toBe(GENERATED_UUID);
    expect(v4Mock).toHaveBeenCalledTimes(1);
  });

  it('creates an id from an explicit string', () => {
    const eventId = EventId.fromString('event-id-1');

    expect(eventId.value).toBe('event-id-1');
    expect(eventId.toPrimitives()).toBe('event-id-1');
  });

  it('throws ValidationError for an empty string', () => {
    expect(() => EventId.fromString('')).toThrow(ValidationError);
    expect(() => EventId.fromString('')).toThrow(
      'Validation failed: eventId: EventId cannot be empty'
    );
  });

  it('throws ValidationError for a whitespace-only string', () => {
    expect(() => EventId.fromString('   ')).toThrow(ValidationError);
  });

  it('exposes the validation error details', () => {
    expect(() => EventId.fromString('')).toThrow(
      expect.objectContaining({
        errors: [{ field: 'eventId', message: 'EventId cannot be empty' }],
      })
    );
  });

  it('compares ids with the same value as equal', () => {
    const a = EventId.fromString('same');
    const b = EventId.fromString('same');

    expect(a.equals(b)).toBe(true);
  });

  it('compares ids with different values as not equal', () => {
    const a = EventId.fromString('one');
    const b = EventId.fromString('other');

    expect(a.equals(b)).toBe(false);
  });
});
