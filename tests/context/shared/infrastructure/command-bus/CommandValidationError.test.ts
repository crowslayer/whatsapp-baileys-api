import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { CommandValidationError } from '@shared/infrastructure/command-bus/CommandValidationError';

describe('CommandValidationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new CommandValidationError('CreateUserCommand', ['name required']);

    expect(error).toBeInstanceOf(CommandValidationError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the COMMAND_VALIDATION_FAILED error code', () => {
    const error = new CommandValidationError('CreateUserCommand', ['name required']);

    expect(error.code).toBe(ErrorCode.COMMAND_VALIDATION_FAILED);
  });

  it('exposes the infrastructure error type', () => {
    const error = new CommandValidationError('CreateUserCommand', ['name required']);

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('exposes the validation errors', () => {
    const errors = ['name required', 'email invalid'];

    const error = new CommandValidationError('CreateUserCommand', errors);

    expect(error.errors).toEqual(errors);
  });

  it('builds the message joining every validation error', () => {
    const error = new CommandValidationError('CreateUserCommand', [
      'name required',
      'email invalid',
    ]);

    expect(error.message).toBe(
      "Validation failed for command 'CreateUserCommand'. Details: name required, email invalid"
    );
  });

  it('builds the message with an empty detail list', () => {
    const error = new CommandValidationError('CreateUserCommand', []);

    expect(error.message).toBe(
      "Validation failed for command 'CreateUserCommand'. Details: "
    );
  });

  it('uses the class name as error name', () => {
    const error = new CommandValidationError('CreateUserCommand', []);

    expect(error.name).toBe('CommandValidationError');
  });
});
