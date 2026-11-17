import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InputNodeExecutor } from '@modules/bot/application/executors/InputNodeExecutor';
import type { IConversationState } from '@modules/bot/domain/types/IConversationState';
import type { INodeInput } from '@modules/flows/domain/FlowTypes';

describe('InputNodeExecutor', () => {
  let executor: InputNodeExecutor;
  beforeEach(() => {
    vi.clearAllMocks();
    executor = new InputNodeExecutor();
  });
  afterEach(() => vi.restoreAllMocks());

  it('normalizes input and preserves existing conversation variables', () => {
    // Arrange
    const node: INodeInput = { id: 'input', type: 'input', variable: 'name', next: 'next' };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: { existing: 'kept' },
    };

    // Act
    const result = executor.execute({ node, state, input: '  ADA Lovelace  ' });

    // Assert
    expect(executor.supports('input')).toBe(true);
    expect(result).toEqual({ variables: { existing: 'kept', name: 'ada lovelace' }, nextNodeId: 'next' });
  });

  it('stores undefined when no input is supplied', () => {
    // Arrange
    const node: INodeInput = { id: 'input', type: 'input', variable: 'answer', next: null };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: {},
    };

    // Act
    const result = executor.execute({ node, state });

    // Assert
    expect(result.variables).toEqual({ answer: undefined });
    expect(result.nextNodeId).toBeNull();
  });
});
