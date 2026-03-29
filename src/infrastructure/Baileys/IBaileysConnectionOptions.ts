import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';

export interface IBaileysConnectionOptions {
  instanceId: string;
  onQRCode?: (qrBase64: string, qrText: string) => void;
  onPairingCode?: (code: string) => void;
  onConnected?: (phoneNumber: string) => void;
  onDisconnected?: (reason?: string) => void;
  onMessage?: (message: any) => void;
  /**
   * Disparado por dos eventos de Baileys:
   *   - messaging-history.set → histórico inicial tras conectar  (isFullSync = true)
   *   - chats.upsert          → chat nuevo en tiempo real        (isFullSync = false)
   *
   * La capa de aplicación usa isFullSync para decidir entre
   * deleteByInstance + saveMany (full refresh) o upsertMany (incremental).
   */
  onChatsUpsert?: (chats: IBaileysChat[], isFullSync: boolean) => Promise<void>;

  /**
   * Disparado por chats.update.
   * Solo lleva los campos que cambiaron (unreadCount, lastMessageTimestamp,
   * isArchived, isMuted) más chatId. No reemplaza el documento completo.
   */
  onChatsUpdate?: (updates: IBaileysChatUpdate[]) => Promise<void>;

  /**
   * Disparado por chats.delete cuando el usuario elimina un chat.
   */
  onChatsDelete?: (chatIds: string[]) => Promise<void>;

  // ── Contactos ─────────────────────────────────────────────────────────────
  onContactsUpsert?: (contacts: any[]) => Promise<void>;
  onContactsUpdate?: (contacts: any[]) => Promise<void>;

  // ── Presencia ─────────────────────────────────────────────────────────────
  /** Requiere llamar a adapter.subscribePresence(jid) primero */
  onPresenceUpdate?: (update: any) => Promise<void>;

  // ── Grupos ────────────────────────────────────────────────────────────────
  onGroupsUpsert?: (groups: any[]) => Promise<void>;
  onGroupsUpdate?: (updates: any[]) => Promise<void>;
  onGroupParticipantsUpdate?: (update: any) => Promise<void>;

  // ── Llamadas ──────────────────────────────────────────────────────────────
  onCall?: (calls: any[]) => Promise<void>;

  // ── Labels ────────────────────────────────────────────────────────────────
  onLabelsAssociation?: (association: any) => Promise<void>;
  onLabelsEdit?: (labels: any[]) => Promise<void>;
}
