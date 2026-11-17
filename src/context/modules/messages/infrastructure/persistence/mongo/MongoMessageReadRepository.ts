import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import {
  IMessageCursor,
  IMessagePage,
  IMessageReadRepository,
  MessageReadModel,
} from '@modules/messages/domain/IMessageReadRepository';
import {
  IMessageDocument,
  MessageModel,
} from '@modules/messages/infrastructure/persistence/mongo/MessageModel';

export class MongoMessageReadRepository extends MongoRepository implements IMessageReadRepository {
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
      throw this.translateError(error);
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
      throw this.translateError(error);
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
      throw this.translateError(error);
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
      throw this.translateError(error);
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
      throw this.translateError(error);
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
