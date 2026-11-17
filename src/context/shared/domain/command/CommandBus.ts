import { Command } from '@shared/domain/command/Command';

export interface ICommandBus {
  dispatch<TResponse>(command: Command<TResponse>): Promise<TResponse>;
}
