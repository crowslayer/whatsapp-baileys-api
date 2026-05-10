import { WhatsAppChat } from '@domain/queries/IChatReadRepository';

import { ChatModel, IChatDocument } from '@infrastructure/persistence/mongo/models/ChatModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoChatReadRepository {
  async findById(chatId: string, instanceId: string): Promise<WhatsAppChat | null> {
    try {
      const doc = await ChatModel.findOne({ chatId, instanceId });
      return doc ? this.toReadProjection(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to find chat by id: ${chatId}`, error);
    }
  }

  async findByInstance(instanceId: string): Promise<WhatsAppChat[]> {
    try {
      const docs = await ChatModel.find({ instanceId }).sort({ lastMessageTimestamp: -1 });
      return docs.map((d) => this.toReadProjection(d));
    } catch (error) {
      throw new InfrastructureError(`Failed to find chats by instance: ${instanceId}`, error);
    }
  }

  async findChatsByInstance(instanceId: string): Promise<WhatsAppChat[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'chat' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toReadProjection(d));
    } catch (error) {
      throw new InfrastructureError(
        `Failed to find individual chats by instance: ${instanceId}`,
        error
      );
    }
  }

  async findGroupsByInstance(instanceId: string): Promise<WhatsAppChat[]> {
    try {
      const docs = await ChatModel.find({ instanceId, type: 'group' }).sort({
        lastMessageTimestamp: -1,
      });
      return docs.map((d) => this.toReadProjection(d));
    } catch (error) {
      throw new InfrastructureError(`Failed to find group chats by instance: ${instanceId}`, error);
    }
  }

  async exists(chatId: string, instanceId: string): Promise<boolean> {
    try {
      const count = await ChatModel.countDocuments({ chatId, instanceId });
      return count > 0;
    } catch (error) {
      throw new InfrastructureError(`Failed to check chat existence: ${chatId}`, error);
    }
  }

  async countByInstance(instanceId: string): Promise<number> {
    try {
      return await ChatModel.countDocuments({ instanceId });
    } catch (error) {
      throw new InfrastructureError(`Failed to count chats by instance: ${instanceId}`, error);
    }
  }

  private toReadProjection(chat: IChatDocument): WhatsAppChat {
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
