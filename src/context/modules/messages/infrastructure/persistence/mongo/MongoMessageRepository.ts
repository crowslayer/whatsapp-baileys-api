import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { IMessageRepository } from '@modules/messages/domain/IMessageRepository';
import { MessageAggregate } from '@modules/messages/domain/MessageAggregate';
import { MessageId } from '@modules/messages/domain/MessageId';
import {
  IMessageDocument,
  MessageModel,
} from '@modules/messages/infrastructure/persistence/mongo/MessageModel';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

export class MongoMessageRepository extends MongoRepository implements IMessageRepository {
  async save(message: MessageAggregate): Promise<void> {
    try {
      const document = this.toDocument(message);

      await new MessageModel(document).save();
    } catch (error) {
      throw this.translateError(error);
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
      throw this.translateError(error);
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
      throw this.translateError(error);
    }
  }

  async updateStatus(
    instanceId: InstanceId,
    messageId: MessageId,
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
      throw this.translateError(error);
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

  private toAggregate(doc: IMessageDocument): MessageAggregate {
    return MessageAggregate.restore({
      messageId: MessageId.fromString(doc.messageId),
      instanceId: InstanceId.fromString(doc.instanceId),
      chatId: ChatId.fromString(doc.chatId),
      senderId: doc.senderId,
      direction: doc.direction,
      timestamp: new Date(doc.timestamp),
      content: doc.content,
      status: doc.status,
      createdAt: CreatedAt.create(doc.createdAt),
      updatedAt: UpdatedAt.create(doc.updatedAt),
    });
  }
}
