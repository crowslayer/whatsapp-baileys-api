import { AuditDataBuilder } from '../../../src/shared/infrastructure/AuditData'

describe('AuditDataBuilder', () => {
  test('should build audit data with action and resource', () => {
    const audit = new AuditDataBuilder('CREATE', 'FLOW').build()
    expect(audit.action).toBe('CREATE')
    expect(audit.resource).toBe('FLOW')
    expect(audit.timestamp).toBeInstanceOf(Date)
  })

  test('should add user info', () => {
    const audit = new AuditDataBuilder('READ', 'INSTANCE')
      .withUser('user-1', 'John')
      .build()
    expect(audit.userId).toBe('user-1')
    expect(audit.userName).toBe('John')
  })

  test('should add resource id', () => {
    const audit = new AuditDataBuilder('DELETE', 'FLOW')
      .withResourceId('flow-123')
      .build()
    expect(audit.resourceId).toBe('flow-123')
  })

  test('should add request info', () => {
    const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
      .withRequest('192.168.1.1', 'curl/7.68')
      .build()
    expect(audit.ipAddress).toBe('192.168.1.1')
    expect(audit.userAgent).toBe('curl/7.68')
  })

  test('should add details', () => {
    const audit = new AuditDataBuilder('CREATE', 'FLOW')
      .withDetails({ name: 'Test Flow' })
      .build()
    expect(audit.details).toEqual({ name: 'Test Flow' })
  })

  test('should chain all methods', () => {
    const audit = new AuditDataBuilder('UPDATE', 'CAMPAIGN')
      .withUser('u1', 'Alice')
      .withResourceId('camp-1')
      .withRequest('10.0.0.1', 'Postman')
      .withDetails({ status: 'active' })
      .build()
    expect(audit.action).toBe('UPDATE')
    expect(audit.resource).toBe('CAMPAIGN')
    expect(audit.userId).toBe('u1')
    expect(audit.resourceId).toBe('camp-1')
    expect(audit.ipAddress).toBe('10.0.0.1')
    expect(audit.userAgent).toBe('Postman')
    expect(audit.details).toEqual({ status: 'active' })
  })
})
