import { Schema } from 'express-validator';

import { instanceIdSchema } from './instanceSchema';

const recipientSquema: Schema = {
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
  ...recipientSquema,
  message: {
    in: ['body'],
    exists: { errorMessage: 'Message is required' },
    isString: { errorMessage: 'Message must be a string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'Message not be a null or empty' },
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
  ...recipientSquema,
  ...captionSchema,
  ...filenameSchema,
};

export const documentSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSquema,
  ...captionSchema,
};

export const audioSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSquema,
  ptt: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Ptt must be a string' },
  },
};

export const videoSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSquema,
  ...captionSchema,
  gifPlayback: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Playback optiones is string' },
  },
  ...filenameSchema,
};

export const locationSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSquema,
  latitude: {
    in: ['body'],
    exists: { errorMessage: 'Latitudes is required' },
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
    isString: { errorMessage: 'address must be a string' },
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
    notEmpty: { errorMessage: 'MessageId not empry' },
  },
  chatId: {
    in: ['body'],
    exists: { errorMessage: 'ChatId is required' },
    isString: { errorMessage: 'ChatId must be string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'ChatId not empry' },
  },
  emoji: {
    in: ['body'],
    exists: { errorMessage: 'emoji is required' },
    isString: { errorMessage: 'emoji must be string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'Emoji not empry' },
  },
};

export const contactSchema: Schema = {
  ...instanceIdSchema,
  ...recipientSquema,
  conctacts: {
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
  ...recipientSquema,
};
