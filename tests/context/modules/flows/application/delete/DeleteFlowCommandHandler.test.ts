import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { DeleteFlowCommand } from '@modules/flows/application/delete/DeleteFlowCommand';
import { DeleteFlowCommandHandler } from '@modules/flows/application/delete/DeleteFlowCommandHandler';
import { FlowEraser } from '@modules/flows/application/delete/FlowEraser';

const FLOW_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';

describe('DeleteFlowCommandHandler', () => {
  let execute: Mock<FlowEraser['execute']>;
  let useCase: FlowEraser;
  let handler: DeleteFlowCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    execute = vi.fn<FlowEraser['execute']>().mockResolvedValue(undefined);
    useCase = { execute } as unknown as FlowEraser;
    handler = new DeleteFlowCommandHandler(useCase);
  });

  it('is subscribed to the DeleteFlowCommand', () => {
    expect(handler.subscribedTo()).toBe(DeleteFlowCommand);
  });

  it('executes the use case with the flow id of the command', async () => {
    const command = new DeleteFlowCommand(FLOW_UUID);

    await handler.handle(command);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(FLOW_UUID);
  });

  it('propagates the flow id untouched', async () => {
    const command = new DeleteFlowCommand(FLOW_UUID);

    await handler.handle(command);

    expect(execute.mock.calls[0][0]).toBe(FLOW_UUID);
  });

  it('rejects when the use case fails', async () => {
    execute.mockRejectedValue(new Error('cannot delete flow'));

    const command = new DeleteFlowCommand(FLOW_UUID);

    await expect(handler.handle(command)).rejects.toThrow('cannot delete flow');
  });
});
