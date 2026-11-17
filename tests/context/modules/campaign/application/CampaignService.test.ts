import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn(async () => undefined) }));

import { CampaignService } from '@modules/campaign/application/CampaignService';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import type { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import type { ILogger } from '@shared/domain/Logger';

const createLogger = (): ILogger => ({
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn(),
});

describe('CampaignService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('deduplicates valid JIDs and reports successful and failed deliveries', async () => {
    // Arrange
    const orchestrator = { send: vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('send failed')) } as unknown as MessageOrchestrator;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;
    const service = new CampaignService(runtimeManager, orchestrator, createLogger());

    // Act
    const result = await service.sendCampaign({
      instanceId: 'instance-1', numbers: ['one@s.whatsapp.net', 'two@s.whatsapp.net', 'one@s.whatsapp.net', 'invalid'],
      message: 'Hello',
    });

    // Assert
    expect(result).toEqual({ success: 1, failed: 1, total: 2 });
    expect(orchestrator.send).toHaveBeenCalledTimes(2);
    expect(runtimeManager.get).not.toHaveBeenCalled();
  });

  it('filters recipients by WhatsApp availability when validation is enabled', async () => {
    // Arrange
    const checkWhatsAppNumber = vi.fn().mockResolvedValue([
      { exists: true, jid: 'one@s.whatsapp.net' }, { exists: false, jid: 'two@s.whatsapp.net' },
    ]);
    const runtimeManager = { get: vi.fn().mockReturnValue({ profile: { checkWhatsAppNumber } }) } as unknown as IRuntimeManager;
    const orchestrator = { send: vi.fn().mockResolvedValue(undefined) } as unknown as MessageOrchestrator;
    const service = new CampaignService(runtimeManager, orchestrator, createLogger());

    // Act
    const result = await service.sendCampaign({
      instanceId: 'instance-1', numbers: ['one@s.whatsapp.net', 'two@s.whatsapp.net'],
      message: 'Hello', validateWhatsApp: true,
    });

    // Assert
    expect(checkWhatsAppNumber).toHaveBeenCalledWith(['one@s.whatsapp.net', 'two@s.whatsapp.net']);
    expect(orchestrator.send).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: 1, failed: 0, total: 1 });
  });
});
