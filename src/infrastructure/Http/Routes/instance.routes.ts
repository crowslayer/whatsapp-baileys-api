import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { InstanceController } from '../Controllers/InstanceController';
import { validate } from '../Middlewares/ValidationMiddleware';
import { QRViewController } from '../Controllers/QRViewController';



export const createInstanceRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const controller = new InstanceController(repository, connectionManager);
  const qrViewController = new QRViewController(repository);

  router.post(
    '/',
    validate([
      body('name').isString().notEmpty().withMessage('Name is required'),
      body('webhookUrl').optional().isURL().withMessage('Invalid webhook URL'),
      body('usePairingCode').optional().isBoolean(),
      body('phoneNumber').optional().isString().matches(/^\d{10,15}$/),
    ]),
    (req:Request, res:Response, next:NextFunction) => controller.create(req, res, next)
  );

  router.get('/', (req:Request, res:Response, next:NextFunction) => controller.list(req, res, next));

  router.get(
    '/:instanceId',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => controller.getById(req, res, next)
  );
  // Vista HTML del QR
  router.get(
    '/:instanceId/qr/view',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => qrViewController.renderQRPage(req, res, next)
  );

  // API JSON del QR y status
  router.get(
    '/:instanceId/qr/status',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => qrViewController.getQRStatus(req, res,next)
  );
  router.get(
    '/:instanceId/qr',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => controller.getQR(req, res,next)
  );

  router.delete(
    '/:instanceId',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => controller.delete(req, res,next)
  );

  router.post(
    '/:instanceId/disconnect',
    validate([param('instanceId').isString().notEmpty()]),
    (req:Request, res:Response, next:NextFunction) => controller.disconnect(req, res,next)
  );

  return router;
}