import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { FlowId } from '@modules/flows/domain/FlowId';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

import { FlowEraser } from '@modules/flows/application/delete/FlowEraser';

const FLOW_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';
const INSTANCE_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

const buildAggregate = (): FlowAggregate =>
  FlowAggregate.restore({
    flowId: FlowId.fromString(FLOW_UUID),
    instanceId: InstanceId.fromString(INSTANCE_UUID),
    name: Name.create('Sales Flow'),
    version: 1,
    start: 'start',
    nodes: {},
    isActive: true,
  });

describe('FlowEraser', () => {
  let repository: IFlowRepository;
  let aggregate: FlowAggregate;

  beforeEach(() => {
    vi.clearAllMocks();

    aggregate = buildAggregate();

    repository = {
      findById: vi.fn<IFlowRepository['findById']>(),
      save: vi.fn<IFlowRepository['save']>(),
      delete: vi.fn<IFlowRepository['delete']>(),
    };

    vi.mocked(repository.findById).mockResolvedValue(aggregate);
    vi.mocked(repository.save).mockResolvedValue(undefined);
  });

  it('looks the aggregate up by its flow id', async () => {
    const eraser = new FlowEraser(repository);

    await eraser.execute(FLOW_UUID);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(vi.mocked(repository.findById).mock.calls[0][0].value).toBe(FLOW_UUID);
  });

  it('deactivates the found aggregate', async () => {
    const eraser = new FlowEraser(repository);

    await eraser.execute(FLOW_UUID);

    expect(aggregate.isActive).toBe(false);
  });

  it('saves the deactivated aggregate', async () => {
    const eraser = new FlowEraser(repository);

    await eraser.execute(FLOW_UUID);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(vi.mocked(repository.save).mock.calls[0][0]).toBe(aggregate);
  });

  it('does not delete the aggregate from the repository', async () => {
    const eraser = new FlowEraser(repository);

    await eraser.execute(FLOW_UUID);

    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('rejects when the flow id is not a valid uuid', async () => {
    const eraser = new FlowEraser(repository);

    await expect(eraser.execute('not-a-uuid')).rejects.toThrow();
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('rejects when the repository fails to find the aggregate', async () => {
    vi.mocked(repository.findById).mockRejectedValue(new Error('database is down'));

    const eraser = new FlowEraser(repository);

    await expect(eraser.execute(FLOW_UUID)).rejects.toThrow('database is down');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects when the repository fails to save the aggregate', async () => {
    vi.mocked(repository.save).mockRejectedValue(new Error('database is down'));

    const eraser = new FlowEraser(repository);

    await expect(eraser.execute(FLOW_UUID)).rejects.toThrow('database is down');
  });
});
