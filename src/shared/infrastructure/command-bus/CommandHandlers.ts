import { Command } from '@shared/domain/commands/Command';
import { ICommandHandler } from '@shared/domain/commands/CommandHandler';
import { CommandNotRegisteredError } from '@shared/domain/commands/CommandNotRegisteredError';

type CommandConstructor<TCommand extends Command<unknown>> = new (...args: never[]) => TCommand;

export class CommandHandlers {
  private readonly _handlers = new Map<
    CommandConstructor<Command<unknown>>,
    ICommandHandler<Command<unknown>>
  >();

  constructor(handlers: ReadonlyArray<ICommandHandler<Command<unknown>>>) {
    handlers.forEach((handler) => {
      this._handlers.set(handler.subscribedTo(), handler);
    });
  }

  get<TCommand extends Command<unknown>>(command: TCommand): ICommandHandler<TCommand> {
    const handler = this._handlers.get(command.constructor as CommandConstructor<TCommand>);

    if (!handler) {
      throw new CommandNotRegisteredError(`Command ${command.constructor.name} not registered`);
    }

    return handler as ICommandHandler<TCommand>;
  }
}
