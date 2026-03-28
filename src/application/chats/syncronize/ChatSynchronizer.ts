import { ChatAggregate } from '@domain/aggregates/ChatAggregate';
import { IChatRepository } from '@domain/repositories/IChatRepository';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ChatId } from '@domain/value-objects/ChatId';
import { ChatType } from '@domain/value-objects/ChatType';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { SyncChatsCommand } from './SyncChatsCommand';

export class ChatSynchronizer {
  constructor(
    private readonly connectionManager: IConnectionManager,
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(command: SyncChatsCommand): Promise<void> {
    if (command.chats.length === 0) return;

    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }

    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }
    const rawChats = command.chats;

    const aggregates = rawChats.map((raw) =>
      ChatAggregate.create({
        chatId: ChatId.fromString(raw.chatId),
        instanceId: command.instanceId,
        type: ChatType.create(raw.type),
        name: raw.name,
        phoneNumber: raw.phoneNumber,
        unreadCount: raw.unreadCount,
        lastMessageTimestamp: raw.lastMessageTimestamp,
        isArchived: raw.isArchived,
        isMuted: raw.isMuted,
        participantCount: raw.participantCount,
        description: raw.description,
        profilePictureUrl: raw.profilePictureUrl,
      })
    );

    if (command.fullRefresh) {
      await this.chatRepository.deleteByInstance(command.instanceId);
      await this.chatRepository.saveMany(aggregates);
    } else {
      await this.chatRepository.upsertMany(aggregates);
    }
  }
}
