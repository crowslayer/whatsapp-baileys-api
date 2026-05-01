import { Request, Response } from 'express';
import { MongoFlowRepository } from '../../../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';

export class GetFlowController {
  constructor(private readonly service: FlowAdminService) {}

  async handle(req: Request, res: Response) {
    const { flowId } = req.params;
    const flow = await this.service.getFlow(flowId);
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    res.json({ flow });
  }
}
