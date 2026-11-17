import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import { ValidationError } from '@shared/domain/error/ValidationError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';

vi.mock('@shared/application/services/MessageOrchestrator', () => ({
  MessageOrchestrator: vi.fn(),
}));

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildInstance = (canSend: boolean): InstanceAggregate =>
  ({
    instanceId: INSTANCE_UUID,
    canSendMessages: vi.fn().mockReturnValue(canSend),
  }) as unknown as InstanceAggregate;

describe('TextMessageSender', () => {
  let repository: IInstanceRepository;
  let orchestrator: MessageOrchestrator;
  let sender: TextMessageSender;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = {
      findById: vi.fn().mockResolvedValue(buildInstance(true)),
    } as unknown as IInstanceRepository;
    orchestrator = {
      send: vi.fn().mockResolvedValue(undefined),
    } as unknown as MessageOrchestrator;
    sender = new TextMessageSender(repository, orchestrator);
  });

  it('sends the message through the orchestrator', async () => {
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await sender.execute(command);

    expect(orchestrator.send).toHaveBeenCalledTimes(1);
  });

  it('sends the jid and message passed in the command', async () => {
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await sender.execute(command);

    expect(orchestrator.send).toHaveBeenCalledWith(
      INSTANCE_UUID,
      '5215512345678@s.whatsapp.net',
      'hi'
    );
  });

  it('looks the instance up by its identifier', async () => {
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await sender.execute(command);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(vi.mocked(repository.findById).mock.calls[0][0].value).toBe(INSTANCE_UUID);
  });

  it('sends an empty message without failing', async () => {
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: '' };

    await sender.execute(command);

    expect(orchestrator.send).toHaveBeenCalledWith(INSTANCE_UUID, '5215512345678@s.whatsapp.net', '');
  });

  it('throws InstanceNotFoundError when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await expect(sender.execute(command)).rejects.toThrow(InstanceNotFoundError);
  });

  it('does not send anything when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await expect(sender.execute(command)).rejects.toThrow();
    expect(orchestrator.send).not.toHaveBeenCalled();
  });

  it('throws a ValidationError when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await expect(sender.execute(command)).rejects.toThrow(ValidationError);
  });

  it('does not send anything when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await expect(sender.execute(command)).rejects.toThrow(/is not connected/);
    expect(orchestrator.send).not.toHaveBeenCalled();
  });

  it('resolves even when the orchestrator returns no result', async () => {
    vi.mocked(orchestrator.send).mockResolvedValue(undefined);
    const command = { instanceId: INSTANCE_UUID, jid: '5215512345678@s.whatsapp.net', message: 'hi' };

    await expect(sender.execute(command)).resolves.toBeUndefined();
    expect(orchestrator.send).toHaveBeenCalledTimes(1);
  });
});
