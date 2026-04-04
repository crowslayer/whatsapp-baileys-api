import {
  Contact,
  GroupMetadata,
  GroupParticipant,
  PresenceData,
  WACallEvent,
  WAMessage,
} from '@whiskeysockets/baileys';
import { Label } from '@whiskeysockets/baileys/lib/Types/Label';

import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

/** Presencia por JID — tipado del evento presence.update de Baileys */
export interface IPresenceUpdate {
  id: string;
  presences: Record<string, PresenceData>;
}

/** Actualización de participantes de grupo — tipado del evento group-participants.update */
export interface IGroupParticipantsUpdate {
  id: string;
  participants: GroupParticipant[];
  action: 'add' | 'remove' | 'promote' | 'demote' | 'modify';
}
type Event = { reason: string; code: number; recoverable: boolean };
// ─── Interface principal ──────────────────────────────────────────────────────

export interface IBaileysConnectionOptions {
  instanceId: string;

  // ── Conexión ───────────────────────────────────────────────────────────────
  // void | Promise<void> permite tanto handlers síncronos como async
  // sin forzar a quien implementa a devolver siempre una Promise
  onQRCode?: (qrBase64: string, qrText: string) => void | Promise<void>;
  onPairingCode?: (code: string) => void | Promise<void>;
  onConnected?: (phoneNumber: string) => void | Promise<void>;
  onConnectionClosed?: (event: Event) => void | Promise<void>;
  // ── Mensajes ───────────────────────────────────────────────────────────────
  onMessage?: (message: WAMessage) => void | Promise<void>;

  // ── Chats ─────────────────────────────────────────────────────────────────
  /**
   * Disparado por dos eventos de Baileys:
   *   - messaging-history.set → histórico inicial tras conectar  (isFullSync = true)
   *   - chats.upsert          → chat nuevo en tiempo real        (isFullSync = false)
   *
   * La capa de aplicación usa isFullSync para decidir entre
   * deleteByInstance + saveMany (full refresh) o upsertMany (incremental).
   */
  onChatsUpsert?: (chats: IBaileysChat[], isFullSync: boolean) => void | Promise<void>;

  /**
   * Disparado por chats.update.
   * Solo lleva los campos que cambiaron (unreadCount, lastMessageTimestamp,
   * isArchived, isMuted) más chatId. No reemplaza el documento completo.
   */
  onChatsUpdate?: (updates: IBaileysChatUpdate[]) => void | Promise<void>;

  /** Disparado por chats.delete cuando el usuario elimina un chat */
  onChatsDelete?: (chatIds: string[]) => void | Promise<void>;

  // ── Contactos ─────────────────────────────────────────────────────────────
  onContactsUpsert?: (contacts: Contact[]) => void | Promise<void>;
  /** Actualización parcial — no todos los campos están garantizados */
  onContactsUpdate?: (contacts: Partial<Contact>[]) => void | Promise<void>;

  // ── Presencia ─────────────────────────────────────────────────────────────
  /** Requiere llamar a adapter.subscribePresence(jid) primero */
  onPresenceUpdate?: (update: IPresenceUpdate) => void | Promise<void>;

  // ── Grupos ────────────────────────────────────────────────────────────────
  onGroupsUpsert?: (groups: GroupMetadata[]) => void | Promise<void>;
  /** Actualización parcial de metadata de grupo */
  onGroupsUpdate?: (updates: Partial<GroupMetadata>[]) => void | Promise<void>;
  onGroupParticipantsUpdate?: (update: IGroupParticipantsUpdate) => void | Promise<void>;

  // ── Llamadas ──────────────────────────────────────────────────────────────
  onCall?: (calls: WACallEvent[]) => void | Promise<void>;

  // ── Labels ────────────────────────────────────────────────────────────────
  onLabelsAssociation?: (association: any) => void | Promise<void>;
  onLabelsEdit?: (labels: Label) => void | Promise<void>;
}
