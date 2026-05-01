import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import {
  campaignIdSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from '@infrastructure/http/validators/express/schemas/campaignSchema';

export const createChatsRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const CreateCampaignController = container.get(
    'infrastructure.http.controller.campaign.create_campaign'
  );
  const deleteCampaignController = container.get(
    'infrastructure.http.controller.campaign.delete_campaign'
  );
  const updateCampaignController = container.get(
    'infrastructure.http.controller.campaign.update_campaign'
  );
  const listCampaignController = container.get(
    'infrastructure.http.controller.campaign.list_campaign'
  );
  const progressCampaignController = container.get(
    'infrastructure.http.controller.campaign.progress_campaign'
  );

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    listCampaignController.handle(req, res, next)
  );

  router.post(
    '/',
    validate(createCampaignSchema),
    (req: Request, res: Response, next: NextFunction) =>
      CreateCampaignController.handle(req, res, next)
  );

  router.get(
    '/:campaignId/progress',
    validate(campaignIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      progressCampaignController.handle(req, res, next)
  );

  router.put(
    '/:campaignId',
    validate(updateCampaignSchema),
    (req: Request, res: Response, next: NextFunction) =>
      updateCampaignController.handle(req, res, next)
  );

  router.delete(
    '/:campaignId',
    validate(campaignIdSchema),
    (req: Request, res: Response, next: NextFunction) =>
      deleteCampaignController.handle(req, res, next)
  );

  return router;
};
