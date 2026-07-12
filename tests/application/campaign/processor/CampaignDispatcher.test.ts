import { describe, expect, vi } from 'vitest';
import { CampaignDispatcher } from '../../../../src/application/campaign/processor/CampaignDispatcher';

describe('CampaignDispatcher', () => {
  test('should return null when no campaigns available', async () => {
    const mockRepo = { findOneAndLock: vi.fn().mockResolvedValue(null) };
    const dispatcher = new CampaignDispatcher(mockRepo);
    const result = await dispatcher.pick('worker-1');
    expect(result).toBeNull();
  });

  test('should return locked campaign', async () => {
    const mockCampaign = { campaignId: { value: 'camp-1' }, status: 'running' };
    const mockRepo = { findOneAndLock: vi.fn().mockResolvedValue(mockCampaign) };
    const dispatcher = new CampaignDispatcher(mockRepo);
    const result = await dispatcher.pick('worker-1');
    expect(result).toEqual(mockCampaign);
    expect(mockRepo.findOneAndLock).toHaveBeenCalled();
  });
});
