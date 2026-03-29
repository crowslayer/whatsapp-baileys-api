export interface IBaileysChat {
  chatId: string;
  name: string;
  type: 'chat' | 'group';
  phoneNumber?: string;
  unreadCount: number;
  lastMessageTimestamp?: Date;
  isArchived: boolean;
  isMuted: boolean;
  participantCount?: number;
  description?: string;
  profilePictureUrl?: string;
}
/**
 * Payload del evento chats.update de Baileys v7.
 * Solo contiene los campos que cambiaron en esa actualización + chatId obligatorio.
 */
export type IBaileysChatUpdate = Partial<IBaileysChat> & { chatId: string };
