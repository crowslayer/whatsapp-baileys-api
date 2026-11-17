import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignProcessor } from '@modules/campaign/application/processor/CampaignProcessor';
import { CampaignRunner } from '@modules/campaign/application/run/runner/CampaignRunner';

describe('CampaignRunner', () => {
  let processor: { run: ReturnType<typeof vi.fn> };
  let runner: CampaignRunner;

  beforeEach(() => {
    vi.clearAllMocks();

    processor = { run: vi.fn() };
    runner = new CampaignRunner(processor as unknown as CampaignProcessor);
  });

  it('should run the processor with the worker identifier', async () => {
    vi.mocked(processor.run).mockResolvedValue(undefined);

    await runner.execute('worker-1');

    expect(processor.run).toHaveBeenCalledWith('worker-1');
    expect(processor.run).toHaveBeenCalledTimes(1);
  });

  it('should resolve without content when the processor finishes', async () => {
    vi.mocked(processor.run).mockResolvedValue(undefined);

    const result = await runner.execute('worker-1');

    expect(result).toBeUndefined();
  });

  it('should propagate the error thrown by the processor', async () => {
    vi.mocked(processor.run).mockRejectedValue(new Error('worker crashed'));

    await expect(runner.execute('worker-1')).rejects.toThrow('worker crashed');
  });
});
