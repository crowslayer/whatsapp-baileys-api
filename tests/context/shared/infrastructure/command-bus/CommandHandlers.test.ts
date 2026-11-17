import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Command } from '@shared/domain/command/Command';
import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { CommandHandlers } from '@shared/infrastructure/command-bus/CommandHandlers';
import { CommandHandlerNotFoundError } from '@shared/infrastructure/command-bus/CommandHandlerNotFoundError';

class CreateUserCommand extends Command<string> {}
class DeleteUserCommand extends Command<void> {}

type AnyCommandConstructor = new (...args: never[]) => Command<unknown>;

function createHandler(
  subscribedTo: AnyCommandConstructor,
  handle: ICommandHandler<Command<unknown>>['handle']
): ICommandHandler<Command<unknown>> {
  return {
    subscribedTo: () => subscribedTo,
    handle,
  };
}

describe('CommandHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the handler registered for the command', () => {
    const handle = vi.fn().mockResolvedValue('created');
    const handler = createHandler(CreateUserCommand, handle);
    const handlers = new CommandHandlers([handler]);

    const result = handlers.get(new CreateUserCommand());

    expect(result).toBe(handler);
  });

  it('throws when the command has no registered handler', () => {
    const handlers = new CommandHandlers([]);

    expect(() => handlers.get(new CreateUserCommand())).toThrow(
      CommandHandlerNotFoundError
    );
  });

  it('includes the command name in the error message', () => {
    const handlers = new CommandHandlers([]);

    expect(() => handlers.get(new DeleteUserCommand())).toThrow(
      "The command 'DeleteUserCommand' does not have any registered handler."
    );
  });

  it('keeps only the last handler registered for the same command', () => {
    const first = createHandler(
      CreateUserCommand,
      vi.fn().mockResolvedValue('first')
    );
    const second = createHandler(
      CreateUserCommand,
      vi.fn().mockResolvedValue('second')
    );
    const handlers = new CommandHandlers([first, second]);

    const result = handlers.get(new CreateUserCommand());

    expect(result).toBe(second);
  });

  it('resolves the handler by the exact command class', () => {
    const handler = createHandler(
      CreateUserCommand,
      vi.fn().mockResolvedValue('created')
    );
    const handlers = new CommandHandlers([handler]);

    expect(() => handlers.get(new DeleteUserCommand())).toThrow(
      CommandHandlerNotFoundError
    );
  });

  it('does not mutate the handlers array given to the constructor', () => {
    const handlers = [createHandler(CreateUserCommand, vi.fn())];
    const registry = new CommandHandlers(handlers);

    expect(registry.get(new CreateUserCommand())).toBeDefined();
    expect(handlers).toHaveLength(1);
  });
});
