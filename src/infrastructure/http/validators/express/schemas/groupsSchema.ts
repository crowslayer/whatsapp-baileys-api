import { Schema } from 'express-validator';

import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

const participantesSchema: Schema = {
  participants: {
    in: ['body'],
    exists: { errorMessage: 'Participants is required' },
    isArray: { options: { min: 1, max: 50 }, errorMessage: 'At least one participant required' },
  },
  'participants.*': {
    isString: { errorMessage: 'participant must be string' },
    trim: true,
    matches: { options: [/^\+?\d{10,15}$/], errorMessage: 'Participant not found' },
  },
};

export const createGroupSchema: Schema = {
  ...instanceIdSchema,
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
  ...participantesSchema,
};

export const addParticipantsSchema: Schema = {
  ...instanceIdSchema,
  groupId: {
    in: ['body'],
    exists: { errorMessage: 'GroupId is required' },
    isString: { errorMessage: 'GroupId not found' },
    trim: true,
    notEmpty: { errorMessage: 'GroupId nor empty' },
    matches: {
      options: [/^\d{10,20}@g\.us$/],
      errorMessage: 'Invalid groupId',
    },
  },
  ...participantesSchema,
};

export const removeParticipantsSchema: Schema = addParticipantsSchema;
