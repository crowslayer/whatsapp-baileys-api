import { WhatsAppInstanceAggregate } from '../../../src/domain/aggregates/WhatsAppInstanceAggregate'
import { Name } from '../../../src/domain/value-objects/Name'
import { InstanceId } from '../../../src/domain/value-objects/InstanceId'
import { ConnectionStatus } from '../../../src/domain/value-objects/ConnectionStatus'

describe('WhatsAppInstanceAggregate', () => {
  test('should create instance with disconnected status', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Test Instance'))
    expect(instance.status.value).toBe('disconnected')
    expect(instance.name.value).toBe('TEST INSTANCE')
    expect(instance.instanceId).toBeDefined()
  })

  test('should create with webhook URL', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('With Webhook'), 'http://hook.test')
    expect(instance.webhookUrl).toBe('http://hook.test')
  })

  test('should restore from props', () => {
    const instanceId = InstanceId.fromString('inst-restore')
    const name = Name.create('Restored')
    const status = ConnectionStatus.connected()
    const instance = WhatsAppInstanceAggregate.restore({ instanceId, name, status })
    expect(instance.instanceId).toBe('inst-restore')
    expect(instance.status.value).toBe('connected')
  })

  test('should connect and set phone number', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Connecting'))
    instance.connect('5215512345678')
    expect(instance.status.value).toBe('connected')
    expect(instance.phoneNumber?.value).toBe('5215512345678')
    expect(instance.lastConnectedAt).toBeDefined()
  })

  test('should disconnect', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Disconnecting'))
    instance.connect('5215512345678')
    instance.disconnect('logout')
    expect(instance.status.value).toBe('disconnected')
  })

  test('canSendMessages returns true only when connected', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Test'))
    expect(instance.canSendMessages()).toBe(false)
    instance.connect('5215512345678')
    expect(instance.canSendMessages()).toBe(true)
    instance.disconnect()
    expect(instance.canSendMessages()).toBe(false)
  })

  test('toJSON returns expected shape', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('JSON Test'))
    instance.connect('5215512345678')
    const json = instance.toJSON()
    expect(json.instanceId).toBeDefined()
    expect(json.name).toBe('JSON TEST')
    expect(json.status).toBe('connected')
    expect(json.phoneNumber).toBe('5215512345678')
    expect(json.webhookUrl).toBeUndefined()
  })

  test('should emit domain events on create', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Events'))
    expect(instance.domainEvents.length).toBeGreaterThan(0)
  })

  test('should emit domain events on connect', () => {
    const instance = WhatsAppInstanceAggregate.create(Name.create('Connect Events'))
    instance.connect('5215512345678')
    const connectEvents = instance.domainEvents.filter(e => e.constructor.name === 'InstanceConnectedEvent')
    expect(connectEvents.length).toBeGreaterThan(0)
  })
})
