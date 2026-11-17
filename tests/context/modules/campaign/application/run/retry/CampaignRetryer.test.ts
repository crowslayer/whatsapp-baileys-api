import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignRetryWorker } from '@modules/campaign/application/processor/CampaignRetryWorker';
import { CampaignRetryer } from '@modules/campaign/application/run/retry/CampaignRetryer';

describe('CampaignRetryer', () => {
  let retryWorker: { run: ReturnType<typeof vi.fn> };
  let retryer: CampaignRetryer;

  beforeEach(() => {
    vi.clearAllMocks();

    retryWorker = { run: vi.fn() };
    retryer = new CampaignRetryer(retryWorker as unknown as CampaignRetryWorker);
  });

  it('should run the retry worker appending the retry suffix to the worker identifier', async () => {
    vi.mocked(retryWorker.run).mockResolvedValue(undefined);

    await retryer.execute('worker-1');

    expect(retryWorker.run).toHaveBeenCalledWith('worker-1-retry');
    expect(retryWorker.run).toHaveBeenCalledTimes(1);
  });

  it('should resolve without content when the retry worker finishes', async () => {
    vi.mocked(retryWorker.run).mockResolvedValue(undefined);

    const result = await retryer.execute('worker-1');

    expect(result).toBeUndefined();
  });

  it('should propagate the error thrown by the retry worker', async () => {
    vi.mocked(retryWorker.run).mockRejectedValue(new Error('worker crashed'));

    await expect(retryer.execute('worker-1')).rejects.toThrow('worker crashed');
  });
});
