import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Command } from '@shared/domain/command/Command';
import { ICommandHandler } from '@shared/domain/command/CommandHandler';

class CreateUserCommand extends Command<string> {}

class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  subscribedTo(): new (...args: never[]) => CreateUserCommand {
    return CreateUserCommand;
  }

  handle(command: CreateUserCommand): Promise<string> {
    return Promise.resolve(`handled ${command.constructor.name}`);
  }
}

class FailingHandler implements ICommandHandler<CreateUserCommand> {
  subscribedTo(): new (...args: never[]) => CreateUserCommand {
    return CreateUserCommand;
  }

  handle(command: CreateUserCommand): Promise<string> {
    return Promise.reject(new Error(`handler failed for ${command.constructor.name}`));
  }
}

describe('ICommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the command class it is subscribed to', () => {
    const handler = new CreateUserHandler();

    expect(handler.subscribedTo()).toBe(CreateUserCommand);
  });

  it('creates a new instance of the subscribed command', () => {
    const handler = new CreateUserHandler();
    const CommandClass = handler.subscribedTo();
    const command = new CommandClass();

    expect(command).toBeInstanceOf(CreateUserCommand);
  });

  it('resolves with the response produced by the handler', async () => {
    const handler = new CreateUserHandler();

    const result = await handler.handle(new CreateUserCommand());

    expect(result).toBe('handled CreateUserCommand');
  });

  it('rejects when the handler fails', async () => {
    const handler = new FailingHandler();

    await expect(handler.handle(new CreateUserCommand())).rejects.toThrow('handler failed');
  });

  it('is compatible with the Command generic constraint', async () => {
    const handler = new CreateUserHandler();
    const command: Command<string> = new CreateUserCommand();

    await expect(handler.handle(command as CreateUserCommand)).resolves.toContain('handled');
  });
});
