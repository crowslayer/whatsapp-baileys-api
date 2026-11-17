import { Command } from '@shared/domain/command/Command';

export interface ICommandHandler<TCommand extends Command<unknown>> {
  subscribedTo(): new (...args: never[]) => TCommand;

  handle(command: TCommand): Promise<TCommand extends Command<infer R> ? R : never>;
}
