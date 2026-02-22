import { Command } from './Command';

export interface ICommandBus {
  dispatch<TResponse>(command: Command<TResponse>): Promise<TResponse>;
}
