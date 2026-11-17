import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export interface IInstanceRepository {
  save(instance: InstanceAggregate): Promise<void>;
  findById(instanceId: InstanceId): Promise<InstanceAggregate | null>;
  update(instance: InstanceAggregate): Promise<void>;
  delete(instanceId: InstanceId): Promise<void>;
  exists(instanceId: InstanceId): Promise<boolean>;
  findInstances(): Promise<InstanceAggregate[]>;
}
