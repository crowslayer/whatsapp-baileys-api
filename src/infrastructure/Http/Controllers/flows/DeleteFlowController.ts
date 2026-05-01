import { Request, Response } from 'express';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';

export class DeleteFlowController {
  constructor(private readonly service: FlowAdminService) {}
  async handle(req: Request, res: Response) {
    const flowId = req.params.flowId;
    if (!flowId) return res.status(400).json({ error: 'flowId required' });
    await this.service.deleteFlow(flowId);
    res.json({ success: true, flowId });
  }
}
