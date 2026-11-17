import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import { ChatReadModel } from '@modules/chats/domain/IChatReadRepository';
import {
  ChatModel,
  IChatDocument,
} from '@modules/chats/infrastructure/persistence/mongo/ChatModel';

export class MongoChatReadRepository extends MongoRepository {
  async findById(chatId: string, instanceId: string): Promise<ChatReadModel | null> {
    try {
      const doc = await ChatModel.findOne({ chatId, instanceId });
      return doc ? this.toReadModel(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findByInstance(instanceId: string): Promise<ChatReadModel[]> {
    try {
      const docs = await ChatModel.find({ instanceId }).sort({ lastMessageTimestamp: -1 });
      return docs.map((d) => this.toReadModel(d));
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findChatsByInstance(instanceId: string): Promise<ChatReadModel[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'chat' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toReadModel(d));
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findGroupsByInstance(instanceId: string): Promise<ChatReadModel[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'group' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toReadModel(d));
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async exists(chatId: string, instanceId: string): Promise<boolean> {
    try {
      const count = await ChatModel.countDocuments({ chatId, instanceId });
      return count > 0;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async countByInstance(instanceId: string): Promise<number> {
    try {
      return await ChatModel.countDocuments({ instanceId });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  private toReadModel(chat: IChatDocument): ChatReadModel {
    return {
      chatId: chat.chatId,
      instanceId: chat.instanceId,
      type: chat.type,
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
}
