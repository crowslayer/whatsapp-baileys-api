import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConditionNodeExecutor } from '@modules/bot/application/executors/ConditionNodeExecutor';
import type { IConversationState } from '@modules/bot/domain/types/IConversationState';
import type { IConditionNode } from '@modules/flows/domain/FlowTypes';

describe('ConditionNodeExecutor', () => {
  let executor: ConditionNodeExecutor;
  beforeEach(() => {
    vi.clearAllMocks();
    executor = new ConditionNodeExecutor();
  });
  afterEach(() => vi.restoreAllMocks());

  it('selects the true branch when the variable equals the configured value', () => {
    // Arrange
    const node: IConditionNode = {
      id: 'condition', type: 'condition', variable: 'status', equals: 'ready',
      ifTrue: 'yes', ifFalse: 'no', next: null,
    };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: { status: 'ready' },
    };

    // Act
    const result = executor.execute({ node, state });

    // Assert
    expect(executor.supports('condition')).toBe(true);
    expect(result.nextNodeId).toBe('yes');
  });

  it('selects the false branch when the variable is missing or different', () => {
    // Arrange
    const node: IConditionNode = {
      id: 'condition', type: 'condition', variable: 'status', equals: 'ready',
      ifTrue: 'yes', ifFalse: 'no', next: null,
    };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: {},
    };

    // Act
    const result = executor.execute({ node, state });

    // Assert
    expect(result.nextNodeId).toBe('no');
  });
});
