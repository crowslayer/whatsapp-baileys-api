import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BotService } from '@modules/bot/application/BotService';
import type { IConversationStore } from '@modules/bot/domain/types/IConversationStore';
import type { IFlow } from '@modules/flows/domain/FlowTypes';
import type { IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';
import type { ILogger } from '@shared/domain/Logger';
import type { FlowEngine } from '@modules/bot/application/FlowEngine';
import type { FlowTriggerResolver } from '@modules/bot/application/FlowTriggerResolver';
import type { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';

const flow: IFlow = {
  flowId: 'flow-1', instanceId: 'instance-1', name: 'Welcome', version: 1,
  start: 'message', isActive: true,
  nodes: { message: { id: 'message', type: 'message', text: 'Hello', next: null } },
};

const createLogger = (): ILogger => ({
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn(),
});

describe('BotService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('starts a matching flow, persists state, and sends its reply', async () => {
    // Arrange
    const stateStore = { get: vi.fn().mockResolvedValue(null), set: vi.fn().mockResolvedValue(undefined) } as unknown as IConversationStore;
    const flowEngine = { execute: vi.fn((_: IFlow, state: { currentNodeId?: string }) => {
      state.currentNodeId = undefined;
      return { reply: 'Welcome', variables: { name: 'Ada' } };
    }) } as unknown as FlowEngine;
    const triggerResolver = { resolve: vi.fn().mockReturnValue(flow) } as unknown as FlowTriggerResolver;
    const messaging = { send: vi.fn().mockResolvedValue(undefined) } as unknown as MessageOrchestrator;
    const flowRepository = {
      findActiveByInstance: vi.fn().mockResolvedValue([flow]), findById: vi.fn(),
    } as unknown as IFlowReadRepository;
    const service = new BotService(flowEngine, triggerResolver, stateStore, messaging, flowRepository, createLogger());

    // Act
    await service.handleMessage({
      instanceId: 'instance-1', conversationId: 'chat-1', messageId: 'message-1', senderId: 'user-1', text: 'hello',
    });

    // Assert
    expect(triggerResolver.resolve).toHaveBeenCalledWith([flow], 'hello');
    expect(stateStore.set).toHaveBeenCalledWith('instance-1', 'chat-1', expect.objectContaining({
      currentFlowId: undefined, currentNodeId: undefined, variables: { name: 'Ada' },
    }));
    expect(messaging.send).toHaveBeenCalledWith('instance-1', 'chat-1', 'Welcome');
  });

  it('does not persist or send when no trigger matches', async () => {
    // Arrange
    const stateStore = { get: vi.fn().mockResolvedValue(null), set: vi.fn() } as unknown as IConversationStore;
    const flowEngine = { execute: vi.fn() } as unknown as FlowEngine;
    const triggerResolver = { resolve: vi.fn().mockReturnValue(null) } as unknown as FlowTriggerResolver;
    const messaging = { send: vi.fn() } as unknown as MessageOrchestrator;
    const flowRepository = { findActiveByInstance: vi.fn().mockResolvedValue([]) } as unknown as IFlowReadRepository;
    const service = new BotService(flowEngine, triggerResolver, stateStore, messaging, flowRepository, createLogger());

    // Act
    await service.handleMessage({
      instanceId: 'instance-1', conversationId: 'chat-1', messageId: 'message-1', senderId: 'user-1', text: 'unknown',
    });

    // Assert
    expect(stateStore.set).not.toHaveBeenCalled();
    expect(messaging.send).not.toHaveBeenCalled();
    expect(flowEngine.execute).not.toHaveBeenCalled();
  });
});
