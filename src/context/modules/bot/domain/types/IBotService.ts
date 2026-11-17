import { IProcessBotMessageRequest } from '@modules/bot/domain/IProcessBotMessageRequest';
import { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';

export interface IBotService {
  handleMessage(request: IProcessBotMessageRequest): Promise<void>;
  subscribe(eventBus: IConnectionEventBus): void;
}
