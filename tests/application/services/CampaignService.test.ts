import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  normalizeBulk: vi.fn(),
  delay: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@shared/infrastructure/utils/normalizeBulk', () => ({
  normalizeBulk: mocks.normalizeBulk,
}));

vi.mock('node:timers/promises', () => ({
  setTimeout: mocks.delay,
}));

import { CampaignService } from '../../../src/application/services/CampaignService';

describe('CampaignService', () => {
  let runtimeManager: any;
  let orchestrator: any;
  let logger: any;

  beforeEach(() => {
    vi.clearAllMocks();

    runtimeManager = {
      get: vi.fn(),
    };

    orchestrator = {
      send: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  it('should send campaign without whatsapp validation', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: ['5219991111111', '5219992222222'],
      invalid: ['invalid'],
    });

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    orchestrator.send.mockResolvedValue(undefined);

    const result = await service.sendCampaign({
      instanceId: 'instance-1',
      numbers: ['a', 'b', 'c'],
      message: 'hello',
      validateWhatsApp: false,
    });

    expect(orchestrator.send).toHaveBeenCalledTimes(2);

    expect(orchestrator.send).toHaveBeenNthCalledWith(1, 'instance-1', '5219991111111', 'hello');

    expect(orchestrator.send).toHaveBeenNthCalledWith(2, 'instance-1', '5219992222222', 'hello');

    expect(result).toEqual({
      success: 2,
      failed: 0,
      total: 2,
    });
  });

  it('should validate numbers against whatsapp', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: ['521111', '521222'],
      invalid: [],
    });

    const adapter = {
      profile: {
        checkWhatsAppNumber: vi.fn().mockResolvedValue([
          {
            jid: '521111@s.whatsapp.net',
            exists: true,
          },
          {
            jid: '521222@s.whatsapp.net',
            exists: false,
          },
        ]),
      },
    };

    runtimeManager.get.mockReturnValue(adapter);

    orchestrator.send.mockResolvedValue(undefined);

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    const result = await service.sendCampaign({
      instanceId: 'instance-1',
      numbers: ['1', '2'],
      message: 'hello',
      validateWhatsApp: true,
    });

    expect(adapter.profile.checkWhatsAppNumber).toHaveBeenCalledWith(['521111', '521222']);

    expect(orchestrator.send).toHaveBeenCalledTimes(1);

    expect(orchestrator.send).toHaveBeenCalledWith('instance-1', '521111@s.whatsapp.net', 'hello');

    expect(result).toEqual({
      success: 1,
      failed: 0,
      total: 1,
    });
  });

  it('should throw when instance is not connected', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: ['521111'],
      invalid: [],
    });

    runtimeManager.get.mockReturnValue(undefined);

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    await expect(
      service.sendCampaign({
        instanceId: 'instance-1',
        numbers: ['1'],
        message: 'hello',
        validateWhatsApp: true,
      })
    ).rejects.toThrow('Instance not connected');
  });

  it('should count failed messages', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: ['521111', '521222', '521333'],
      invalid: [],
    });

    orchestrator.send
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined);

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    const result = await service.sendCampaign({
      instanceId: 'instance-1',
      numbers: ['1', '2', '3'],
      message: 'hello',
      validateWhatsApp: false,
    });

    expect(result).toEqual({
      success: 2,
      failed: 1,
      total: 3,
    });

    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('should trigger cooldown every 20 messages', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: Array.from({ length: 20 }, (_, i) => `521999${i}`),
      invalid: [],
    });

    orchestrator.send.mockResolvedValue(undefined);

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    await service.sendCampaign({
      instanceId: 'instance-1',
      numbers: [],
      message: 'hello',
      validateWhatsApp: false,
    });

    expect(logger.info).toHaveBeenCalledWith('Cooling down...');
  });

  it('should trigger long pause every 100 messages', async () => {
    mocks.normalizeBulk.mockReturnValue({
      valid: Array.from({ length: 100 }, (_, i) => `521999${i}`),
      invalid: [],
    });

    orchestrator.send.mockResolvedValue(undefined);

    const service = new CampaignService(runtimeManager, orchestrator, logger);

    await service.sendCampaign({
      instanceId: 'instance-1',
      numbers: [],
      message: 'hello',
      validateWhatsApp: false,
    });

    expect(logger.info).toHaveBeenCalledWith('Long pause to avoid ban...');
  });
});
