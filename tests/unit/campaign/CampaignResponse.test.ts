import { CampaignResponse } from '../../../src/application/campaign/CampaignResponse'

describe('CampaignResponse', () => {
  test('create wraps content', () => {
    const content = { id: '1', name: 'Test Campaign' }
    const response = CampaignResponse.create(content)
    expect(response.content).toEqual(content)
  })

  test('content getter returns the content', () => {
    const content = { id: '1', name: 'Test Campaign' }
    const response = CampaignResponse.create(content)
    expect(response.content).toBe(content)
  })
})
