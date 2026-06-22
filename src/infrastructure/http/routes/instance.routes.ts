import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import {
  createInstanceSchema,
  createInstanceSchemaWithWebhookValidation,
  instanceIdSchema,
} from '@infrastructure/http/validators/express/schemas/instanceSchema';
// eslint-disable-next-line
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
    (req: Request, res: Response, next: NextFunction) => createController.handle(req, res, next)
  );

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    listController.handle(req, res, next)
  );

  router.get(
    '/:instanceId',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      getInstanceController.handle(req, res, next)
  );
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
    (req: Request, res: Response, next: NextFunction) => qrStatusController.handle(req, res, next)
  );
  router.get(
    '/:instanceId/qr',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => getQRController.handle(req, res, next)
  );

  router.delete(
    '/:instanceId',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      deleteInstanceController.handle(req, res, next)
  );

  router.post(
    '/:instanceId/disconnect',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => disconnectController.handle(req, res, next)
  );

  router.post(
    '/:instanceId/connect',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => connectController.handle(req, res, next)
  );

  return router;
};
