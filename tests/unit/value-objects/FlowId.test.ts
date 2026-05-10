import { FlowId } from '../../../src/domain/value-objects/FlowId'
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError'

describe('FlowId', () => {
  test('should create from string', () => {
    const id = FlowId.fromString('test-123')
    expect(id.value).toBe('test-123')
  })

  test('should generate unique id with create()', () => {
    const id1 = FlowId.create()
    const id2 = FlowId.create()
    expect(id1.value).toBeTruthy()
    expect(id1.value).not.toBe(id2.value)
  })

  test('should throw ValidationError for empty string', () => {
    expect(() => FlowId.fromString('')).toThrow(ValidationError)
  })

  test('should throw for whitespace-only string', () => {
    expect(() => FlowId.fromString('   ')).toThrow(ValidationError)
  })

  test('equals returns true for same value', () => {
    const a = FlowId.fromString('same-id')
    const b = FlowId.fromString('same-id')
    expect(a.equals(b)).toBe(true)
  })

  test('equals returns false for different values', () => {
    const a = FlowId.fromString('id-a')
    const b = FlowId.fromString('id-b')
    expect(a.equals(b)).toBe(false)
  })

  test('equals returns false when compared to undefined', () => {
    const a = FlowId.fromString('id-a')
    expect(a.equals(undefined)).toBe(false)
  })
})
