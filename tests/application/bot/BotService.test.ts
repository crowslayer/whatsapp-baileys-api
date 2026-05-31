import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BotService } from '../../../src/application/bot/BotService';

describe('BotService', () => {
  let flowEngine: any;
  let triggerResolver: any;
  let store: any;
  let messaging: any;
  let flowRepository: any;
  let logger: any;

  beforeEach(() => {
    flowEngine = {
      execute: vi.fn(),
    };

    triggerResolver = {
      resolve: vi.fn(),
    };

    store = {
      get: vi.fn(),
      set: vi.fn(),
    };

    messaging = {
      send: vi.fn(),
    };

    flowRepository = {
      findActiveByInstance: vi.fn(),
      findById: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  it('should start a new flow when no conversation exists', async () => {
    const flow = {
      flowId: 'flow-1',
      start: 'node-1',
      nodes: {},
    };

    store.get.mockResolvedValue(undefined);

    flowRepository.findActiveByInstance.mockResolvedValue([flow]);

    triggerResolver.resolve.mockReturnValue(flow);

    flowEngine.execute.mockReturnValue({
      reply: 'hello',
      variables: { name: 'john' },
    });

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    await service.handleMessage('instance-1', 'chat-1', 'hi');

    expect(flowRepository.findActiveByInstance).toHaveBeenCalledWith('instance-1');

    expect(triggerResolver.resolve).toHaveBeenCalledWith([flow], 'hi');

    expect(flowEngine.execute).toHaveBeenCalledWith(
      flow,
      expect.objectContaining({
        currentFlowId: 'flow-1',
        currentNodeId: 'node-1',
      }),
      undefined
    );

    expect(store.set).toHaveBeenCalled();

    expect(messaging.send).toHaveBeenCalledWith('instance-1', 'chat-1', 'hello');
  });

  it('should continue an existing flow', async () => {
    const state = {
      currentFlowId: 'flow-1',
      currentNodeId: 'node-2',
      instanceId: 'instance-1',
      chatId: 'chat-1',
      variables: {},
    };

    const flow = {
      flowId: 'flow-1',
      nodes: {},
    };

    store.get.mockResolvedValue(state);

    flowRepository.findById.mockResolvedValue(flow);

    flowEngine.execute.mockReturnValue({
      reply: 'next step',
      variables: {},
    });

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    await service.handleMessage('instance-1', 'chat-1', 'answer');

    expect(flowRepository.findById).toHaveBeenCalledWith('flow-1');

    expect(flowEngine.execute).toHaveBeenCalledWith(flow, state, 'answer');

    expect(messaging.send).toHaveBeenCalledWith('instance-1', 'chat-1', 'next step');
  });

  it('should do nothing when no flow matches trigger', async () => {
    store.get.mockResolvedValue(undefined);

    flowRepository.findActiveByInstance.mockResolvedValue([]);

    triggerResolver.resolve.mockReturnValue(null);

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    await service.handleMessage('instance-1', 'chat-1', 'hello');

    expect(flowEngine.execute).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
    expect(messaging.send).not.toHaveBeenCalled();
  });

  it('should warn when flow has no nodes', async () => {
    store.get.mockResolvedValue({
      currentFlowId: 'flow-1',
      currentNodeId: 'node-1',
      instanceId: 'instance-1',
      chatId: 'chat-1',
      variables: {},
    });

    flowRepository.findById.mockResolvedValue({
      flowId: 'flow-1',
      nodes: null,
    });

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    await service.handleMessage('instance-1', 'chat-1', 'hello');

    expect(logger.warn).toHaveBeenCalled();
    expect(flowEngine.execute).not.toHaveBeenCalled();
  });

  it('should clear currentFlowId when conversation finishes', async () => {
    const state = {
      currentFlowId: 'flow-1',
      currentNodeId: 'node-1',
      instanceId: 'instance-1',
      chatId: 'chat-1',
      variables: {},
    };

    const flow = {
      flowId: 'flow-1',
      nodes: {},
    };

    store.get.mockResolvedValue(state);

    flowRepository.findById.mockResolvedValue(flow);

    flowEngine.execute.mockReturnValue({
      reply: undefined,
      variables: {},
    });

    state.currentNodeId = undefined;

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    await service.handleMessage('instance-1', 'chat-1', 'hello');

    expect(store.set).toHaveBeenCalledWith(
      'instance-1',
      'chat-1',
      expect.objectContaining({
        currentFlowId: undefined,
      })
    );
  });

  it('should subscribe to message events', async () => {
    let callback: any;

    const eventBus = {
      on: vi.fn((event, cb) => {
        callback = cb;
      }),
    };

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    const handleSpy = vi.spyOn(service, 'handleMessage');

    service.subscribe(eventBus as any);

    await callback({
      instanceId: 'instance-1',
      message: {
        key: {
          remoteJid: 'chat-1',
        },
        message: {
          conversation: 'hello',
        },
      },
    });

    expect(handleSpy).toHaveBeenCalledWith('instance-1', 'chat-1', 'hello');
  });

  it('should ignore events without chatId or text', async () => {
    let callback: any;

    const eventBus = {
      on: vi.fn((event, cb) => {
        callback = cb;
      }),
    };

    const service = new BotService(
      flowEngine,
      triggerResolver,
      store,
      messaging,
      flowRepository,
      logger
    );

    const handleSpy = vi.spyOn(service, 'handleMessage');

    service.subscribe(eventBus as any);

    await callback({
      instanceId: 'instance-1',
      message: {
        key: {},
        message: {},
      },
    });

    expect(handleSpy).not.toHaveBeenCalled();
  });
});
