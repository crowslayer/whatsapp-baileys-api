import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

import { MessageError } from '@modules/messages/application/MessageError';

describe('MessageError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new MessageError('boom');

    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the third party api error code', () => {
    const error = new MessageError('boom');

    expect(error.code).toBe(ErrorCode.THIRD_PARTY_API_ERROR);
  });

  it('exposes the infrastructure error type', () => {
    const error = new MessageError('boom');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('keeps the provided message', () => {
    const error = new MessageError('Audio message not sended');

    expect(error.message).toBe('Audio message not sended');
  });

  it('uses the class name as error name', () => {
    const error = new MessageError('boom');

    expect(error.name).toBe('MessageError');
  });

  it('is throwable and catchable by type', () => {
    expect(() => {
      throw new MessageError('boom');
    }).toThrow(MessageError);
  });

  it('exposes a stack trace', () => {
    const error = new MessageError('boom');

    expect(error.stack).toBeDefined();
  });
});
