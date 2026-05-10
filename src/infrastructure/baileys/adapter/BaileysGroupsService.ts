import { GroupMetadata, WASocket } from '@whiskeysockets/baileys';

import { IGroupService } from '@infrastructure/baileys/adapter/IGroupService';
import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysGroupsService implements IGroupService {
  constructor(private readonly socket: WASocket) {}

  async createGroup(name: string, participants: string[]): Promise<string> {
    try {
      const group = await this.socket.groupCreate(name, participants);
      return group.id;
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to create group for instance`, error);
    }
  }

  /**
   * Obtiene la metadata completa de un grupo específico.
   */
  async getGroupMetadata(groupId: string): Promise<GroupMetadata> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      return await this.socket.groupMetadata(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to get group metadata for instance`, error);
    }
  }

  /**
   * Obtiene metadata de todos los grupos en los que participa.
   * Solo necesario para sincronización explícita; la lectura normal va por el repositorio.
   */
  async syncGroupsMetadata(): Promise<IBaileysChat[]> {
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
      throw new WhatsAppConnectionError(`Failed to sync group metadata for instance `, error);
    }
  }
  async addParticipantsToGroup(groupId: string, participants: string[]): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupParticipantsUpdate(groupId, participants, 'add');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to add participants for instance `, error);
    }
  }

  async removeParticipantsFromGroup(groupId: string, participants: string[]): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupParticipantsUpdate(groupId, participants, 'remove');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to remove participants sfor instance`, error);
    }
  }

  async promoteParticipants(groupId: string, participants: string[]): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to promote participants for instance`, error);
    }
  }

  async demoteParticipants(groupId: string, participants: string[]): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to demote participants for instance`, error);
    }
  }

  async updateGroupSubject(groupId: string, subject: string): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupUpdateSubject(groupId, subject);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group subject for instance`, error);
    }
  }

  async updateGroupDescription(groupId: string, description: string): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupUpdateDescription(groupId, description);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group description for instance`, error);
    }
  }

  /**
   * Obtiene el link de invitación del grupo.
   */
  async getGroupInviteLink(groupId: string): Promise<string | undefined> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      return await this.socket.groupInviteCode(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to get group invite link for instance `, error);
    }
  }

  /**
   * Revoca el link de invitación y genera uno nuevo.
   */
  async revokeGroupInviteLink(groupId: string): Promise<string | undefined> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      return await this.socket.groupRevokeInvite(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to revoke group invite link for instance`, error);
    }
  }

  /**
   * Acepta una invitación de grupo por código.
   */
  async acceptGroupInvite(code: string): Promise<string | undefined> {
    try {
      return await this.socket.groupAcceptInvite(code);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to accept group invite for instance`, error);
    }
  }

  /**
   * Abandona un grupo.
   */
  async leaveGroup(groupId: string): Promise<void> {
    try {
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupLeave(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to leave group for instance`, error);
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
      if (!this.isValidJid(groupId)) {
        throw new Error('GroudId not valid');
      }
      await this.socket.groupSettingUpdate(groupId, setting);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update group settings for instance`, error);
    }
  }
  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
