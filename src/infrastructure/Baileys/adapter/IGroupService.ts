import { GroupMetadata } from '@whiskeysockets/baileys/lib/Types';

import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

export interface IGroupService {
  createGroup(name: string, participants: string[]): Promise<string>;
  getGroupMetadata(groupId: string): Promise<GroupMetadata>;
  syncGroupsMetadata(): Promise<IBaileysChat[]>;
  addParticipantsToGroup(groupId: string, participants: string[]): Promise<void>;
  removeParticipantsFromGroup(groupId: string, participants: string[]): Promise<void>;
  promoteParticipants(groupId: string, participants: string[]): Promise<void>;
  demoteParticipants(groupId: string, participants: string[]): Promise<void>;
  updateGroupSubject(groupId: string, subject: string): Promise<void>;
  updateGroupDescription(groupId: string, description: string): Promise<void>;
  getGroupInviteLink(groupId: string): Promise<string | undefined>;
  revokeGroupInviteLink(groupId: string): Promise<string | undefined>;
  acceptGroupInvite(code: string): Promise<string | undefined>;
  leaveGroup(groupId: string): Promise<void>;
  updateGroupSettings(
    groupId: string,
    setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
  ): Promise<void>;
}
