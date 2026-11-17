import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FlowNode,
  IConditionNode,
  IAINode,
  IMessageNode,
  INodeInput,
  Trigger,
  isConditionNode,
  isInputNode,
  isMessageNode,
} from '@modules/flows/domain/FlowTypes';

const messageNode: IMessageNode = {
  id: 'welcome',
  type: 'message',
  text: 'Hello there',
  next: null,
};

const inputNode: INodeInput = {
  id: 'ask-name',
  type: 'input',
  variable: 'name',
  next: null,
};

const conditionNode: IConditionNode = {
  id: 'check',
  type: 'condition',
  variable: 'name',
  equals: 'John',
  ifTrue: 'yes',
  ifFalse: 'no',
  next: null,
};

const aiNode: IAINode = {
  id: 'ask-ai',
  type: 'ai',
  prompt: 'Summarize',
  next: null,
};

describe('FlowTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isMessageNode', () => {
    it('returns true for a message node', () => {
      expect(isMessageNode(messageNode)).toBe(true);
    });

    it('returns false for an input node', () => {
      expect(isMessageNode(inputNode)).toBe(false);
    });

    it('returns false for a condition node', () => {
      expect(isMessageNode(conditionNode)).toBe(false);
    });

    it('returns false for an ai node', () => {
      expect(isMessageNode(aiNode)).toBe(false);
    });

    it('returns false for a delay node', () => {
      const delayNode = { id: 'wait', type: 'delay', ms: 1000, next: null } as unknown as FlowNode;

      expect(isMessageNode(delayNode)).toBe(false);
    });
  });

  describe('isInputNode', () => {
    it('returns true for an input node', () => {
      expect(isInputNode(inputNode)).toBe(true);
    });

    it('returns false for a message node', () => {
      expect(isInputNode(messageNode)).toBe(false);
    });

    it('returns false for a condition node', () => {
      expect(isInputNode(conditionNode)).toBe(false);
    });

    it('returns false for an ai node', () => {
      expect(isInputNode(aiNode)).toBe(false);
    });
  });

  describe('isConditionNode', () => {
    it('returns true for a condition node', () => {
      expect(isConditionNode(conditionNode)).toBe(true);
    });

    it('returns false for a message node', () => {
      expect(isConditionNode(messageNode)).toBe(false);
    });

    it('returns false for an input node', () => {
      expect(isConditionNode(inputNode)).toBe(false);
    });

    it('returns false for an ai node', () => {
      expect(isConditionNode(aiNode)).toBe(false);
    });
  });

  describe('guards with invalid input', () => {
    it('throws a TypeError when the node is undefined', () => {
      expect(() => isMessageNode(undefined as unknown as FlowNode)).toThrow(TypeError);
    });

    it('throws a TypeError when the node is null', () => {
      expect(() => isInputNode(null as unknown as FlowNode)).toThrow(TypeError);
    });

    it('returns false when the node has no type property', () => {
      expect(isConditionNode({} as unknown as FlowNode)).toBe(false);
    });
  });

  describe('trigger shape', () => {
    it('accepts a keyword trigger', () => {
      const trigger: Trigger = { type: 'keyword', value: 'hola' };

      expect(trigger.type).toBe('keyword');
      expect(trigger.value).toBe('hola');
    });

    it('accepts a contains trigger', () => {
      const trigger: Trigger = { type: 'contains', value: 'precio' };

      expect(trigger.type).toBe('contains');
      expect(trigger.value).toBe('precio');
    });
  });
});
