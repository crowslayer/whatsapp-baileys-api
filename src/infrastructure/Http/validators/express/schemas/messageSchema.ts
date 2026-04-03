import { Schema } from 'express-validator';

import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

const recipientSchema: Schema = {
  to: {
    in: ['body'],
    exists: { errorMessage: 'Recipient is required' },
    isString: { errorMessage: 'Recipient must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'Recipient is required' },
  },
};

export const messageSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  message: {
    in: ['body'],
    exists: { errorMessage: 'Message is required' },
    isString: { errorMessage: 'Message must be a string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'Message cannot be null or empty' },
  },
};

const captionSchema: Schema = {
  caption: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Caption must be string' },
  },
};
const filenameSchema: Schema = {
  fileName: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Filename must be string' },
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
    isString: { errorMessage: 'Ptt must be a string' },
  },
};

export const videoSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  captionSchema,
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
    isFloat: { errorMessage: 'Valid latitude is required' },
  },
  longitude: {
    in: ['body'],
    exists: { errorMessage: 'Longitude is required' },
    isFloat: { errorMessage: 'Valid longitude is required' },
  },
  name: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Name must be a string' },
  },
  address: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Address must be a string' },
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
  },
};

export const contactSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSchema,
  contacts: {
    exists: { errorMessage: 'Contact is required' },
    isArray: { options: { min: 1 }, errorMessage: 'Contact must be Array' },
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
