import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import {
  createInstanceSchema,
  createInstanceSchemaWithWebhookValidation,
  instanceIdSchema,
} from '@apps/backend/http/validators/express/schemas/instanceSchema';

export const createInstanceRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const getQRController = container.get('http.controller.get_qr');
  const createController = container.get('http.controller.instance.creator');
  const listController = container.get('http.controller.instances.get.instances');
  const getInstanceController = container.get('http.controller.instances.get.instance');
  const qrStatusController = container.get('http.controller.qr_status');
  const deleteInstanceController = container.get('http.controller.instance.eraser');
  const disconnectController = container.get('http.controller.instance.disconect');
  const connectController = container.get('http.controller.instance.connect');

  router.post(
    '/',
    validate(createInstanceSchema),
    validate(createInstanceSchemaWithWebhookValidation),
    ControllerAdapter(createController)
  );

  router.get('/', ControllerAdapter(listController));

  router.get('/:instanceId', validate(instanceIdSchema), ControllerAdapter(getInstanceController));
  // Vista HTML del QR
  router.get(
    '/:instanceId/qr/view',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      getQRController.renderQRPage(req, res, next)
  );

  // API JSON del QR y status
  router.get(
    '/:instanceId/qr/status',
    validate(instanceIdSchema),
    ControllerAdapter(qrStatusController)
  );
  router.get('/:instanceId/qr', validate(instanceIdSchema), ControllerAdapter(getQRController));

  router.delete(
    '/:instanceId',
    validate(instanceIdSchema),
    ControllerAdapter(deleteInstanceController)
  );

  router.post(
    '/:instanceId/disconnect',
    validate(instanceIdSchema),
    ControllerAdapter(disconnectController)
  );

  router.post(
    '/:instanceId/connect',
    validate(instanceIdSchema),
    ControllerAdapter(connectController)
  );

  return router;
};
