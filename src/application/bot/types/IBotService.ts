import { IProcessBotMessageRequest } from '@application/bot/BotService';
import { IConnectionEventBus } from '@application/events/IConnectionEventBus';

export interface IBotService {
  handleMessage(request: IProcessBotMessageRequest): Promise<void>;
  subscribe(eventBus: IConnectionEventBus): void;
}
