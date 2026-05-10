import { Schema } from 'express-validator';

import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

const recipientSchema: Schema = {
  to: {
    in: ['body'],
    exists: { errorMessage: 'Recipient is required' },
    isString: { errorMessage: 'Recipient must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'Recipient is required' },
    matches: {
      options: [/^\+?\d{10,15}$/],
    },
  },
};

const recipientsSchema: Schema = {
  to: {
    in: ['body'],
    exists: { errorMessage: 'Recipients are required' },
    isArray: { options: { min: 1, max: 500 }, errorMessage: 'Must be array (1-500)' },
  },
  'to.*': {
    isString: true,
    trim: true,
    matches: {
      options: [/^\+?\d{10,15}$/],
      errorMessage: 'Each recipient must be a valid phone number',
    },
  },
};

export const messageSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  message: {
    in: ['body'],
    exists: { errorMessage: 'Message is required' },
    isString: { errorMessage: 'Message must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'Message cannot be null or empty' },
    custom: {
      options: (value) => {
        if (value.length > 1000 && value.includes('http')) {
          throw new Error('Suspicious message');
        }
        return true;
      },
    },
    isLength: {
      options: { min: 1, max: 4096 },
      errorMessage: 'Message must be between 1 and 4096 characters',
    },
  },
};

const captionSchema: Schema = {
  caption: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Caption must be string' },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: 'Message must be between 1 and 200 characters',
    },
  },
};

const filenameSchema: Schema = {
  fileName: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Filename must be string' },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: 'Message must be between 1 and 200 characters',
    },
  },
};

export const imageSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  ...captionSchema,
  ...filenameSchema,
};

export const documentSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  ...captionSchema,
};

export const audioSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  ptt: {
    in: ['body'],
    optional: true,
    isBoolean: true,
    toBoolean: true,
  },
};

export const videoSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  ...captionSchema,
  gifPlayback: {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'gifPlayback must be a boolean' },
  },
  ...filenameSchema,
};

export const locationSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  latitude: {
    in: ['body'],
    exists: { errorMessage: 'Latitude is required' },
    isFloat: { options: { min: -90, max: 90 }, errorMessage: 'Valid latitude is required' },
  },
  longitude: {
    in: ['body'],
    exists: { errorMessage: 'Longitude is required' },
    isFloat: { options: { min: -180, max: 180 }, errorMessage: 'Valid longitude is required' },
  },
  name: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Name must be a string' },
    isLength: {
      options: { min: 1, max: 500 },
      errorMessage: 'Message must be between 1 and 500 characters',
    },
  },
  address: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Address must be a string' },
    isLength: {
      options: { min: 1, max: 1000 },
      errorMessage: 'Message must be between 1 and 1000 characters',
    },
  },
};

export const reactionSchema: Schema = {
  ...instanceIdSchema,
  messageId: {
    in: ['body'],
    exists: { errorMessage: 'MessageId is required' },
    isString: { errorMessage: 'MessageId must be string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'MessageId cannot be empty' },
  },
  chatId: {
    in: ['body'],
    exists: { errorMessage: 'ChatId is required' },
    isString: { errorMessage: 'ChatId must be string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'ChatId cannot be empty' },
  },
  emoji: {
    in: ['body'],
    exists: { errorMessage: 'emoji is required' },
    isString: { errorMessage: 'emoji must be string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'Emoji cannot be empty' },
    isLength: {
      options: { min: 1, max: 10 },
      errorMessage: 'Message must be between 1 and 10 characters',
    },
  },
};

export const contactSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  contacts: {
    exists: { errorMessage: 'Contact is required' },
    isArray: { options: { min: 1, max: 10 }, errorMessage: 'Contact must be Array' },
    isLength: { options: { max: 5000 } },
  },
  'contacts.*.displayName': {
    optional: true,
    isString: { errorMessage: 'displayName must be string' },
  },
  'contacts.*.vcard': {
    isString: { errorMessage: 'vcard must be string' },
    notEmpty: { errorMessage: 'vcard is required for each contact' },
  },
};

export const stickerSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
};
