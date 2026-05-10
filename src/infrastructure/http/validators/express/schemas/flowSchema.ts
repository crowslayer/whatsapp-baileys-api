import { Schema } from 'express-validator';

import { Nodes } from '@application/bot/types/FlowTypes';

export const flowIdSchema: Schema = {
  flowId: {
    in: ['params'],
    isUUID: { errorMessage: 'Invalid id' },
  },
};

const flowIdInBodydSchema: Schema = {
  flowId: {
    in: ['body'],
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

const startSchema: Schema = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'start is required' },
    isString: { errorMessage: 'start must be a string' },
    trim: true,
    notEmpty: { errorMessage: 'start is required' },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'start must be between 1 and 100 characters',
    },
  },
};

const triggersSchema: Schema = {
  triggers: {
    in: ['body'],
    isArray: true,
    optional: true,
  },

  'triggers.*.type': {
    in: ['body'],
    isString: true,
    notEmpty: true,
  },

  'triggers.*.value': {
    in: ['body'],
    isString: true,
    notEmpty: true,
  },
};

export const nodesSchema: Schema = {
  nodes: {
    in: ['body'],
    isObject: true,
    custom: {
      options: (nodes) => {
        if (typeof nodes !== 'object') {
          throw new Error('nodes must be an object');
        }

        for (const [key, node] of Object.entries(nodes as Nodes)) {
          if (!node.id || !node.type) {
            throw new Error(`Node ${key} must have id and type`);
          }

          switch (node.type) {
            case 'message':
              if (typeof node.text !== 'string') {
                throw new Error(`Node ${key} (message) must have text`);
              }
              break;

            case 'input':
              if (typeof node.variable !== 'string') {
                throw new Error(`Node ${key} (input) must have variable`);
              }
              break;

            case 'condition':
              if (
                typeof node.variable !== 'string' ||
                typeof node.equals !== 'string' ||
                typeof node.ifTrue !== 'string' ||
                typeof node.ifFalse !== 'string'
              ) {
                throw new Error(`Node ${key} (condition) is invalid`);
              }
              break;

            default:
              throw new Error(`Unknown node type: ${node.type}`);
          }

          // Validar next (opcional)
          if (node.next !== null && node.next !== undefined && typeof node.next !== 'string') {
            throw new Error(`Node ${key} has invalid next`);
          }
        }

        return true;
      },
    },
  },
};

export const createFlowSchema: Schema = {
  ...instanceIdInBodySchema,
  ...nameSchema,
};

export const createNodesSchema: Schema = {
  ...flowIdInBodydSchema,
  ...nodesSchema,
  ...startSchema,
  ...triggersSchema,
};

export const updateFlowSchema: Schema = {
  ...flowIdSchema,
  ...instanceIdInBodySchema,
  ...nameSchema,
};
