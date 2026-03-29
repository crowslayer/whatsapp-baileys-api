import { ChatAggregate } from '@domain/aggregates/ChatAggregate';
import { IChatRepository } from '@domain/repositories/IChatRepository';
import { ChatId } from '@domain/value-objects/ChatId';
import { ChatType } from '@domain/value-objects/ChatType';

import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';
import { ILogger } from '@infrastructure/loggers/Logger';

import { IChatSynchronizer } from './IChatSynchronizer';

/**
 * Application Service — sincronización reactiva de chats.
 *
 * Responsabilidades:
 *   - Recibir los DTOs que empuja BaileysAdapter vía callbacks.
 *   - Mapearlos al agregado de dominio.
 *   - Persistirlos a través del repositorio.
 *
 * No es un Command/Handler porque no hay intención explícita del usuario
 * detrás: es sincronización automática disparada por eventos de Baileys.
 * Un Application Service es el lugar correcto para orquestar esto.
 */
export class ChatSynchronizeService implements IChatSynchronizer {
  constructor(
    private readonly _chatRepository: IChatRepository,
    private readonly logger: ILogger
  ) {}

  // ─── Llamado desde onChatsUpsert ────────────────────────────────────────────

  async syncChats(instanceId: string, chats: IBaileysChat[], isFullSync: boolean): Promise<void> {
    if (chats.length === 0) return;

    const aggregates = chats.map((raw) => this.toAggregate(instanceId, raw));

    if (isFullSync) {
      // History sync inicial: reemplaza todo para garantizar consistencia.
      this.logger.info('[Chats] Syncrhonize initital chats');
      await this._chatRepository.deleteByInstance(instanceId);
      await this._chatRepository.saveMany(aggregates);
    } else {
      // Actualizaciones en tiempo real: upsert incremental.
      this.logger.info('[Chats] Update chats');
      await this._chatRepository.upsertMany(aggregates);
    }
  }

  // ─── Llamado desde onChatsUpdate ────────────────────────────────────────────

  async updateChats(instanceId: string, updates: IBaileysChatUpdate[]): Promise<void> {
    if (updates.length === 0) return;

    // Procesamos en paralelo — cada update es independiente
    this.logger.info('[Chats] Update all chats');
    await Promise.all(updates.map((update) => this.applyPartialUpdate(instanceId, update)));
  }

  // ─── Llamado desde onChatsDelete ────────────────────────────────────────────

  async deleteChats(instanceId: string, chatIds: string[]): Promise<void> {
    if (chatIds.length === 0) return;
    this.logger.info('[Chats] Delete chats');
    await Promise.all(chatIds.map((chatId) => this._chatRepository.delete(chatId, instanceId)));
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private toAggregate(instanceId: string, raw: IBaileysChat): ChatAggregate {
    return ChatAggregate.create({
      chatId: ChatId.fromString(raw.chatId),
      instanceId,
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
    });
  }

  private async applyPartialUpdate(instanceId: string, update: IBaileysChatUpdate): Promise<void> {
    const existing = await this._chatRepository.findById(update.chatId, instanceId);

    // Si el chat aún no existe en Mongo (puede pasar en edge cases de timing)
    // simplemente ignoramos la actualización parcial — llegará completo
    // por el siguiente chats.upsert.
    if (!existing) return;

    existing.updateFromBaileys({
      ...(update.unreadCount !== undefined && { unreadCount: update.unreadCount }),
      ...(update.lastMessageTimestamp !== undefined && {
        lastMessageTimestamp: update.lastMessageTimestamp,
      }),
      ...(update.isArchived !== undefined && { isArchived: update.isArchived }),
      ...(update.isMuted !== undefined && { isMuted: update.isMuted }),
    });

    await this._chatRepository.update(existing);
  }
}
