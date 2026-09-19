import { MessageAggregate } from '@domain/messages/MessageAggregate';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';

import {
  IMessageDocument,
  MessageModel,
} from '@infrastructure/persistence/mongo/models/MessageModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoMessageRepository implements IMessageRepository {
  async save(message: MessageAggregate): Promise<void> {
    try {
      const document = this.toDocument(message);

      await new MessageModel(document).save();
    } catch (error) {
      throw new InfrastructureError('Failed to save message', error);
    }
  }

  async saveMany(messages: MessageAggregate[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    try {
      const documents = messages.map((message) => this.toDocument(message));

      await MessageModel.insertMany(documents, {
        ordered: false,
      });
    } catch (error) {
      throw new InfrastructureError('Failed to save messages in bulk', error);
    }
  }

  async upsert(message: MessageAggregate): Promise<void> {
    try {
      await MessageModel.updateOne(
        {
          instanceId: message.instanceId,
          messageId: message.messageId,
        },
        {
          $set: this.toDocument(message),
        },
        {
          upsert: true,
        }
      );
    } catch (error) {
      throw new InfrastructureError('Failed to upsert message', error);
    }
  }

  async updateStatus(
    instanceId: string,
    messageId: string,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  ): Promise<void> {
    try {
      await MessageModel.updateOne(
        {
          instanceId,
          messageId,
        },
        {
          $set: {
            status,
          },
        }
      );
    } catch (error) {
      throw new InfrastructureError('Failed to update message status', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mappers
  // ─────────────────────────────────────────────────────────────────────────

  private toDocument(
    message: MessageAggregate
  ): Pick<
    IMessageDocument,
    | 'messageId'
    | 'instanceId'
    | 'chatId'
    | 'direction'
    | 'senderId'
    | 'timestamp'
    | 'content'
    | 'status'
  > {
    const primitives = message.toPrimitives();

    return {
      messageId: primitives.messageId,
      instanceId: primitives.instanceId,
      chatId: primitives.chatId,
      direction: primitives.direction,
      senderId: primitives.senderId,
      timestamp: primitives.timestamp,
      content: primitives.content,
      status: primitives.status,
    };
  }

  private toDomain(doc: IMessageDocument): MessageAggregate {
    return MessageAggregate.restore({
      messageId: doc.messageId,
      instanceId: doc.instanceId,
      chatId: doc.chatId,
      senderId: doc.senderId,
      direction: doc.direction,
      timestamp: new Date(doc.timestamp),
      content: doc.content,
      status: doc.status,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    });
  }
}
