import { Schema } from 'express-validator';

export const createInstanceSchema: Schema = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'Name is required' },
    isString: { errorMessage: 'Name is required' },
    trim: true,
    escape: true,
    notEmpty: { errorMessage: 'Name can be null' },
  },
  webhookUrl: {
    in: ['body'],
    optional: true,
    isURL: { errorMessage: 'Invalid webhook URL' },
  },
  usePairingCode: {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'Value must be boolean' },
  },
  phoneNumber: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Phone Number must be a string' },
    matches: {
      options: [/^\d{10,15}$/],
      errorMessage: 'Phone number malformed',
    },
  },
};

export const instanceIdSchema: Schema = {
  instanceId: {
    in: ['params'],
    isString: { errorMessage: 'Id not found' },
    notEmpty: { errorMessage: 'instanceId is required' },
    isUUID: { errorMessage: 'Invalid id' },
  },
};
