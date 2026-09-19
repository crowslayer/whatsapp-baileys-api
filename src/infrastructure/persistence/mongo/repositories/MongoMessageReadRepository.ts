import {
  IMessageCursor,
  IMessagePage,
  IMessageReadRepository,
  MessageReadModel,
} from '@domain/repositories/IMessageReadRepository';

import {
  IMessageDocument,
  MessageModel,
} from '@infrastructure/persistence/mongo/models/MessageModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoMessageReadRepository implements IMessageReadRepository {
  // ─────────────────────────────────────────────────────────────────────────
  // Find by ID
  // ─────────────────────────────────────────────────────────────────────────

  async findById(instanceId: string, messageId: string): Promise<MessageReadModel | null> {
    try {
      const doc = await MessageModel.findOne({
        instanceId,
        messageId,
      })
        .lean<IMessageDocument>()
        .exec();

      return doc ? this.toReadModel(doc) : null;
    } catch (error) {
      throw new InfrastructureError('Failed to find message by id', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Find chat messages
  // ─────────────────────────────────────────────────────────────────────────

  async findByChat(
    instanceId: string,
    chatId: string,
    limit = 50,
    cursor?: IMessageCursor
  ): Promise<IMessagePage> {
    try {
      const filter: Record<string, unknown> = {
        instanceId,
        chatId,
      };

      if (cursor) {
        filter.$or = [
          {
            timestamp: {
              $lt: cursor.timestamp,
            },
          },
          {
            timestamp: cursor.timestamp,
            messageId: {
              $lt: cursor.messageId,
            },
          },
        ];
      }

      const docs = await MessageModel.find(filter)
        .sort({
          timestamp: -1,
          messageId: -1,
        })
        .limit(limit + 1)
        .lean<IMessageDocument[]>()
        .exec();
      const hasNextPage = docs.length > limit;

      const items = hasNextPage ? docs.slice(0, limit) : docs;

      const nextCursor = hasNextPage ? this.toCursor(items[items.length - 1]) : undefined;

      return {
        items: items.map((doc) => this.toReadModel(doc)),
        nextCursor,
      };
    } catch (error) {
      throw new InfrastructureError('Failed to find messages by chat', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Latest message
  // ─────────────────────────────────────────────────────────────────────────

  async findLatestByChat(instanceId: string, chatId: string): Promise<MessageReadModel | null> {
    try {
      const doc = await MessageModel.findOne({
        instanceId,
        chatId,
      })
        .sort({
          timestamp: -1,
          messageId: -1,
        })
        .lean<IMessageDocument>()
        .exec();

      return doc ? this.toReadModel(doc) : null;
    } catch (error) {
      throw new InfrastructureError('Failed to find latest message by chat', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Exists
  // ─────────────────────────────────────────────────────────────────────────

  async exists(instanceId: string, messageId: string): Promise<boolean> {
    try {
      const result = await MessageModel.exists({
        instanceId,
        messageId,
      });

      return result !== null;
    } catch (error) {
      throw new InfrastructureError('Failed to check message existence', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Count
  // ─────────────────────────────────────────────────────────────────────────

  async countByChat(instanceId: string, chatId: string): Promise<number> {
    try {
      return await MessageModel.countDocuments({
        instanceId,
        chatId,
      });
    } catch (error) {
      throw new InfrastructureError('Failed to count messages by chat', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mapper
  // ─────────────────────────────────────────────────────────────────────────

  private toReadModel(doc: IMessageDocument): MessageReadModel {
    return {
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
    };
  }

  private toCursor(doc: IMessageDocument): IMessageCursor {
    return {
      timestamp: new Date(doc.timestamp),
      messageId: doc.messageId,
    };
  }
}
