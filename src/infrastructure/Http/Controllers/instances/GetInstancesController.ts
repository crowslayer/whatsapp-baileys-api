import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { ListInstancesHandler } from '@application/handlers/ListInstancesHandler';
import { ListInstancesQuery } from '@application/queries/ListInstancesQuery';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetInstancesController {
  constructor(private readonly repository: IWhatsAppInstanceRepository) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = new AuditDataBuilder('LIST', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const handler = new ListInstancesHandler(this.repository);
      const query = new ListInstancesQuery();
      const instances = await handler.execute(query);

      const data = instances.map((i) => i.toJSON());

      ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
