import { NextFunction, Request, Response, Router } from 'express';
import { body, param } from 'express-validator';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { GroupController } from '../Controllers/GroupController';
import { validate } from '../Middlewares/ValidationMiddleware';

export const createGroupRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const controller = new GroupController(repository, connectionManager);

  router.post(
    '/:instanceId/groups',
    validate([
      param('instanceId').isString().notEmpty(),
      body('name').isString().notEmpty().withMessage('Group name is required'),
      body('participants').isArray({ min: 1 }).withMessage('At least one participant required'),
      body('participants.*')
        .isString()
        .matches(/^\d{10,15}@s\.whatsapp\.net$/),
    ]),
    (req: Request, res: Response, next: NextFunction) => controller.create(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/add',
    validate([
      param('instanceId').isString().notEmpty(),
      param('groupId').isString().notEmpty(),
      body('participants').isArray({ min: 1 }),
      body('participants.*')
        .isString()
        .matches(/^\d{10,15}@s\.whatsapp\.net$/),
    ]),
    (req: Request, res: Response, next: NextFunction) => controller.addParticipants(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/remove',
    validate([
      param('instanceId').isString().notEmpty(),
      param('groupId').isString().notEmpty(),
      body('participants').isArray({ min: 1 }),
      body('participants.*')
        .isString()
        .matches(/^\d{10,15}@s\.whatsapp\.net$/),
    ]),
    (req: Request, res: Response, next: NextFunction) =>
      controller.removeParticipants(req, res, next)
  );

  return router;
};
