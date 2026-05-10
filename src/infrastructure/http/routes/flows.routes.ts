import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import {
  createFlowSchema,
  createNodesSchema,
  flowIdSchema,
  updateFlowSchema,
} from '@infrastructure/http/validators/express/schemas/flowSchema';
import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

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
    (req: Request, res: Response, next: NextFunction) =>
      qetListFlowsController.handle(req, res, next)
  );

  router.get(
    '/:flowId',
    validate(flowIdSchema),
    (req: Request, res: Response, next: NextFunction) => getFlowcontroller.handle(req, res, next)
  );

  router.post('/', validate(createFlowSchema), (req: Request, res: Response, next: NextFunction) =>
    createFlowController.handle(req, res, next)
  );

  router.post(
    '/nodes',
    validate(createNodesSchema),
    (req: Request, res: Response, next: NextFunction) =>
      createNodesController.handle(req, res, next)
  );

  router.put('/', validate(updateFlowSchema), (req: Request, res: Response, next: NextFunction) =>
    updateFlowController.handle(req, res, next)
  );

  router.delete(
    '/:flowId',
    validate(flowIdSchema),
    (req: Request, res: Response, next: NextFunction) => deleteFlowController.handle(req, res, next)
  );

  router.delete(
    '/:flowId/nodes',
    validate(flowIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      deleteNodesController.handle(req, res, next)
  );

  return router;
};
