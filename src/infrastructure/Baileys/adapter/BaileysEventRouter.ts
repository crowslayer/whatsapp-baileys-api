import { Chat, WASocket } from '@whiskeysockets/baileys';

import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';

import { IBaileysEventHandlers } from '@infrastructure/baileys/adapter/IBaileysEventHandlers';
import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

export class BaileysEventRouter {
  constructor(
    private readonly socket: WASocket,
    private readonly instance: WhatsAppInstanceAggregate,
    private readonly handlers: IBaileysEventHandlers
  ) {}

  bind() {
    this.socket.ev.process(async (events) => {
      // ─────────────────────────────────────────────
      // 📩 Messages
      // ─────────────────────────────────────────────
      if (events['messages.upsert']) {
        const { messages, type } = events['messages.upsert'];

        if (type === 'notify') {
          await Promise.all(
            messages.map((msg) => {
              if (!msg.key.fromMe && msg.message) {
                return this.handlers.onMessage?.(msg);
              }
            })
          );
        }
      }

      // ─────────────────────────────────────────────
      // 🧠 History Sync
      // ─────────────────────────────────────────────
      if (events['messaging-history.set']) {
        const { chats } = events['messaging-history.set'];

        if (chats?.length) {
          const mapped = chats.map((chat) => this.mapChat(chat)).filter((c) => c !== null);
          await this.handlers.onChatsUpsert?.(mapped, true);
        }
      }

      // ─────────────────────────────────────────────
      // 💬 Chats
      // ─────────────────────────────────────────────
      if (events['chats.upsert']) {
        const mapped = events['chats.upsert'].map((c) => this.mapChat(c)).filter((c) => c !== null);

        if (mapped.length > 0) {
          await this.handlers.onChatsUpsert?.(mapped, false);
        }
      }

      if (events['chats.update']) {
        const partial = events['chats.update'].map((u) => ({
          chatId: String(u.id),
          ...(u.unreadCount !== undefined && { unreadCount: u.unreadCount ?? 0 }),
          ...(u.archived !== undefined && { isArchived: u.archived ?? false }),
          ...(u.muteEndTime !== undefined && { isMuted: Number(u.muteEndTime) > 0 }),
        }));

        await this.handlers.onChatsUpdate?.(partial);
      }

      if (events['chats.delete']) {
        await this.handlers.onChatsDelete?.(events['chats.delete']);
      }

      // ─────────────────────────────────────────────
      // 👤 Contacts
      // ─────────────────────────────────────────────
      if (events['contacts.upsert']) {
        await this.handlers.onContactsUpsert?.(events['contacts.upsert']);
      }

      if (events['contacts.update']) {
        await this.handlers.onContactsUpdate?.(events['contacts.update']);
      }

      // ─────────────────────────────────────────────
      // 🟢 Presence
      // ─────────────────────────────────────────────
      if (events['presence.update']) {
        await this.handlers.onPresenceUpdate?.(events['presence.update']);
      }

      // ─────────────────────────────────────────────
      // 👥 Groups
      // ─────────────────────────────────────────────
      if (events['groups.upsert']) {
        await this.handlers.onGroupsUpsert?.(events['groups.upsert']);
      }

      if (events['groups.update']) {
        await this.handlers.onGroupsUpdate?.(events['groups.update']);
      }

      if (events['group-participants.update']) {
        await this.handlers.onGroupParticipantsUpdate?.(events['group-participants.update']);
      }

      // ─────────────────────────────────────────────
      // 📞 Calls
      // ─────────────────────────────────────────────
      if (events['call']) {
        await this.handlers.onCall?.(events['call']);
      }

      // ─────────────────────────────────────────────
      // 🏷️ Labels
      // ─────────────────────────────────────────────
      if (events['labels.association']) {
        await this.handlers.onLabelsAssociation?.(events['labels.association']);
      }

      if (events['labels.edit']) {
        await this.handlers.onLabelsEdit?.(events['labels.edit']);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Mapper → Infra → Domain shape
  // ─────────────────────────────────────────────
  private mapChat(chat: Chat): IBaileysChat | null {
    if (!chat?.id) return null;

    return {
      chatId: String(chat.id),
      name: chat.name || chat.id,
      type: chat.id.endsWith('@g.us') ? 'group' : 'chat',
      unreadCount: chat.unreadCount ?? 0,
      isArchived: chat.archived ?? false,
      isMuted: !!chat.muteEndTime,
    };
  }
}
