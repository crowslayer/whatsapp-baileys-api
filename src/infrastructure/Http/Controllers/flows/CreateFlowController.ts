import { Request, Response } from 'express';
import { MongoFlowRepository } from '../../../persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';

export class CreateFlowController {
  constructor(private readonly service: FlowAdminService) {}

  async handle(req: Request, res: Response) {
    const { instanceId, flowId, name, version, start, nodes, triggers } = req.body;
    if (!instanceId || !flowId || !name || start == null || !nodes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const flow = { id: flowId, instanceId, name, version: version ?? 1, isActive: true, start, nodes, triggers: triggers ?? [] } as any;
    await this.service.createFlow(flow);
    res.status(201).json({ success: true, flowId, message: 'Flow created' });
  }
}
