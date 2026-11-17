import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import {
  createFlowSchema,
  createNodesSchema,
  flowIdSchema,
  updateFlowSchema,
} from '@apps/backend/http/validators/express/schemas/flowSchema';
import { instanceIdSchema } from '@apps/backend/http/validators/express/schemas/instanceSchema';

export const createFlowsRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const qetListFlowsController = container.get('infrastructure.http.controllers.flows.list_flows');
  const createFlowController = container.get('infrastructure.http.controllers.flows.create_flow');
  const updateFlowController = container.get('infrastructure.http.controllers.flows.update_flow');
  const deleteFlowController = container.get('infrastructure.http.controllers.flows.delete_flow');
  const getFlowcontroller = container.get('infrastructure.http.controllers.flows.get_flow');
  const createNodesController = container.get('infrastructure.http.controllers.flows.create_nodes');
  const deleteNodesController = container.get('infrastructure.http.controllers.flows.delete_nodes');

  router.get(
    '/:instanceId/flows',
    validate(instanceIdSchema),
    ControllerAdapter(qetListFlowsController)
  );

  router.get('/:flowId', validate(flowIdSchema), ControllerAdapter(getFlowcontroller));

  router.post('/', validate(createFlowSchema), ControllerAdapter(createFlowController));

  router.post('/nodes', validate(createNodesSchema), ControllerAdapter(createNodesController));

  router.put('/', validate(updateFlowSchema), (req: Request, res: Response, next: NextFunction) =>
    updateFlowController.handle(req, res, next)
  );

  router.delete('/:flowId', validate(flowIdSchema), ControllerAdapter(deleteFlowController));

  router.delete('/:flowId/nodes', validate(flowIdSchema), ControllerAdapter(deleteNodesController));

  return router;
};
