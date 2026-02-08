import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { GetInstanceHandler } from '@application/handlers/GetInstanceHandler';
import { GetInstanceQuery } from '@application/queries/GetInstanceQuery';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetInstanceController {
  constructor(private readonly repository: IWhatsAppInstanceRepository) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('READ', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const handler = new GetInstanceHandler(this.repository);
      const query = new GetInstanceQuery(instanceId);
      const instance = await handler.execute(query);

      ResponseHandler.success(
        res,
        instance.toJSON(),
        'Instance retrieved successfully',
        200,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
