import { NextFunction, Request, Response } from 'express';

import { ICampaignStats } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';
import { FindProgressQuery } from '@application/campaign/find/progress/CampaignProgressQuery';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ProgressCampaignsContrller {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const audit = new AuditDataBuilder('GET', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ campaign: 'GET' })
        .build();

      const query = new FindProgressQuery(id);

      const result = await this.queryBus.ask<CampaignResponse<ICampaignStats>>(query);

      const content = {
        campaigns: result.content,
      };

      ResponseHandler.success(
        res,
        content,
        'Campaigns list successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
