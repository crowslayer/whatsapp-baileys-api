import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { CommandNotRegisteredError } from '@shared/infrastructure/command-bus/CommandNotRegisteredError';

describe('CommandNotRegisteredError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new CommandNotRegisteredError('CreateUserCommand');

    expect(error).toBeInstanceOf(CommandNotRegisteredError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the COMMAND_HANDLER_NOT_FOUND error code', () => {
    const error = new CommandNotRegisteredError('CreateUserCommand');

    expect(error.code).toBe(ErrorCode.COMMAND_HANDLER_NOT_FOUND);
  });

  it('exposes the infrastructure error type', () => {
    const error = new CommandNotRegisteredError('CreateUserCommand');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('builds the message with the command name between angle brackets', () => {
    const error = new CommandNotRegisteredError('CreateUserCommand');

    expect(error.message).toBe(
      "The command <CreateUserCommand> hasn't a command handler associated"
    );
  });

  it('uses the class name as error name', () => {
    const error = new CommandNotRegisteredError('CreateUserCommand');

    expect(error.name).toBe('CommandNotRegisteredError');
  });
});
