import { NextFunction, Request, Response, Router } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { CreateInstanceController } from '../controllers/instances/CreateInstanceController';
import { DeleteInstanceController } from '../controllers/instances/DeleteInstanceController';
import { DisconnectInstanceController } from '../controllers/instances/DisconnectInstanceController';
import { GetInstanceController } from '../controllers/instances/GetInstanceController';
import { GetInstancesController } from '../controllers/instances/GetInstancesController';
import { GetQRController } from '../controllers/instances/GetQRController';
import { QRViewController } from '../controllers/QRViewController';
import { validate } from '../middlewares/ValidationMiddleware';
import {
  createInstanceSchema,
  instanceIdSchema,
} from '../validators/express/schemas/instanceSchema';

export const createInstanceRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const qrViewController = new QRViewController(repository);
  const createController = new CreateInstanceController(repository, connectionManager);
  const listController = new GetInstancesController(repository);
  const getInstanceController = new GetInstanceController(repository);
  const getQrController = new GetQRController(repository);
  const deleteInstanceController = new DeleteInstanceController(repository, connectionManager);
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
  router.get(
    '/:instanceId/qr/view',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      qrViewController.renderQRPage(req, res, next)
  );

  // API JSON del QR y status
  router.get(
    '/:instanceId/qr/status',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      qrViewController.getQRStatus(req, res, next)
  );
  router.get(
    '/:instanceId/qr',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => getQrController.handle(req, res, next)
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
