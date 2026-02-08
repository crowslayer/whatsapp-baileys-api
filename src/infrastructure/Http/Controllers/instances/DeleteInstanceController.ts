import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DeleteInstanceController {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DELETE', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      await this.connectionManager.logoutInstance(instanceId);
      await this.repository.delete(instanceId);

      ResponseHandler.success(res, null, 'Instance deleted successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
