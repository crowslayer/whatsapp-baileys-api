import { WhatsAppInstanceAggregate } from '../../../src/domain/aggregates/WhatsAppInstanceAggregate';
import { ConnectionStatus } from '../../../src/domain/value-objects/ConnectionStatus';
import { InstanceId } from '../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../src/domain/value-objects/Name';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';

describe('WhatsAppInstanceAggregate', () => {
  test('should create instance with disconnected status', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Test Instance'));
    expect(instance.status.value).toBe('disconnected');
    expect(instance.name.value).toBe('Test Instance');
    expect(instance.instanceId).toBeDefined();
  });

  test('should create with webhook URL', () => {
    const instance = WhatsAppInstanceAggregate.create(
      Name.create('With Webhook'),
      'http://hook.test'
    );
    expect(instance.webhookUrl).toBe('http://hook.test');
  });

  test('should restore from props', () => {
    const instanceId = InstanceId.fromString('inst-restore');
    const name = Name.create('Restored');
    const status = ConnectionStatus.connected();
    const instance = WhatsAppInstanceAggregate.restore({ instanceId, name, status });
    expect(instance.instanceId).toBe('inst-restore');
    expect(instance.status.value).toBe('connected');
  });

  test('should connect and set phone number', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Connecting'));
    instance.connect('5215512345678');
    expect(instance.status.value).toBe('connected');
    expect(instance.phoneNumber?.value).toBe('5215512345678');
    expect(instance.lastConnectedAt).toBeDefined();
  });

  test('should disconnect', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Disconnecting'));
    instance.connect('5215512345678');
    instance.disconnect('logout');
    expect(instance.status.value).toBe('disconnected');
  });

  test('canSendMessages returns true only when connected', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Test'));
    expect(instance.canSendMessages()).toBe(false);
    instance.connect('5215512345678');
    expect(instance.canSendMessages()).toBe(true);
    instance.disconnect();
    expect(instance.canSendMessages()).toBe(false);
  });

  test('toJSON returns expected shape', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('JSON Test'));
    instance.connect('5215512345678');
    const json = instance.toPrimitives();
    expect(json.instanceId).toBeDefined();
    expect(json.name).toBe('JSON Test');
    expect(json.status).toBe('connected');
    expect(json.phoneNumber).toBe('5215512345678');
    expect(json.webhookUrl).toBeUndefined();
  });

  test('should emit domain events on create', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Events'));
    expect(instance.domainEvents.length).toBeGreaterThan(0);
  });

  test('should emit domain events on connect', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Connect Events'));
    instance.connect('5215512345678');
    const connectEvents = instance.domainEvents.filter(
      (e) => e.constructor.name === 'InstanceConnectedEvent'
    );
    expect(connectEvents.length).toBeGreaterThan(0);
  });

  test('should emit domain events on disconnect', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Disc Events'));
    instance.connect('5215512345678');
    instance.disconnect('logout');
    const disconnectEvents = instance.domainEvents.filter(
      (e) => e.constructor.name === 'InstanceDisconnectedEvent'
    );
    expect(disconnectEvents.length).toBeGreaterThan(0);
  });

  test('connect when already connected succeeds (no throw)', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Double Connect'));
    instance.connect('5215512345678');
    expect(() => instance.connect('5215598765432')).not.toThrow();
    expect(instance.phoneNumber?.value).toBe('5215598765432');
  });

  test('disconnect when already disconnected succeeds (no throw)', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Double Disc'));
    expect(instance.status.value).toBe('disconnected');
    expect(() => instance.disconnect()).not.toThrow();
    expect(instance.status.value).toBe('disconnected');
  });

  test('restore from props with all fields', () => {
    const instanceId = InstanceId.fromString('inst-full-restore');
    const name = Name.create('Full Restore');
    const status = ConnectionStatus.connected();
    const phoneNumber = PhoneNumber.create('5215512345678');
    const createdAt = new Date('2023-01-01');
    const updatedAt = new Date('2023-06-15');
    const lastConnectedAt = new Date('2023-06-14');
    const instance = WhatsAppInstanceAggregate.restore({
      instanceId,
      name,
      status,
      phoneNumber,
      webhookUrl: 'http://hook.test/restore',
      createdAt,
      updatedAt,
      lastConnectedAt,
    });
    expect(instance.instanceId).toBe('inst-full-restore');
    expect(instance.status.value).toBe('connected');
    expect(instance.phoneNumber?.value).toBe('5215512345678');
    expect(instance.webhookUrl).toBe('http://hook.test/restore');
    expect(instance.lastConnectedAt).toEqual(lastConnectedAt);
  });
});
