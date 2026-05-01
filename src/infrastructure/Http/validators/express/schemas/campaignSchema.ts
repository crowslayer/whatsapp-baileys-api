import { Schema } from 'express-validator';

export const campaignIdSchema: Schema = {
  campaignId: {
    in: ['params'],
    isUUID: { errorMessage: 'Invalid id' },
  },
};

const instanceIdInBodySchema: Schema = {
  instanceId: {
    in: ['body'],
    exists: true,
    notEmpty: true,
    isUUID: { errorMessage: 'Invalid id' },
  },
};

const numbersSchema: Schema = {
  numbers: {
    in: ['body'],
    exists: { errorMessage: 'numbers is required for campaign' },
    isArray: {
      options: { min: 1, max: 5000 },
      errorMessage: 'At least one participant required and maximun 5000',
    },
  },
  'numbers.*': {
    isString: { errorMessage: 'participant must be string' },
    trim: true,
    matches: { options: [/^\+?\d{10,15}$/], errorMessage: 'numbers not foud or malformed' },
  },
};

const nameSchema: Schema = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'Name is required' },
    isString: { errorMessage: 'Name must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'Name is required' },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'name must be between 1 and 100 characters',
    },
  },
};

const descriptionSchema: Schema = {
  description: {
    in: ['body'],
    exists: { errorMessage: 'description of campaign is required' },
    isString: { errorMessage: 'description must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'description is required' },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: 'description must be between 1 and 200 characters',
    },
  },
};

const messageSchema: Schema = {
  message: {
    in: ['body'],
    exists: { errorMessage: 'message of campaign is required' },
    isString: { errorMessage: 'message must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'message is required' },
    isLength: {
      options: { min: 1, max: 1000 },
      errorMessage: 'the message must be between 1 and 1000 characters',
    },
  },
};

export const createCampaignSchema: Schema = {
  ...instanceIdInBodySchema,
  ...nameSchema,
  ...messageSchema,
  ...descriptionSchema,
  ...numbersSchema,
};

export const updateCampaignSchema: Schema = {
  ...campaignIdSchema,
  ...instanceIdInBodySchema,
  ...nameSchema,
  ...messageSchema,
  ...descriptionSchema,
  ...numbersSchema,
};
