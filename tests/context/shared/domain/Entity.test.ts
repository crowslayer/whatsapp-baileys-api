import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Entity } from '@shared/domain/Entity';

class UserEntity extends Entity<string> {}

class OrderEntity extends Entity<string> {}

describe('Entity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the id through the id getter', () => {
    const entity = new UserEntity('user-1');

    expect(entity.id).toBe('user-1');
  });

  it('generates a createdAt date when it is not provided', () => {
    const entity = new UserEntity('user-1');

    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(Number.isNaN(entity.createdAt.getTime())).toBe(false);
  });

  it('generates an updatedAt date when it is not provided', () => {
    const entity = new UserEntity('user-1');

    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(Number.isNaN(entity.updatedAt.getTime())).toBe(false);
  });

  it('keeps the provided createdAt and updatedAt dates', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    const entity = new UserEntity('user-1', createdAt, updatedAt);

    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });

  it('returns true when two entities of the same class share the id', () => {
    const a = new UserEntity('same-id');
    const b = new UserEntity('same-id');

    expect(a.equals(b)).toBe(true);
  });

  it('returns false when two entities of the same class have different ids', () => {
    const a = new UserEntity('id-a');
    const b = new UserEntity('id-b');

    expect(a.equals(b)).toBe(false);
  });

  it('compares only by id regardless of the concrete class', () => {
    const a = new UserEntity('same-id');
    const b = new OrderEntity('same-id');

    expect(a.equals(b)).toBe(true);
  });

  it('returns false when comparing with undefined', () => {
    const entity = new UserEntity('user-1');

    expect(entity.equals(undefined)).toBe(false);
  });

  it('returns false when comparing with a value that is not an Entity', () => {
    const entity = new UserEntity('user-1');

    expect(entity.equals({ id: 'user-1' } as unknown as Entity<string>)).toBe(false);
  });

  it('returns true when comparing an entity with itself', () => {
    const entity = new UserEntity('user-1');

    expect(entity.equals(entity)).toBe(true);
  });
});
