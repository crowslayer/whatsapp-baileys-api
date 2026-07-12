import { describe, expect, vi } from 'vitest';
import { DeleteFlowCommand } from '../../../../src/application/flows/delete/DeleteFlowCommand';
import { DeleteFlowCommandHandler } from '../../../../src/application/flows/delete/DeleteFlowCommandHandler';
import { FlowId } from '../../../../src/domain/value-objects/FlowId';

describe('DeleteFlowCommandHandler', () => {
  test('should call eraser.execute with flowId', async () => {
    const mockEraser = { execute: vi.fn() };
    const handler = new DeleteFlowCommandHandler(mockEraser);
    const flowId = FlowId.fromString('flow-1');
    const command = new DeleteFlowCommand(flowId);

    await handler.handle(command);

    expect(mockEraser.execute).toHaveBeenCalledWith(flowId);
  });

  test('subscribedTo returns DeleteFlowCommand', () => {
    const handler = new DeleteFlowCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(DeleteFlowCommand);
  });
});
