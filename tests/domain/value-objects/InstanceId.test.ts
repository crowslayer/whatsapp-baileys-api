import { describe, expect } from 'vitest';
import { InstanceId } from '../../../src/domain/value-objects/InstanceId';
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError';

describe('InstanceId', () => {
  test('should create from string', () => {
    const id = InstanceId.fromString('inst-001');
    expect(id.value).toBe('inst-001');
  });

  test('should generate unique id with create()', () => {
    const id1 = InstanceId.create();
    const id2 = InstanceId.create();
    expect(id1.value).toBeTruthy();
    expect(id1.value).not.toBe(id2.value);
  });

  test('should throw ValidationError for empty string', () => {
    expect(() => InstanceId.fromString('')).toThrow(ValidationError);
  });

  test('should throw for whitespace-only string', () => {
    expect(() => InstanceId.fromString('   ')).toThrow(ValidationError);
  });

  test('equals returns true for same value', () => {
    const a = InstanceId.fromString('same-instance');
    const b = InstanceId.fromString('same-instance');
    expect(a.equals(b)).toBe(true);
  });

  test('equals returns false for different values', () => {
    const a = InstanceId.fromString('inst-a');
    const b = InstanceId.fromString('inst-b');
    expect(a.equals(b)).toBe(false);
  });
});
