import { MessageDirection, MessageStatus, SentMessageContent } from '@domain/messages/MessageTypes';

export type MessageReadModel = {
  messageId: string;
  instanceId: string;
  chatId: string;
  senderId: string;
  direction: MessageDirection;
  timestamp: Date;
  content: SentMessageContent;
  status?: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface IMessageCursor {
  timestamp: Date;
  messageId: string;
}

export interface IMessagePage {
  items: MessageReadModel[];
  nextCursor?: IMessageCursor;
}

export interface IMessageReadRepository {
  findById(instanceId: string, messageId: string): Promise<MessageReadModel | null>;

  findByChat(
    instanceId: string,
    chatId: string,
    limit?: number,
    cursor?: IMessageCursor
  ): Promise<IMessagePage>;

  findLatestByChat(instanceId: string, chatId: string): Promise<MessageReadModel | null>;

  exists(instanceId: string, messageId: string): Promise<boolean>;

  countByChat(instanceId: string, chatId: string): Promise<number>;
}
