import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IPresenceService } from '@shared/domain/whatsapp/IPresenceService';
import { IPrivacyService } from '@shared/domain/whatsapp/IPrivacyService';
import { IProfileService } from '@shared/domain/whatsapp/IProfileService';

import { IChatStateService } from '@modules/chats/application/IChatStateService';
import { IGroupService } from '@modules/groups/domain/IGroupService';

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
  get privacy(): IPrivacyService;
  get chatState(): IChatStateService;
}
