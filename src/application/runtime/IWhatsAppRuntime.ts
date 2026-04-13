import { IGroupService } from '@infrastructure/baileys/adapter/IGroupService';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { IPresenceService } from '@infrastructure/baileys/adapter/IPresenceService';
import { IProfileService } from '@infrastructure/baileys/adapter/IProfileService';

type DisconnectEvent = {
  type: 'TRANSIENT' | 'INVALID_SESSION' | 'LOGGED_OUT';
  reason?: string;
};

export interface IWhatsAppRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
  onDisconnect(handler: (event: DisconnectEvent) => void): void;
  get messaging(): IMessageService;
  get groups(): IGroupService;
  get profile(): IProfileService;
  get presence(): IPresenceService;
}
