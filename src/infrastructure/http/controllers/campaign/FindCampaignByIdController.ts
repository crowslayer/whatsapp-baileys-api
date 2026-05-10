import { NextFunction, Request, Response } from 'express';

import { CampaignByIdQuery } from '@application/campaign/find/by-id/CampaignByIdQuery';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class FindCampaignByIdController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;

      const audit = new AuditDataBuilder('GET', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ campaign: 'GET' })
        .build();

      const query = new CampaignByIdQuery(campaignId);

      const result = await this.queryBus.ask(query);

      const content = {
        campaign: result.content ?? {},
      };

      ResponseHandler.success(res, content, 'Campaigns successfully', StatusCode.SuccessOK, audit);
    } catch (error) {
      next(error);
    }
  }
}
