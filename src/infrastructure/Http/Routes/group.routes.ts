import { NextFunction, Request, Response, Router } from 'express';
import { body, param } from 'express-validator';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AddParticipantsController } from '../controllers/groups/AddParticipantsController';
import { CreateGroupController } from '../controllers/groups/CreateGroupController';
import { RemoveParticipantsController } from '../controllers/groups/RemoveParticipantsController';
import { validate } from '../middlewares/ValidationMiddleware';

export const createGroupRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const createController = new CreateGroupController(repository, connectionManager);
  const addParticipants = new AddParticipantsController(connectionManager);
  const removeParticipants = new RemoveParticipantsController(connectionManager);

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
    (req: Request, res: Response, next: NextFunction) => createController.handle(req, res, next)
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
    (req: Request, res: Response, next: NextFunction) => addParticipants.handle(req, res, next)
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
    (req: Request, res: Response, next: NextFunction) => removeParticipants.handle(req, res, next)
  );

  return router;
};
