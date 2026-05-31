import { describe, expect, it } from 'vitest';

import { CreateCampaignCommand } from '../../../../src/application/campaign/create/CreateCampaignCommand';
import { Description } from '../../../../src/domain/campaign/Description';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../src/domain/value-objects/Name';

describe('CreateCampaignCommand', () => {
  it('should create a command with the provided properties', () => {
    const instanceId = InstanceId.fromString('instance-123');
    const name = Name.create('Campaign Test');
    const description = Description.create('Description Test');
    const message = 'Hello world';
    const numbers = ['1111111111', '2222222222'];

    const command = new CreateCampaignCommand({
      instanceId,
      name,
      description,
      message,
      numbers,
    });

    expect(command).toBeInstanceOf(CreateCampaignCommand);

    expect(command.instanceId).toBe(instanceId);
    expect(command.name).toBe(name);
    expect(command.description).toBe(description);
    expect(command.message).toBe(message);
    expect(command.numbers).toEqual(numbers);
  });
});
