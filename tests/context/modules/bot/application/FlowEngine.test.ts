import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowEngine } from '@modules/bot/application/FlowEngine';
import type { IConversationState } from '@modules/bot/domain/types/IConversationState';
import type { INodeExecutor } from '@modules/bot/domain/types/INodeExecutor';
import type { ILogger } from '@shared/domain/Logger';
import type { IFlow } from '@modules/flows/domain/FlowTypes';

const createLogger = (): ILogger => ({
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn(),
});

const createFlow = (): IFlow => ({
  flowId: 'flow-1', instanceId: 'instance-1', name: 'flow', version: 1, start: 'message',
  isActive: true,
  nodes: {
    message: { id: 'message', type: 'message', text: 'Hello', next: 'input' },
    input: { id: 'input', type: 'input', variable: 'name', next: 'end' },
    end: { id: 'end', type: 'message', text: 'Done', next: null },
  },
});

describe('FlowEngine', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('executes nodes in order, pauses at input, and continues after input', () => {
    // Arrange
    const logger = createLogger();
    const executor: INodeExecutor = {
      supports: (type) => type === 'message' || type === 'input',
      execute: ({ node, state, input }) => {
        if (node.type === 'input') {
          return { variables: { ...state.variables, [node.variable]: input }, nextNodeId: node.next };
        }
        if (node.type === 'message') {
          return { reply: node.text, nextNodeId: node.next, isEnd: node.next === null };
        }
        return {};
      },
    };
    const engine = new FlowEngine([executor], logger);
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', currentNodeId: 'message', variables: {},
    };

    // Act
    const first = engine.execute(createFlow(), state);
    const pausedNode = state.currentNodeId;
    const second = engine.execute(createFlow(), state, 'Ada');

    // Assert
    expect(first.reply).toBe('Hello');
    expect(pausedNode).toBe('input');
    expect(second.reply).toBe('Done');
    expect(state.variables.name).toBe('Ada');
    expect(state.currentNodeId).toBeUndefined();
  });

  it('returns state unchanged when there is no current node', () => {
    // Arrange
    const logger = createLogger();
    const state: IConversationState = {
      instanceId: 'instance-1', conversationId: 'conversation-1', variables: { saved: true },
    };
    const engine = new FlowEngine([], logger);

    // Act
    const result = engine.execute(createFlow(), state);

    // Assert
    expect(result.variables).toEqual({ saved: true });
    expect(logger.warn).toHaveBeenCalledWith('No current node, skipping execution');
  });
});
