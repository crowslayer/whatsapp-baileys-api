import { NextFunction, Request, Response, Router } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AddParticipantsController } from '../controllers/groups/AddParticipantsController';
import { CreateGroupController } from '../controllers/groups/CreateGroupController';
import { RemoveParticipantsController } from '../controllers/groups/RemoveParticipantsController';
import { validate } from '../middlewares/ValidationMiddleware';
import {
  addParticipantsSchema,
  createGroupSchema,
  removeParticipantsSchema,
} from '../validators/express/schemas/groupsSchema';

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
    validate(createGroupSchema),
    (req: Request, res: Response, next: NextFunction) => createController.handle(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/add',
    validate(addParticipantsSchema),
    (req: Request, res: Response, next: NextFunction) => addParticipants.handle(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/remove',
    validate(removeParticipantsSchema),
    (req: Request, res: Response, next: NextFunction) => removeParticipants.handle(req, res, next)
  );

  return router;
};
