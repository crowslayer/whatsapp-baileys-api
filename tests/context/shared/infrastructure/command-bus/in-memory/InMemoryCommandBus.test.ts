import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Command } from '@shared/domain/command/Command';
import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { CommandHandlers } from '@shared/infrastructure/command-bus/CommandHandlers';
import { CommandHandlerNotFoundError } from '@shared/infrastructure/command-bus/CommandHandlerNotFoundError';
import { InMemoryCommandBus } from '@shared/infrastructure/command-bus/in-memory/InMemoryCommandBus';

class CreateUserCommand extends Command<string> {}
class DeleteUserCommand extends Command<void> {}

function createHandler(
  handle: ICommandHandler<Command<unknown>>['handle']
): ICommandHandler<Command<unknown>> {
  return {
    subscribedTo: () => CreateUserCommand,
    handle,
  };
}

describe('InMemoryCommandBus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves with the value returned by the handler', async () => {
    const handle = vi.fn().mockResolvedValue('created');
    const bus = new InMemoryCommandBus(new CommandHandlers([createHandler(handle)]));

    const result = await bus.dispatch(new CreateUserCommand());

    expect(result).toBe('created');
  });

  it('passes the command instance to the handler', async () => {
    const handle = vi.fn().mockResolvedValue('created');
    const bus = new InMemoryCommandBus(new CommandHandlers([createHandler(handle)]));
    const command = new CreateUserCommand();

    await bus.dispatch(command);

    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledWith(command);
  });

  it('rejects when the command has no registered handler', async () => {
    const bus = new InMemoryCommandBus(new CommandHandlers([]));

    await expect(bus.dispatch(new CreateUserCommand())).rejects.toThrow(
      CommandHandlerNotFoundError
    );
  });

  it('rejects with the not found message when the command is not registered', async () => {
    const bus = new InMemoryCommandBus(new CommandHandlers([]));

    await expect(bus.dispatch(new DeleteUserCommand())).rejects.toThrow(
      "The command 'DeleteUserCommand' does not have any registered handler."
    );
  });

  it('rejects when the handler throws synchronously', async () => {
    const handle = vi.fn().mockImplementation(() => {
      throw new Error('sync failure');
    });
    const bus = new InMemoryCommandBus(new CommandHandlers([createHandler(handle)]));

    await expect(bus.dispatch(new CreateUserCommand())).rejects.toThrow(
      'sync failure'
    );
  });

    it('rejects when the handler returns a rejected promise', async () => {
      const handle = vi.fn().mockImplementation(async () => {
        throw new Error('async failure');
      });
      const bus = new InMemoryCommandBus(new CommandHandlers([createHandler(handle)]));

      await expect(bus.dispatch(new CreateUserCommand())).rejects.toThrow(
        'async failure'
      );
    });

    it('returns a rejected promise instead of throwing synchronously', async () => {
      const bus = new InMemoryCommandBus(new CommandHandlers([]));

      const pending = bus.dispatch(new CreateUserCommand());

      expect(pending).toBeInstanceOf(Promise);
      await expect(pending).rejects.toThrow(CommandHandlerNotFoundError);
    });
});
