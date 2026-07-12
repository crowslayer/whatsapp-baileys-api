import { describe, expect } from 'vitest';
import { ApplicationError } from '../../../../src/shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../../src/shared/infrastructure/errors/ErrorType';
import { WhatsAppConnectionError } from '../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('WhatsAppConnectionError', () => {
  test('should set message via constructor', () => {
    const error = new WhatsAppConnectionError('Connection lost');
    expect(error.message).toBe('Connection lost');
  });

  test('should have code INTERNAL_ERROR (5000)', () => {
    const error = new WhatsAppConnectionError('test');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  test('should have type ErrorType.INTERNAL', () => {
    const error = new WhatsAppConnectionError('test');
    expect(error.type).toBe(ErrorType.INTERNAL);
  });

  test('should extend ApplicationError', () => {
    const error = new WhatsAppConnectionError('test');
    expect(error).toBeInstanceOf(ApplicationError);
  });
});
