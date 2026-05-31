import { CreateCampaignCommand } from '../../../../src/application/campaign/create/CreateCampaignCommand';
import { CreateCampaignCommandHandler } from '../../../../src/application/campaign/create/CreateCampaignCommandHandler';
import { Description } from '../../../../src/domain/campaign/Description';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../src/domain/value-objects/Name';

describe('CreateCampaignCommandHandler', () => {
  test('should call creator.execute with command', async () => {
    const mockCreator = { execute: vi.fn() };
    const handler = new CreateCampaignCommandHandler(mockCreator);

    const command = new CreateCampaignCommand({
      instanceId: InstanceId.fromString('inst-1'),
      name: Name.create('Campaign'),
      description: Description.create('Desc'),
      message: 'Hello',
      numbers: ['jid1'],
    });

    await handler.handle(command);
    expect(mockCreator.execute).toHaveBeenCalledWith(command);
  });

  test('subscribedTo returns CreateCampaignCommand', () => {
    const handler = new CreateCampaignCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(CreateCampaignCommand);
  });
});
