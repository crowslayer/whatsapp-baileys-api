import { Contact, GroupMetadata, WACallEvent, WAMessage } from '@whiskeysockets/baileys';
import { Label } from '@whiskeysockets/baileys/lib/Types/Label';

import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';
import {
  Asociacion,
  IBaileysEventHandlers,
  IGroupParticipantsUpdate,
  IPresenceUpdate,
} from '@application/events/IBaileysEventHandlers';

import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';
import { WebhookService } from '@infrastructure/http/webhooks/WebhookService';
import { ILogger } from '@infrastructure/loggers/Logger';

export class BaileysEventHandlers implements IBaileysEventHandlers {
  constructor(
    private readonly instance: WhatsAppInstanceAggregate,
    private readonly syncService: IChatSynchronizer,
    private readonly webhookService: WebhookService,
    private readonly logger: ILogger
    // Private readonly botService: IBotService
  ) {}

  // ─────────────────────────────────────────────
  // Messages
  // ─────────────────────────────────────────────
  async onMessage(message: WAMessage): Promise<void> {
    try {
      const text = this.extractText(message);
      const chatId = message.key.remoteJid;

      if (!text) return;

      // await this.botService.handleMessage(this.instance.instanceId, chatId, text);

      // opcional: seguir enviando webhook
      await this.webhookService.send(this.instance.instanceId, 'message', {
        message,
      });
    } catch (error) {
      this.logger.error('Error handling message event', error);
    }
  }

  // ─────────────────────────────────────────────
  // Chats
  // ─────────────────────────────────────────────
  async onChatsUpsert(chats: IBaileysChat[], isFirstSync: boolean): Promise<void> {
    try {
      this.logger.info('ChatsUpser Event');
      await this.syncService.syncChats(this.instance.instanceId, chats, isFirstSync);
    } catch (error) {
      this.logger.error('Error syncing chats', error);
    }
  }

  async onChatsUpdate(updates: IBaileysChatUpdate[]): Promise<void> {
    try {
      this.logger.info('Baileys onChatsUpdate');
      await this.syncService.updateChats(this.instance.instanceId, updates);
    } catch (error) {
      this.logger.error('Error updating chats', error);
    }
  }

  async onChatsDelete(chatIds: string[]): Promise<void> {
    try {
      this.logger.info('Baileys onChatDelete');
      await this.syncService.deleteChats(this.instance.instanceId, chatIds);
    } catch (error) {
      this.logger.error('Error deleting chats', error);
    }
  }

  // ─────────────────────────────────────────────
  // Contacts
  // ─────────────────────────────────────────────
  async onContactsUpsert(contacts: Contact[]): Promise<void> {
    try {
      this.logger.info('Baileys ContactUpser');
      await this.webhookService.send(this.instance.instanceId, 'contacts.upsert', { contacts });
    } catch (error) {
      this.logger.error('Error contacts upsert', error);
    }
  }

  async onContactsUpdate(contacts: Partial<Contact>[]): Promise<void> {
    try {
      this.logger.info('Baileys ContactUpdate');
      await this.webhookService.send(this.instance.instanceId, 'contacts.update', { contacts });
    } catch (error) {
      this.logger.error('Error contacts update', error);
    }
  }

  // ─────────────────────────────────────────────
  // Presence
  // ─────────────────────────────────────────────
  async onPresenceUpdate(presence: IPresenceUpdate): Promise<void> {
    try {
      this.logger.info('Baileys Presence Update', presence);
      await this.webhookService.send(this.instance.instanceId, 'presence.update', { presence });
    } catch (error) {
      this.logger.error('Error presence update', error);
    }
  }

  // ─────────────────────────────────────────────
  // Groups
  // ─────────────────────────────────────────────
  async onGroupsUpsert(groups: GroupMetadata[]): Promise<void> {
    try {
      const chats = groups.map((g) => ({
        chatId: String(g.id),
        name: g.subject || g.id,
        type: 'group' as const,
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        participantCount: g.participants?.length,
        description: g.desc,
      }));
      this.logger.info('Baileys Groups Upsert');
      await this.syncService.syncChats(this.instance.instanceId, chats, true);
    } catch (error) {
      this.logger.error('Error groups upsert', error);
    }
  }

  async onGroupsUpdate(groups: Partial<GroupMetadata>[]): Promise<void> {
    try {
      const partial = groups.map((g) => ({
        chatId: String(g.id),
        name: g.subject ?? undefined,
        description: g.desc ?? undefined,
      }));
      this.logger.info('Baileys Group Update');
      await this.syncService.updateChats(this.instance.instanceId, partial);
    } catch (error) {
      this.logger.error('Error groups update', error);
    }
  }

  async onGroupParticipantsUpdate(update: IGroupParticipantsUpdate): Promise<void> {
    try {
      this.logger.info('Baileys Group Update Parciticipants');
      await this.webhookService.send(this.instance.instanceId, 'group.participants', { update });
    } catch (error) {
      this.logger.error('Error group participants update', error);
    }
  }

  // ─────────────────────────────────────────────
  // Calls
  // ─────────────────────────────────────────────
  async onCall(call: WACallEvent[]): Promise<void> {
    try {
      this.logger.info('Baileys Call event');
      await this.webhookService.send(this.instance.instanceId, 'call', { call });
    } catch (error) {
      this.logger.error('Error call event', error);
    }
  }

  // ─────────────────────────────────────────────
  // Labels
  // ─────────────────────────────────────────────
  async onLabelsAssociation(association: Asociacion): Promise<void> {
    try {
      await this.webhookService.send(this.instance.instanceId, 'labels.association', {
        association,
      });
    } catch (error) {
      this.logger.error('Error labels association', error);
    }
  }

  async onLabelsEdit(label: Label): Promise<void> {
    try {
      await this.webhookService.send(this.instance.instanceId, 'labels.edit', { label });
    } catch (error) {
      this.logger.error('Error labels edit', error);
    }
  }
  // Helper
  private extractText(msg: WAMessage): string | null {
    return (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      null
    );
  }
}
