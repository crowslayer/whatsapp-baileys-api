import { GroupMetadata, WASocket } from '@whiskeysockets/baileys';

import { BaileysError } from '@shared/infrastructure/baileys/adapter/BaileysError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

import { IChat } from '@modules/chats/domain/IChat';
import { IGroupDetails, IGroupService } from '@modules/groups/domain/IGroupService';

type GroupChat = Omit<IChat, 'instanceId'>;

export class BaileysGroupsService implements IGroupService {
  constructor(private readonly socket: WASocket) {}

  async createGroup(name: string, participants: string[]): Promise<string> {
    try {
      const group = await this.socket.groupCreate(name, participants);
      return group.id;
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to create group for instance`, { cause: error });
    }
  }

  /**
   * Obtiene la metadata completa de un grupo específico.
   */
  async getGroupMetadata(groupId: string): Promise<IGroupDetails> {
    try {
      this.isValidJid(groupId);

      const groupMetadata = await this.socket.groupMetadata(groupId);
      return this.toGroupDetails(groupMetadata);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to get group metadata for instance`, {
        cause: error,
      });
    }
  }

  /**
   * Obtiene metadata de todos los grupos en los que participa.
   * Solo necesario para sincronización explícita; la lectura normal va por el repositorio.
   */
  async syncGroupsMetadata(): Promise<GroupChat[]> {
    try {
      const groups = await this.socket.groupFetchAllParticipating();
      return Object.entries(groups).map(([groupId, meta]) => ({
        chatId: groupId,

        name: meta.subject || groupId,
        type: 'group' as const,
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        participantCount: meta.participants?.length,
        description: meta.desc,
      }));
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to sync group metadata for instance `, {
        cause: error,
      });
    }
  }
  async addParticipantsToGroup(groupId: string, participants: string[]): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupParticipantsUpdate(groupId, participants, 'add');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to add participants for instance `, {
        cause: error,
      });
    }
  }

  async removeParticipantsFromGroup(groupId: string, participants: string[]): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupParticipantsUpdate(groupId, participants, 'remove');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to remove participants sfor instance`, {
        cause: error,
      });
    }
  }

  async promoteParticipants(groupId: string, participants: string[]): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to promote participants for instance`, {
        cause: error,
      });
    }
  }

  async demoteParticipants(groupId: string, participants: string[]): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to demote participants for instance`, {
        cause: error,
      });
    }
  }

  async updateGroupSubject(groupId: string, subject: string): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupUpdateSubject(groupId, subject);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group subject for instance`, {
        cause: error,
      });
    }
  }

  async updateGroupDescription(groupId: string, description: string): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupUpdateDescription(groupId, description);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group description for instance`, {
        cause: error,
      });
    }
  }

  /**
   * Obtiene el link de invitación del grupo.
   */
  async getGroupInviteLink(groupId: string): Promise<string | undefined> {
    try {
      this.isValidJid(groupId);

      return await this.socket.groupInviteCode(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to get group invite link for instance `, {
        cause: error,
      });
    }
  }

  /**
   * Revoca el link de invitación y genera uno nuevo.
   */
  async revokeGroupInviteLink(groupId: string): Promise<string | undefined> {
    try {
      this.isValidJid(groupId);

      return await this.socket.groupRevokeInvite(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to revoke group invite link for instance`, {
        cause: error,
      });
    }
  }

  /**
   * Acepta una invitación de grupo por código.
   */
  async acceptGroupInvite(code: string): Promise<string | undefined> {
    try {
      return await this.socket.groupAcceptInvite(code);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to accept group invite for instance`, {
        cause: error,
      });
    }
  }

  /**
   * Abandona un grupo.
   */
  async leaveGroup(groupId: string): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupLeave(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to leave group for instance`, { cause: error });
    }
  }

  /**
   * Cambia los ajustes del grupo (quién puede enviar mensajes o editar info).
   */
  async updateGroupSettings(
    groupId: string,
    setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
  ): Promise<void> {
    try {
      this.isValidJid(groupId);

      await this.socket.groupSettingUpdate(groupId, setting);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group settings for instance`, {
        cause: error,
      });
    }
  }

  private toGroupDetails(metadata: GroupMetadata): IGroupDetails {
    const participants = metadata.participants.map((participant) => ({
      id: participant.id,
      isAdmin: participant.admin === 'admin',
      isSuperAdmin: participant.admin === 'superadmin',
    }));

    return {
      id: metadata.id,
      subject: metadata.subject,
      description: metadata.desc ?? undefined,
      ownerId: metadata.owner ?? undefined,
      participants,
      creationDate: metadata.creation ? new Date(metadata.creation * 1000) : undefined,
      participantCount: participants.length,
      inviteCode: metadata.inviteCode,
    };
  }

  private isValidJid(jid: string): boolean {
    const isValid =
      jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
    if (!isValid) throw new BaileysError('GroupId is not valid');

    return true;
  }
}
