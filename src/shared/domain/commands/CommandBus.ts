import { Command } from '@shared/domain/commands/Command';

export interface ICommandBus {
  dispatch<TResponse>(command: Command<TResponse>): Promise<TResponse>;
}
