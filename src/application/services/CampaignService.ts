import { setTimeout as delay } from 'node:timers/promises';

import { ICampaignRequest, ICampaignResult } from '@application/services/ICampaignRequest';
import { ILogger } from '@infrastructure/loggers/Logger';

import { IRuntimeManager } from '@application/runtime/IRuntimeManager';
import { MessageOrchestrator } from '@application/services/MessageOrchestrator';
import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export class CampaignService {
  private _normalizer = new PhoneNormalizer('MX');

  constructor(
    private readonly runtimeManager: IRuntimeManager,
    private readonly orchestrator: MessageOrchestrator,
    private readonly logger: ILogger
  ) {}

  async sendCampaign(request: ICampaignRequest): Promise<ICampaignResult> {
    const { instanceId, numbers, message, validateWhatsApp } = request;

    this.logger.info(`Starting campaign for ${numbers.length} numbers`);

    // 1️ Normalizar + deduplicar
    const { valid, invalid } = normalizeBulk(numbers);

    this.logger.info(`Valid: ${valid.length}, Invalid: ${invalid.length}`);

    let finalList = valid;

    // 2️ Validar contra WhatsApp (opcional)
    if (validateWhatsApp) {
      const adapter = this.runtimeManager.get(instanceId);
      if (!adapter) throw new Error('Instance not connected');

      const check = await adapter.profile.checkWhatsAppNumber(valid);

      finalList = check.filter((r) => r.exists).map((r) => r.jid);

      this.logger.info(`WhatsApp valid: ${finalList.length}`);
    }

    // 3️ Ejecutar envío controlado
    return await this.processQueue(instanceId, finalList, message);
  }

  private async processQueue(
    instanceId: string,
    list: string[],
    message: string
  ): Promise<ICampaignResult> {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < list.length; i++) {
      const jid = list[i];

      try {
        await this.orchestrator.send(instanceId, jid, message);
        success++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed sending to ${jid}`, error);
      }

      // Delay humano
      await delay(this.humanDelay(message));

      // Pausas inteligentes
      if ((i + 1) % 20 === 0) {
        this.logger.info('Cooling down...');
        await delay(5000 + Math.random() * 5000);
      }

      if ((i + 1) % 100 === 0) {
        this.logger.info('Long pause to avoid ban...');
        await delay(20000 + Math.random() * 15000);
      }
    }

    const result = { success, failed, total: list.length };

    this.logger.info('Campaign finished', result);

    return result;
  }

  private humanDelay(text: string): number {
    const base = 800;
    const lengthFactor = Math.min(text.length * 10, 2000);
    return base + lengthFactor + Math.random() * 1000;
  }
}
