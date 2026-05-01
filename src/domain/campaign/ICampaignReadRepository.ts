export interface ICampaignListItem {
  campaignId: string;
  name: string;
  status: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
}

export interface ICampaignItem {
  campaignId: string;
  name: string;
  description: string;
  instanceId: string;
  message: string;
  status: string;
}

export interface ICampaignStats {
  total: number;
  running: number;
  scheduled: number;
  completed: number;
  paused: number;
}
export interface ICampaignReadRepository {
  list(limit: number, skip: number): Promise<ICampaignListItem[]>;
  getSummary(campaignId: string): Promise<ICampaignListItem | null>;
  getStats(): Promise<ICampaignStats>;
  getProgress(campaignId: string): Promise<number>;
  getById(campaignId: string): Promise<ICampaignItem | null>;
}
