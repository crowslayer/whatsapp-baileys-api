import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageNodeExecutor } from '@modules/bot/application/executors/MessageNodeExecutor';
import type { IConversationState } from '@modules/bot/domain/types/IConversationState';
import type { IMessageNode } from '@modules/flows/domain/FlowTypes';

describe('MessageNodeExecutor', () => {
  let executor: MessageNodeExecutor;
  beforeEach(() => {
    vi.clearAllMocks();
    executor = new MessageNodeExecutor();
  });
  afterEach(() => vi.restoreAllMocks());

  it('interpolates variables and returns the next node', () => {
    // Arrange
    const node: IMessageNode = { id: 'message', type: 'message', text: 'Hi {{ name }}!', next: 'next' };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: { name: 'Ada' },
    };

    // Act
    const result = executor.execute({ node, state });

    // Assert
    expect(executor.supports('message')).toBe(true);
    expect(executor.supports('input')).toBe(false);
    expect(result).toEqual({ reply: 'Hi Ada!', nextNodeId: 'next', isEnd: false });
  });

  it('replaces missing variables with an empty string and marks terminal messages', () => {
    // Arrange
    const node: IMessageNode = { id: 'message', type: 'message', text: 'Hello {{ missing }}', next: null };
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: {},
    };

    // Act
    const result = executor.execute({ node, state });

    // Assert
    expect(result).toEqual({ reply: 'Hello ', nextNodeId: null, isEnd: true });
  });
});
