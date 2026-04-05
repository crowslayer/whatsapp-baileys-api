export interface ICampaignRequest {
  instanceId: string;
  numbers: string[];
  message: string;
  validateWhatsApp?: boolean;
}

export interface ICampaignResult {
  success: number;
  failed: number;
  total: number;
}
