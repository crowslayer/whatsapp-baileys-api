import express from 'express';
import { CreateFlowController } from '../../Controllers/flows/CreateFlowController';
import { ListFlowsController } from '../../Controllers/flows/ListFlowsController';
import { GetFlowController } from '../../Controllers/flows/GetFlowController';
import { UpdateFlowController } from '../../Controllers/flows/UpdateFlowController';
import { DeleteFlowController } from '../../Controllers/flows/DeleteFlowController';
import { FlowAdminService } from '../../../../application/bot/FlowAdminService';
import { MongoFlowRepository } from '../../../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowStore } from '../../../../infrastructure/persistence/Mongo/Repositories/FlowStore';

export function installFlowsRoutes(app: any) {
  const repo = new MongoFlowRepository();
  const flowStore = new FlowStore(repo);
  const admin = new FlowAdminService(repo as any, flowStore as any);

  const router = express.Router();
  router.post('/flows', (req: any, res: any) => new CreateFlowController(admin).handle(req, res));
  router.get('/flows', (req: any, res: any) => new ListFlowsController(admin).handle(req, res));
  router.get('/flows/:flowId', (req: any, res: any) => new GetFlowController(admin).handle(req, res));
  router.put('/flows/:flowId', (req: any, res: any) => new UpdateFlowController(admin).handle(req, res));
  router.delete('/flows/:flowId', (req: any, res: any) => new DeleteFlowController(admin).handle(req, res));

  app.use('/api/v1', router);
}
