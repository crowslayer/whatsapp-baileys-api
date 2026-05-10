import { CampaignFinderById } from '../../../../../src/application/campaign/find/by-id/CampaignFinderById'

describe('CampaignFinderById', () => {
  test('execute returns campaign from repository', async () => {
    const expected = {
      campaignId: 'camp-1',
      name: 'Campaign 1',
      description: 'Desc',
      instanceId: 'inst-1',
      message: 'Hello',
      status: 'draft',
    }
    const mockRepo = { getById: vi.fn().mockResolvedValue(expected) }
    const finder = new CampaignFinderById(mockRepo)

    const result = await finder.execute('camp-1')

    expect(result).toEqual(expected)
    expect(mockRepo.getById).toHaveBeenCalledWith('camp-1')
  })

  test('execute returns null when not found', async () => {
    const mockRepo = { getById: vi.fn().mockResolvedValue(null) }
    const finder = new CampaignFinderById(mockRepo)

    const result = await finder.execute('non-existent')

    expect(result).toBeNull()
  })
})
