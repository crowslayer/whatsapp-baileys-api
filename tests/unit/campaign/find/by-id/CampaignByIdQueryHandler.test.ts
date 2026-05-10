import { CampaignByIdQueryHandler } from '../../../../../src/application/campaign/find/by-id/CampaignByIdQueryHandler'
import { CampaignByIdQuery } from '../../../../../src/application/campaign/find/by-id/CampaignByIdQuery'
import { CampaignResponse } from '../../../../../src/application/campaign/CampaignResponse'

describe('CampaignByIdQueryHandler', () => {
  test('subscribedTo returns CampaignByIdQuery', () => {
    const handler = new CampaignByIdQueryHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(CampaignByIdQuery)
  })

  test('handle returns CampaignResponse with finder result', async () => {
    const campaign = {
      campaignId: 'camp-1',
      name: 'Campaign 1',
      description: 'Desc',
      instanceId: 'inst-1',
      message: 'Hello',
      status: 'draft',
    }
    const mockFinder = { execute: vi.fn().mockResolvedValue(campaign) }
    const handler = new CampaignByIdQueryHandler(mockFinder)
    const query = new CampaignByIdQuery('camp-1')

    const response = await handler.handle(query)

    expect(response).toBeInstanceOf(CampaignResponse)
    expect(response.content).toEqual(campaign)
    expect(mockFinder.execute).toHaveBeenCalledWith('camp-1')
  })

  test('handle returns CampaignResponse with null when not found', async () => {
    const mockFinder = { execute: vi.fn().mockResolvedValue(null) }
    const handler = new CampaignByIdQueryHandler(mockFinder)
    const query = new CampaignByIdQuery('non-existent')

    const response = await handler.handle(query)

    expect(response).toBeInstanceOf(CampaignResponse)
    expect(response.content).toBeNull()
  })
})
