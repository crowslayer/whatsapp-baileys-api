export interface ICampaignProjection {
  campaignId: string;
  instanceId: string;
  name: string;
  description: string;
  status: string;
  message: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
}

export type CampaignReadModel = Pick<
  ICampaignProjection,
  'campaignId' | 'instanceId' | 'name' | 'description' | 'message' | 'status'
>;

export type CampaignStats = {
  total: number;
  running: number;
  scheduled: number;
  completed: number;
  paused: number;
};

export interface ICampaignReadRepository {
  list(limit: number, skip: number): Promise<CampaignReadModel[]>;
  getSummary(campaignId: string): Promise<CampaignReadModel | null>;
  getStats(): Promise<CampaignStats>;
  getProgress(campaignId: string): Promise<number>;
  getById(campaignId: string): Promise<CampaignReadModel | null>;
}
