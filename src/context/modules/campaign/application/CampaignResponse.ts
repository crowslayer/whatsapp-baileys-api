export class CampaignResponse<T> {
  constructor(readonly content: T) {}

  static create<T>(content: T): CampaignResponse<T> {
    return new CampaignResponse(content);
  }
}
