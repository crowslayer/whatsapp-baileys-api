import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import { PhoneNumber } from '@modules/instances/domain/PhoneNumber';

export class InstancesCreator {
  constructor(private readonly repository: IInstanceRepository) {}

  async execute(command: CreateInstanceCommand): Promise<InstanceAggregate> {
    const name = Name.create(command.name);

    const instance = InstanceAggregate.create({
      name,
      webhookUrl: command.webhookUrl,
      phoneNumber: command.phoneNumber ? PhoneNumber.create(command.phoneNumber) : undefined,
    });
    await this.repository.save(instance);
    return instance;
  }
}
