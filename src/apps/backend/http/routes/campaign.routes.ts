import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import {
  campaignIdSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from '@apps/backend/http/validators/express/schemas/campaignSchema';

export const createCampaignRouter = (container: ContainerBuilder): Router => {
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

  const campaignByIdController = container.get(
    'infrastructure.http.controller.campaign.get_campaign_by_id'
  );

  router.get('/', ControllerAdapter(listCampaignController));

  router.get('/:campaignId', validate(campaignIdSchema), ControllerAdapter(campaignByIdController));

  router.post('/', validate(createCampaignSchema), ControllerAdapter(CreateCampaignController));

  router.get(
    '/:campaignId/progress',
    validate(campaignIdSchema),
    ControllerAdapter(progressCampaignController)
  );

  router.put(
    '/:campaignId',
    validate(updateCampaignSchema),
    ControllerAdapter(updateCampaignController)
  );

  router.delete(
    '/:campaignId',
    validate(campaignIdSchema),
    ControllerAdapter(deleteCampaignController)
  );

  return router;
};
