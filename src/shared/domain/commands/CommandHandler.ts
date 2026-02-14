import { Command } from './Command';

export interface ICommandHandler<TCommand extends Command> {
  suscribedTo(): Command;
  handle(command: TCommand): Promise<void>;
}
