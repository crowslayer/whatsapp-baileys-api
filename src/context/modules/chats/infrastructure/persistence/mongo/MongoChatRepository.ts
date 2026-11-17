import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import { ChatAggregate } from '@modules/chats/domain/ChatAggregate';
import { ChatId } from '@modules/chats/domain/ChatId';
import { ChatNotFoundError } from '@modules/chats/domain/ChatNotFoundError';
import { ChatType } from '@modules/chats/domain/ChatType';
import { IChatRepository } from '@modules/chats/domain/IChatRepository';
import {
  ChatModel,
  IChatDocument,
} from '@modules/chats/infrastructure/persistence/mongo/ChatModel';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

export class MongoChatRepository extends MongoRepository implements IChatRepository {
  // ─── Write ────────────────────────────────────────────────────────────────

  async save(chat: ChatAggregate): Promise<void> {
    try {
      await new ChatModel(this.toDocument(chat)).save();
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async saveMany(chats: ChatAggregate[]): Promise<void> {
    try {
      await ChatModel.insertMany(
        chats.map((c) => this.toDocument(c)),
        { ordered: false }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(chat: ChatAggregate): Promise<void> {
    try {
      await ChatModel.updateOne(
        { chatId: chat.chatId, instanceId: chat.instanceId },
        { $set: this.toDocument(chat) }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async upsert(chat: ChatAggregate): Promise<void> {
    try {
      await ChatModel.updateOne(
        { chatId: chat.chatId, instanceId: chat.instanceId },
        { $set: this.toDocument(chat) },
        { upsert: true }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async upsertMany(chats: ChatAggregate[]): Promise<void> {
    if (chats.length === 0) return;
    try {
      const ops = chats.map((chat) => ({
        updateOne: {
          filter: { chatId: chat.chatId, instanceId: chat.instanceId },
          update: { $set: this.toDocument(chat) },
          upsert: true,
        },
      }));
      await ChatModel.bulkWrite(ops, { ordered: false });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(chatId: string, instanceId: string): Promise<void> {
    try {
      await ChatModel.deleteOne({ chatId, instanceId });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async deleteByInstance(instanceId: string): Promise<void> {
    try {
      await ChatModel.deleteMany({ instanceId });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findById(chatId: ChatId, instanceId: InstanceId): Promise<ChatAggregate> {
    try {
      const doc = await ChatModel.findOne({ chatId: chatId.value, instanceId: instanceId.value });
      if (!doc) {
        throw new ChatNotFoundError('Chat not found');
      }
      return this.toAggregate(doc);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private toDocument(chat: ChatAggregate): Record<string, unknown> {
    return {
      chatId: chat.chatId,
      instanceId: chat.instanceId,
      type: chat.type.value,
      name: chat.name,
      phoneNumber: chat.phoneNumber,
      unreadCount: chat.unreadCount,
      lastMessageTimestamp: chat.lastMessageTimestamp,
      isArchived: chat.isArchived,
      isMuted: chat.isMuted,
      participantCount: chat.participantCount,
      description: chat.description,
      profilePictureUrl: chat.profilePictureUrl,
    };
  }

  private toAggregate(doc: IChatDocument): ChatAggregate {
    return ChatAggregate.restore({
      chatId: ChatId.fromString(doc.chatId),
      instanceId: InstanceId.fromString(doc.instanceId),
      type: ChatType.create(doc.type),
      name: doc.name,
      phoneNumber: doc.phoneNumber,
      unreadCount: doc.unreadCount,
      lastMessageTimestamp: doc.lastMessageTimestamp,
      isArchived: doc.isArchived,
      isMuted: doc.isMuted,
      participantCount: doc.participantCount,
      description: doc.description,
      profilePictureUrl: doc.profilePictureUrl,
      createdAt: CreatedAt.create(doc.createdAt),
      updatedAt: UpdatedAt.create(doc.updatedAt),
    });
  }
}
