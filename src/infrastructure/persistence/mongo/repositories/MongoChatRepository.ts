import { ChatAggregate } from '@domain/aggregates/ChatAggregate';
import { IChatRepository } from '@domain/repositories/IChatRepository';
import { ChatId } from '@domain/value-objects/ChatId';
import { ChatType } from '@domain/value-objects/ChatType';

import { ChatModel, IChatDocument } from '@infrastructure/persistence/mongo/models/ChatModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoChatRepository implements IChatRepository {
  // ─── Write ────────────────────────────────────────────────────────────────

  async save(chat: ChatAggregate): Promise<void> {
    try {
      await new ChatModel(this.toDocument(chat)).save();
    } catch (error) {
      throw new InfrastructureError(`Failed to save chat`, error);
    }
  }

  async saveMany(chats: ChatAggregate[]): Promise<void> {
    try {
      await ChatModel.insertMany(
        chats.map((c) => this.toDocument(c)),
        { ordered: false }
      );
    } catch (error) {
      throw new InfrastructureError(`Failed to save chats in bulk`, error);
    }
  }

  async update(chat: ChatAggregate): Promise<void> {
    try {
      await ChatModel.updateOne(
        { chatId: chat.chatId, instanceId: chat.instanceId },
        { $set: this.toDocument(chat) }
      );
    } catch (error) {
      throw new InfrastructureError(`Failed to update chat`, error);
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
      throw new InfrastructureError(`Failed to upsert chat`, error);
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
      throw new InfrastructureError(`Failed to bulk-upsert chats `, error);
    }
  }

  async delete(chatId: string, instanceId: string): Promise<void> {
    try {
      await ChatModel.deleteOne({ chatId, instanceId });
    } catch (error) {
      throw new InfrastructureError(`Failed to delete chat `, error);
    }
  }

  async deleteByInstance(instanceId: string): Promise<void> {
    try {
      await ChatModel.deleteMany({ instanceId });
    } catch (error) {
      throw new InfrastructureError(`Failed to delete chats for instance `, error);
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findById(chatId: string, instanceId: string): Promise<ChatAggregate | null> {
    try {
      const doc = await ChatModel.findOne({ chatId, instanceId });
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to find chat by id `, error);
    }
  }

  async findByInstance(instanceId: string): Promise<ChatAggregate[]> {
    try {
      const docs = await ChatModel.find({ instanceId }).sort({ lastMessageTimestamp: -1 });
      return docs.map((d) => this.toDomain(d));
    } catch (error) {
      throw new InfrastructureError(`Failed to find chats by instance `, error);
    }
  }

  async findChatsByInstance(instanceId: string): Promise<ChatAggregate[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'chat' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toDomain(d));
    } catch (error) {
      throw new InfrastructureError(`Failed to find individual chats by instance `, error);
    }
  }

  async findGroupsByInstance(instanceId: string): Promise<ChatAggregate[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'group' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toDomain(d));
    } catch (error) {
      throw new InfrastructureError(`Failed to find group chats by instance `, error);
    }
  }

  async exists(chatId: string, instanceId: string): Promise<boolean> {
    try {
      const count = await ChatModel.countDocuments({ chatId, instanceId });
      return count > 0;
    } catch (error: any) {
      throw new InfrastructureError(`Failed to check chat existence: ${error.message}`, error);
    }
  }

  async countByInstance(instanceId: string): Promise<number> {
    try {
      return await ChatModel.countDocuments({ instanceId });
    } catch (error: any) {
      throw new InfrastructureError(`Failed to count chats by instance: ${error.message}`, error);
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

  private toDomain(doc: IChatDocument): ChatAggregate {
    return ChatAggregate.restore({
      chatId: ChatId.fromString(doc.chatId),
      instanceId: doc.instanceId,
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
