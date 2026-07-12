import { describe, expect, vi } from 'vitest';
import { CreateNodesCommand } from '../../../../../src/application/flows/nodes/create/CreateNodesCommand';
import { CreateNodesCommandHandler } from '../../../../../src/application/flows/nodes/create/CreateNodesCommandHandler';
import { FlowId } from '../../../../../src/domain/value-objects/FlowId';

describe('CreateNodesCommandHandler', () => {
  test('should call creator.execute with command params', async () => {
    const mockCreator = { execute: vi.fn() };
    const handler = new CreateNodesCommandHandler(mockCreator);
    const flowId = FlowId.fromString('flow-1');
    const nodes = {};
    const start = 'start';
    const triggers = [];
    const command = new CreateNodesCommand(flowId, nodes, start, triggers);

    await handler.handle(command);

    expect(mockCreator.execute).toHaveBeenCalledWith(flowId, nodes, start, triggers);
  });

  test('subscribedTo returns CreateNodesCommand', () => {
    const handler = new CreateNodesCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(CreateNodesCommand);
  });
});
