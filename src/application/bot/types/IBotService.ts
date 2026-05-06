import { IConnectionEventBus } from '@application/events/IConnectionEventBus';

export interface IBotService {
  handleMessage(instanceId: string, chatId: string, text: string): Promise<void>;
  subscribe(eventBus: IConnectionEventBus): void;
}
