import { Name } from '../../../src/domain/value-objects/Name'
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError'

describe('Name', () => {
  test('should create with valid name', () => {
    const name = Name.create('Test Flow')
    expect(name.value).toBe('TEST FLOW')
  })

  test('should throw ValidationError for empty name', () => {
    expect(() => Name.create('')).toThrow(ValidationError)
  })

  test('should throw ValidationError for name shorter than 2 chars', () => {
    expect(() => Name.create('A')).toThrow(ValidationError)
  })

  test('should throw ValidationError for name longer than 50 chars', () => {
    const longName = 'A'.repeat(51)
    expect(() => Name.create(longName)).toThrow(ValidationError)
  })

  test('equals returns true for same name', () => {
    const a = Name.create('SAME NAME')
    const b = Name.create('SAME NAME')
    expect(a.equals(b)).toBe(true)
  })

  test('equals returns false for different values', () => {
    const a = Name.create('Alpha')
    const b = Name.create('Beta')
    expect(a.equals(b)).toBe(false)
  })
})
