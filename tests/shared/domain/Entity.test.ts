import { Entity } from '../../../src/shared/domain/Entity'

class TestEntity extends Entity<string> {
  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
  }
}

describe('Entity', () => {
  test('constructor sets _id', () => {
    const entity = new TestEntity('entity-1')
    expect(entity.id).toBe('entity-1')
  })

  test('id getter returns the id', () => {
    const entity = new TestEntity('my-id')
    expect(entity.id).toBe('my-id')
  })

  test('equals returns true for same entity instance', () => {
    const entity = new TestEntity('same-id')
    expect(entity.equals(entity)).toBe(true)
  })

  test('equals returns false for different entity', () => {
    const a = new TestEntity('id-a')
    const b = new TestEntity('id-b')
    expect(a.equals(b)).toBe(false)
  })

  test('equals returns false when compared to undefined', () => {
    const entity = new TestEntity('some-id')
    expect(entity.equals(undefined)).toBe(false)
  })

  test('createdAt defaults to Date if not provided', () => {
    const entity = new TestEntity('id')
    expect(entity.createdAt).toBeInstanceOf(Date)
  })

  test('updatedAt defaults to Date if not provided', () => {
    const entity = new TestEntity('id')
    expect(entity.updatedAt).toBeInstanceOf(Date)
  })
})
