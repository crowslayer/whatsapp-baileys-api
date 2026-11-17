import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

import { FlowCreator } from '@modules/flows/application/create/FlowCreator';

const INSTANCE_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('FlowCreator', () => {
  let repository: IFlowRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findById: vi.fn<IFlowRepository['findById']>(),
      save: vi.fn<IFlowRepository['save']>(),
      delete: vi.fn<IFlowRepository['delete']>(),
    };

    vi.mocked(repository.save).mockResolvedValue(undefined);
  });

  it('saves a new aggregate through the repository', async () => {
    const creator = new FlowCreator(repository);

    await creator.execute(InstanceId.fromString(INSTANCE_UUID), Name.create('Sales Flow'));

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('saves an aggregate built with the provided instance and name', async () => {
    const creator = new FlowCreator(repository);

    await creator.execute(InstanceId.fromString(INSTANCE_UUID), Name.create('Sales Flow'));

    const saved = vi.mocked(repository.save).mock.calls[0][0];

    expect(saved).toBeInstanceOf(FlowAggregate);
    expect(saved.instanceId.value).toBe(INSTANCE_UUID);
    expect(saved.name.value).toBe('Sales Flow');
    expect(saved.version).toBe(1);
    expect(saved.isActive).toBe(false);
  });

  it('generates a different flow id on every execution', async () => {
    const creator = new FlowCreator(repository);
    const instanceId = InstanceId.fromString(INSTANCE_UUID);
    const name = Name.create('Sales Flow');

    await creator.execute(instanceId, name);
    await creator.execute(instanceId, name);

    const first = vi.mocked(repository.save).mock.calls[0][0];
    const second = vi.mocked(repository.save).mock.calls[1][0];

    expect(first.flowId.value).not.toBe(second.flowId.value);
  });

  it('does not read any aggregate from the repository', async () => {
    const creator = new FlowCreator(repository);

    await creator.execute(InstanceId.fromString(INSTANCE_UUID), Name.create('Sales Flow'));

    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('rejects when the repository fails to save', async () => {
    vi.mocked(repository.save).mockRejectedValue(new Error('database is down'));

    const creator = new FlowCreator(repository);

    await expect(
      creator.execute(InstanceId.fromString(INSTANCE_UUID), Name.create('Sales Flow'))
    ).rejects.toThrow('database is down');
  });
});
