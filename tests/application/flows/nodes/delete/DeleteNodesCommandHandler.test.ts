import { describe, expect, vi } from 'vitest';
import { DeleteNodesCommand } from '../../../../../src/application/flows/nodes/delete/DeleteNodesCommand';
import { DeleteNodesCommandHandler } from '../../../../../src/application/flows/nodes/delete/DeleteNodesCommandHandler';
import { FlowId } from '../../../../../src/domain/value-objects/FlowId';

describe('DeleteNodesCommandHandler', () => {
  test('should call eraser.execute with flowId', async () => {
    const mockEraser = { execute: vi.fn() };
    const handler = new DeleteNodesCommandHandler(mockEraser);
    const flowId = FlowId.fromString('flow-1');
    const command = new DeleteNodesCommand(flowId);

    await handler.handle(command);

    expect(mockEraser.execute).toHaveBeenCalledWith(flowId);
  });

  test('subscribedTo returns DeleteNodesCommand', () => {
    const handler = new DeleteNodesCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(DeleteNodesCommand);
  });
});
