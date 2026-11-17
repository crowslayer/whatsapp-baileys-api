import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';

import { ConnectionStatus } from '@modules/instances/domain/ConnectionStatus';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';
import { PhoneNumber } from '@modules/instances/domain/PhoneNumber';

const VALID_UUID = '018f6c2a-1b2c-7def-89ab-0123456789ab';

describe('InstanceAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an instance in disconnected state', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    expect(instance.status.value).toBe('disconnected');
    expect(instance.name.value).toBe('Primary');
    expect(instance.phoneNumber).toBeUndefined();
    expect(instance.webhookUrl).toBeUndefined();
  });

  it('creates an instance with a generated instance id', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    expect(instance.instanceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('creates an instance with a webhook url and phone number', () => {
    const instance = InstanceAggregate.create({
      name: Name.create('Primary'),
      webhookUrl: 'https://example.com/hook',
      phoneNumber: PhoneNumber.create('1234567890'),
    });

    expect(instance.webhookUrl).toBe('https://example.com/hook');
    expect(instance.phoneNumber?.value).toBe('1234567890');
  });

  it('registers the instance created domain event', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    expect(instance.domainEvents).toHaveLength(1);
    expect(instance.domainEvents[0].eventName).toBe('instance.created');
  });

  it('pulls and clears the domain events', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    const events = instance.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(instance.domainEvents).toHaveLength(0);
  });

  it('restores an instance keeping the given state', () => {
    const instance = InstanceAggregate.restore({
      instanceId: InstanceId.fromString(VALID_UUID),
      name: Name.create('Restored'),
      status: ConnectionStatus.connected(),
      phoneNumber: PhoneNumber.create('1234567890'),
    });

    expect(instance.instanceId).toBe(VALID_UUID);
    expect(instance.status.value).toBe('connected');
    expect(instance.domainEvents).toHaveLength(0);
  });

  it('rebuilds an instance from primitives', () => {
    const instance = InstanceAggregate.fromPrimitives({
      instanceId: VALID_UUID,
      name: 'FromPrimitives',
      status: 'connected',
      phoneNumber: '1234567890',
      webhookUrl: 'https://example.com/hook',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      lastConnectedAt: new Date('2024-03-01T00:00:00.000Z'),
    });

    expect(instance.instanceId).toBe(VALID_UUID);
    expect(instance.name.value).toBe('FromPrimitives');
    expect(instance.status.value).toBe('connected');
    expect(instance.phoneNumber?.value).toBe('1234567890');
    expect(instance.lastConnectedAt?.value.getTime()).toBe(
      new Date('2024-03-01T00:00:00.000Z').getTime()
    );
  });

  it('rebuilds an instance from primitives without optional values', () => {
    const instance = InstanceAggregate.fromPrimitives({
      instanceId: VALID_UUID,
      name: 'Minimal',
      status: 'disconnected',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-02-01T00:00:00.000Z'),
    });

    expect(instance.phoneNumber).toBeUndefined();
    expect(instance.webhookUrl).toBeUndefined();
    expect(instance.lastConnectedAt).toBeUndefined();
  });

  it('throws ValidationError when the name is empty', () => {
    const fakeName = { value: '' } as unknown as Name;

    expect(() =>
      InstanceAggregate.restore({
        instanceId: InstanceId.fromString(VALID_UUID),
        name: fakeName,
        status: ConnectionStatus.disconnected(),
      })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when the name has more than one hundred characters', () => {
    const fakeName = { value: 'a'.repeat(101) } as unknown as Name;

    expect(() =>
      InstanceAggregate.restore({
        instanceId: InstanceId.fromString(VALID_UUID),
        name: fakeName,
        status: ConnectionStatus.disconnected(),
      })
    ).toThrow(ValidationError);
  });

  it('connects the instance updating status, phone number and last connected at', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    instance.connect('1234567890');

    expect(instance.status.value).toBe('connected');
    expect(instance.phoneNumber?.value).toBe('1234567890');
    expect(instance.lastConnectedAt).toBeDefined();
  });

  it('registers the instance connected domain event', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    instance.connect('1234567890');

    expect(instance.domainEvents).toHaveLength(2);
    expect(instance.domainEvents[1].eventName).toBe('instance.connected');
  });

  it('does not connect twice when already connected', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    instance.connect('1234567890');
    instance.connect('9999999999');

    expect(instance.phoneNumber?.value).toBe('1234567890');
    expect(instance.domainEvents).toHaveLength(2);
  });

  it('disconnects the instance updating the status', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    instance.connect('1234567890');

    instance.disconnect('manual');

    expect(instance.status.value).toBe('disconnected');
  });

  it('registers the instance disconnected domain event', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    instance.connect('1234567890');

    instance.disconnect('manual');

    expect(instance.domainEvents).toHaveLength(3);
    expect(instance.domainEvents[2].eventName).toBe('instance.disconnected');
  });

  it('does not disconnect when the instance is not connected', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    instance.disconnect('manual');

    expect(instance.domainEvents).toHaveLength(1);
    expect(instance.status.value).toBe('disconnected');
  });

  it('returns true for canSendMessages when connected', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    instance.connect('1234567890');

    expect(instance.canSendMessages()).toBe(true);
  });

  it('returns false for canSendMessages when disconnected', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    expect(instance.canSendMessages()).toBe(false);
  });

  it('serializes the instance to primitives', () => {
    const instance = InstanceAggregate.create({
      name: Name.create('Primary'),
      webhookUrl: 'https://example.com/hook',
      phoneNumber: PhoneNumber.create('1234567890'),
    });
    instance.connect('1234567890');

    const primitives = instance.toPrimitives();

    expect(primitives.instanceId).toBe(instance.instanceId);
    expect(primitives.name).toBe('Primary');
    expect(primitives.status).toBe('connected');
    expect(primitives.phoneNumber).toBe('1234567890');
    expect(primitives.webhookUrl).toBe('https://example.com/hook');
    expect(primitives.createdAt).toBeInstanceOf(Date);
    expect(primitives.updatedAt).toBeInstanceOf(Date);
    expect(primitives.lastConnectedAt).toBeInstanceOf(Date);
  });

  it('serializes the instance to primitives without optional values', () => {
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    const primitives = instance.toPrimitives();

    expect(primitives.phoneNumber).toBeUndefined();
    expect(primitives.webhookUrl).toBeUndefined();
    expect(primitives.lastConnectedAt).toBeUndefined();
  });
});
