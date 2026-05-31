import { CampaignsResponse } from '../../../src/application/campaign/CampaignsResponse'
import { ICampaignListItem } from '../../../src/domain/campaign/ICampaignReadRepository'

describe('CampaignsResponse', () => {
  test('create with array returns response with content', () => {
    const campaigns: ICampaignListItem[] = [
      {
        campaignId: '1',
        name: 'Campaign 1',
        status: 'draft',
        total: 10,
        sent: 0,
        failed: 0,
        pending: 10,
      },
    ]
    const response = CampaignsResponse.create(campaigns)
    expect(response.content).toEqual(campaigns)
  })

  test('create with empty array returns none()', () => {
    const response = CampaignsResponse.create([])
    expect(response.content).toEqual([])
  })

  test('none() returns response with empty array', () => {
    const response = CampaignsResponse.none()
    expect(response.content).toEqual([])
  })
})
