export interface IChatReadProjection {
  chatId: string;
  instanceId: string;
  type: 'individual' | 'group';
  name: string;
  phoneNumber?: string;
  unreadCount: number;
  lastMessageTimestamp?: Date;
  isArchived: boolean;
  isMuted: boolean;
  participantCount?: number;
  description?: string;
  profilePictureUrl?: string;
}

export type WhatsAppChat = IChatReadProjection;

export interface IChatReadRepository {
  findById(chatId: string, instanceId: string): Promise<WhatsAppChat | null>;

  /** All chats belonging to a given WhatsApp instance. */
  findByInstance(instanceId: string): Promise<WhatsAppChat[]>;

  /** Only individual (non-group) chats for a given instance. */
  findIndividualByInstance(instanceId: string): Promise<WhatsAppChat[]>;

  /** Only group chats for a given instance. */
  findGroupsByInstance(instanceId: string): Promise<WhatsAppChat[]>;
}
