export class CampaignResponse<T> {
  constructor(readonly content: T) {}

  static create<T>(stats: T): CampaignResponse<T> {
    return new CampaignResponse(stats);
  }
}
