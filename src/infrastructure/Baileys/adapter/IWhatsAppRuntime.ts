import { IGroupService } from '@infrastructure/baileys/adapter/IGroupService';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { IPresenceService } from '@infrastructure/baileys/adapter/IPresenceService';
import { IProfileService } from '@infrastructure/baileys/adapter/IProfileService';

export interface IWhatsAppRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
  get messaging(): IMessageService;
  get groups(): IGroupService;

  get profile(): IProfileService;

  get presence(): IPresenceService;
}
