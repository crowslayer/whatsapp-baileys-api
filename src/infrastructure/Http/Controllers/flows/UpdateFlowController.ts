import { Request, Response } from 'express';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';

export class UpdateFlowController {
  constructor(private readonly service: FlowAdminService) {}
  async handle(req: Request, res: Response) {
    const flowId = req.params.flowId;
    const patch = req.body;
    if (!flowId) return res.status(400).json({ error: 'flowId required' });
    await this.service.updateFlow(flowId, patch);
    res.json({ success: true, flowId });
  }
}
