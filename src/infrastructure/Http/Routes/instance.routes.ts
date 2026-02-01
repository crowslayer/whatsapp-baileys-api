import { Router } from 'express';
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
    (req, res) => controller.create(req, res)
  );

  router.get('/', (req, res) => controller.list(req, res));

  router.get(
    '/:instanceId',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => controller.getById(req, res)
  );
  // Vista HTML del QR
  router.get(
    '/:instanceId/qr/view',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => qrViewController.renderQRPage(req, res)
  );

  // API JSON del QR y status
  router.get(
    '/:instanceId/qr/status',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => qrViewController.getQRStatus(req, res)
  );
  router.get(
    '/:instanceId/qr',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => controller.getQR(req, res)
  );

  router.delete(
    '/:instanceId',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => controller.delete(req, res)
  );

  router.post(
    '/:instanceId/disconnect',
    validate([param('instanceId').isString().notEmpty()]),
    (req, res) => controller.disconnect(req, res)
  );

  return router;
}