import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

import { CreateFlowCommand } from '@modules/flows/application/create/CreateFlowCommand';
import { CreateFlowCommandHandler } from '@modules/flows/application/create/CreateFlowCommandHandler';
import { FlowCreator } from '@modules/flows/application/create/FlowCreator';

const INSTANCE_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('CreateFlowCommandHandler', () => {
  let execute: Mock<FlowCreator['execute']>;
  let creator: FlowCreator;
  let handler: CreateFlowCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    execute = vi.fn<FlowCreator['execute']>().mockResolvedValue(undefined);
    creator = { execute } as unknown as FlowCreator;
    handler = new CreateFlowCommandHandler(creator);
  });

  it('is subscribed to the CreateFlowCommand', () => {
    expect(handler.subscribedTo()).toBe(CreateFlowCommand);
  });

  it('executes the creator with the values of the command', async () => {
    const command = new CreateFlowCommand(INSTANCE_UUID, 'Sales Flow');

    await handler.handle(command);

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('maps the command instance id into an InstanceId value object', async () => {
    const command = new CreateFlowCommand(INSTANCE_UUID, 'Sales Flow');

    await handler.handle(command);

    const [instanceId] = execute.mock.calls[0];

    expect(instanceId).toBeInstanceOf(InstanceId);
    expect(instanceId.value).toBe(INSTANCE_UUID);
  });

  it('maps the command name into a Name value object', async () => {
    const command = new CreateFlowCommand(INSTANCE_UUID, 'Sales Flow');

    await handler.handle(command);

    const [, name] = execute.mock.calls[0];

    expect(name).toBeInstanceOf(Name);
    expect(name.value).toBe('Sales Flow');
  });

  it('rejects when the instance id is not a valid uuid', async () => {
    const command = new CreateFlowCommand('not-a-uuid', 'Sales Flow');

    await expect(handler.handle(command)).rejects.toThrow(InvalidArgumentError);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects when the instance id is empty', async () => {
    const command = new CreateFlowCommand('', 'Sales Flow');

    await expect(handler.handle(command)).rejects.toThrow(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects when the name is too short', async () => {
    const command = new CreateFlowCommand(INSTANCE_UUID, 'a');

    await expect(handler.handle(command)).rejects.toThrow(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects when the creator fails', async () => {
    execute.mockRejectedValue(new Error('cannot create flow'));

    const command = new CreateFlowCommand(INSTANCE_UUID, 'Sales Flow');

    await expect(handler.handle(command)).rejects.toThrow('cannot create flow');
  });
});
