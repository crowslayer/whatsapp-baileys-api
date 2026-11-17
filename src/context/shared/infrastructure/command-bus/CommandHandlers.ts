import { Command } from '@shared/domain/command/Command';
import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { CommandHandlerNotFoundError } from '@shared/infrastructure/command-bus/CommandHandlerNotFoundError';

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
      throw new CommandHandlerNotFoundError(command.constructor.name);
    }

    return handler as ICommandHandler<TCommand>;
  }
}
