import { QRCodeStatus } from '../../../../../src/application/instances/qr-code/status/QRCodeStatus'

describe('QRCodeStatus', () => {
  test('execute returns status with connected=false', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', phoneNumber: undefined }
    const mockRepo = { findById: vi.fn().mockResolvedValue(instance) }
    const mockStore = { get: vi.fn().mockResolvedValue(null) }
    const status = new QRCodeStatus(mockRepo, mockStore)

    const result = await status.execute('inst-1')
    expect(result.connected).toBe(false)
    expect(result.qrStatus).toBe('pending')
  })

  test('execute returns status with connected=true', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'connected', phoneNumber: '5215512345678' }
    const connectionState = { status: 'connected' }
    const mockRepo = { findById: vi.fn().mockResolvedValue(instance) }
    const mockStore = { get: vi.fn().mockResolvedValue(connectionState) }
    const status = new QRCodeStatus(mockRepo, mockStore)

    const result = await status.execute('inst-1')
    expect(result.connected).toBe(true)
  })

  test('execute throws Error when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockStore = { get: vi.fn() }
    const status = new QRCodeStatus(mockRepo, mockStore)

    await expect(status.execute('inst-none')).rejects.toThrow('Instance not found')
  })
})
