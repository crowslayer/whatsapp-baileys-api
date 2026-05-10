import { DeleteCampaignCommandHandler } from '../../../src/application/campaign/delete/DeleteCampaignCommandHandler'
import { DeleteCampaignCommand } from '../../../src/application/campaign/delete/DeleteCampaignCommand'
import { CampaignId } from '../../../src/domain/campaign/CampaignId'

describe('DeleteCampaignCommandHandler', () => {
  test('subscribedTo returns DeleteCampaignCommand', () => {
    const handler = new DeleteCampaignCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(DeleteCampaignCommand)
  })

  test('handle calls eraser.execute with campaignId', async () => {
    const mockEraser = { execute: vi.fn() }
    const handler = new DeleteCampaignCommandHandler(mockEraser)
    const campaignId = CampaignId.fromString('camp-1')
    const command = new DeleteCampaignCommand(campaignId)

    await handler.handle(command)

    expect(mockEraser.execute).toHaveBeenCalledWith(campaignId)
  })
})
