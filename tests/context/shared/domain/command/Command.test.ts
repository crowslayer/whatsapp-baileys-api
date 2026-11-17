import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Command } from '@shared/domain/command/Command';

class CreateUserCommand extends Command<string> {}

class DeleteUserCommand extends Command {}

describe('Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be instantiated by a concrete command', () => {
    const command = new CreateUserCommand();

    expect(command).toBeInstanceOf(CreateUserCommand);
    expect(command).toBeInstanceOf(Command);
  });

  it('defaults the response type to void', () => {
    const command = new DeleteUserCommand();

    expect(command).toBeInstanceOf(Command);
  });

  it('creates independent instances', () => {
    const first = new CreateUserCommand();
    const second = new CreateUserCommand();

    expect(first).not.toBe(second);
  });
});
