import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { CreateInstanceController } from '../controllers/instances/CreateInstanceController';
import { DeleteInstanceController } from '../controllers/instances/DeleteInstanceController';
import { DisconnectInstanceController } from '../controllers/instances/DisconnectInstanceController';
import { validate } from '../middlewares/ValidationMiddleware';
import {
  createInstanceSchema,
  instanceIdSchema,
} from '../validators/express/schemas/instanceSchema';

export const createInstanceRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager,
  container: ContainerBuilder
): Router => {
  const router = Router();
  const qetQRController = container.get('http.controller.get_qr');
  const createController = container.get('http.controller.instance.creator'); // new CreateInstanceController(repository, connectionManager);
  const listController = container.get('http.controller.instances.get.instances');
  const getInstanceController = container.get('http.controller.instances.get.instance');
  const qrStatusController = container.get('http.controller.qr_status');
  const deleteInstanceController = container.get('http.controller.instance.eraser');
  const disconnectController = new DisconnectInstanceController(connectionManager);

  router.post(
    '/',
    validate(createInstanceSchema),
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
  // router.get(
  //   '/:instanceId/qr/view',
  //   validate(instanceIdSchema),
  //   (req: Request, res: Response, next: NextFunction) =>
  //     qetQRController.renderQRPage(req, res, next)
  // );

  // API JSON del QR y status
  router.get(
    '/:instanceId/qr/status',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => qrStatusController.handle(req, res, next)
  );
  router.get(
    '/:instanceId/qr',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => qetQRController.handle(req, res, next)
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

  return router;
};
