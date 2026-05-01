import { Request, Response } from 'express';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';

export class ListFlowsController {
  constructor(private readonly service: FlowAdminService) {}
  async handle(req: Request, res: Response) {
    const instanceId = req.query.instanceId as string;
    if (!instanceId) return res.status(400).json({ error: 'instanceId required' });
    const flows = await this.service.listFlows(instanceId);
    res.json({ flows });
  }
}
