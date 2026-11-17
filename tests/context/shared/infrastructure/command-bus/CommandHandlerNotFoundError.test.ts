import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { CommandHandlerNotFoundError } from '@shared/infrastructure/command-bus/CommandHandlerNotFoundError';

describe('CommandHandlerNotFoundError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error).toBeInstanceOf(CommandHandlerNotFoundError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the COMMAND_HANDLER_NOT_FOUND error code', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error.code).toBe(ErrorCode.COMMAND_HANDLER_NOT_FOUND);
  });

  it('exposes the infrastructure error type', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('builds the message with the command name', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error.message).toBe(
      "The command 'CreateUserCommand' does not have any registered handler."
    );
  });

  it('uses the class name as error name', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error.name).toBe('CommandHandlerNotFoundError');
  });

  it('keeps the stack trace', () => {
    const error = new CommandHandlerNotFoundError('CreateUserCommand');

    expect(error.stack).toBeDefined();
  });
});
