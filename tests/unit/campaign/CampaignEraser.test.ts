import { CampaignEraser } from '../../../src/application/campaign/delete/CampaignEraser'
import { CampaignId } from '../../../src/domain/campaign/CampaignId'

describe('CampaignEraser', () => {
  test('execute calls repository.delete with campaignId', async () => {
    const mockRepo = { delete: vi.fn() }
    const eraser = new CampaignEraser(mockRepo)
    const campaignId = CampaignId.fromString('camp-1')

    await eraser.execute(campaignId)

    expect(mockRepo.delete).toHaveBeenCalledWith(campaignId)
    expect(mockRepo.delete).toHaveBeenCalledTimes(1)
  })

  test('handles repository delete errors', async () => {
    const mockRepo = { delete: vi.fn().mockRejectedValue(new Error('DB error')) }
    const eraser = new CampaignEraser(mockRepo)
    const campaignId = CampaignId.fromString('camp-1')

    await expect(eraser.execute(campaignId)).rejects.toThrow('DB error')
  })
})
