import {
  Contact,
  GroupMetadata,
  GroupParticipant,
  PresenceData,
  WACallEvent,
  WAMessage,
} from '@whiskeysockets/baileys';
import { Label } from '@whiskeysockets/baileys/lib/Types/Label';
import { LabelAssociation } from '@whiskeysockets/baileys/lib/Types/LabelAssociation';

import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';

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

export type Asociacion =
  | {
      association: LabelAssociation;
      type: 'add' | 'remove';
    }
  | undefined;

export interface IBaileysEventHandlers {
  onMessage?: (message: WAMessage) => Promise<void>;
  onChatsUpsert?: (chats: IBaileysChat[], isFullSync: boolean) => void | Promise<void>;
  onChatsUpdate?: (updates: IBaileysChatUpdate[]) => void | Promise<void>;
  onChatsDelete?: (chatIds: string[]) => Promise<void>;
  onContactsUpsert?: (contacts: Contact[]) => void | Promise<void>;
  onContactsUpdate?: (contacts: Partial<Contact>[]) => void | Promise<void>;
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
  onLabelsAssociation?: (association: Asociacion) => void | Promise<void>;
  onLabelsEdit?: (labels: Label) => void | Promise<void>;
}
