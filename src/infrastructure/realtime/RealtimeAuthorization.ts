import { ISocketUser } from '@infrastructure/realtime/SocketGateway';

export interface IRealtimeAuthorization {
  canSubscribeToInstance(user: ISocketUser, instanceId: string): Promise<boolean>;

  canSubscribeToCampaign(user: ISocketUser, campaignId: string): Promise<boolean>;
}

export interface IInstanceAccessChecker {
  canRead(userId: string, instanceId: string): Promise<boolean>;
}

export interface ICampaignAccessChecker {
  canRead(userId: string, campaignId: string): Promise<boolean>;
}

export class RealtimeAuthorization implements IRealtimeAuthorization {
  constructor(
    private readonly instanceAccessChecker: IInstanceAccessChecker,
    private readonly campaignAccessChecker: ICampaignAccessChecker
  ) {}

  async canSubscribeToInstance(user: ISocketUser, instanceId: string): Promise<boolean> {
    if (!user.userId || !instanceId) {
      return false;
    }

    return this.instanceAccessChecker.canRead(user.userId, instanceId);
  }

  async canSubscribeToCampaign(user: ISocketUser, campaignId: string): Promise<boolean> {
    if (!user.userId || !campaignId) {
      return false;
    }

    return this.campaignAccessChecker.canRead(user.userId, campaignId);
  }
}
