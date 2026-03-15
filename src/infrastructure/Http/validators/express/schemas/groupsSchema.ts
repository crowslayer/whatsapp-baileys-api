import { Schema } from 'express-validator';

import { instanceIdSchema } from './instanceSchema';

const participantesSchema: Schema = {
  participants: {
    in: ['body'],
    exists: { errorMessage: 'Participants is required' },
    isArray: { options: { min: 1 }, errorMessage: 'At least one participant required' },
  },
  'participants.*': {
    isString: { errorMessage: 'participant must be string' },
    matches: { options: [/^\d{10,15}@s\.whatsapp\.net$/], errorMessage: 'Participant not found' },
  },
};

export const createGroupSchema: Schema = {
  ...instanceIdSchema,
  name: {
    in: ['body'],
    exists: { errorMessage: 'Name is required' },
    isString: { errorMessage: 'Name must be a string' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'Name is required' },
  },
  ...participantesSchema,
};

export const addParticipantsSchema: Schema = {
  ...instanceIdSchema,
  groupId: {
    in: ['body'],
    exists: { errorMessage: 'GroupId is required' },
    isString: { errorMessage: 'GroupId not found' },
    escape: true,
    trim: true,
    notEmpty: { errorMessage: 'GroupId nor empty' },
  },
  ...participantesSchema,
};

export const removeParticipantsSchema: Schema = addParticipantsSchema;
