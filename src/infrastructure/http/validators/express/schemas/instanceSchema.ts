import { Schema, ValidationChain } from 'express-validator';

import { webhookUrlValidator } from '@infrastructure/http/validators/custom/WebhookUrlValidator';

export const createInstanceSchema: Schema = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'Name is required' },
    isString: { errorMessage: 'Name is required' },
    trim: true,
    notEmpty: { errorMessage: 'Name cannot be null or empty' },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'name must be between 1 and 100 characters',
    },
  },
  webhookUrl: {
    in: ['body'],
    optional: true,
    isURL: {
      options: { protocols: ['http', 'https'], require_protocol: true },
      errorMessage: 'Invalid webhook URL',
    },
  },
  usePairingCode: {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'Value must be boolean' },
    toBoolean: true,
    custom: {
      options: (value, { req }) => {
        if (value && !req.body.phoneNumber) {
          throw new Error('phoneNumber is required when usePairingCode is true');
        }
        return true;
      },
    },
  },
  phoneNumber: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Phone Number must be a string' },
    trim: true,
    matches: {
      options: [/^\+?\d{10,15}$/],
      errorMessage: 'Phone number malformed',
    },
  },
};

export const createInstanceSchemaWithWebhookValidation: ValidationChain[] = [webhookUrlValidator()];

export const instanceIdSchema: Schema = {
  instanceId: {
    in: ['params'],
    isUUID: { errorMessage: 'Invalid id' },
  },
};
