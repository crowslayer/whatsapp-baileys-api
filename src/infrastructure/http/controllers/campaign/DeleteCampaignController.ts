import { NextFunction, Request, Response } from 'express';

import { CampaignId } from '@domain/campaign/CampaignId';

import { DeleteCampaignCommand } from '@application/campaign/delete/DeleteCampaignCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DeleteCampaignController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const audit = new AuditDataBuilder('DELETED', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ campaignId: id })
        .build();

      const command = new DeleteCampaignCommand(CampaignId.fromString(id));

      await this.commandBus.dispatch<void>(command);

      ResponseHandler.success(
        res,
        null,
        'Campaign delete successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
