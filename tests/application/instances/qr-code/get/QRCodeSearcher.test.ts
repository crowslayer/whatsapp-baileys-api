import { QRCodeSearcher } from '../../../../../src/application/instances/qr-code/get/QRCodeSearcher'

describe('QRCodeSearcher', () => {
  test('execute returns instance with qr data', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', phoneNumber: undefined }
    const connectionState = { qr: { base64: 'qr-data', text: 'qr-text' }, status: 'pending' }
    const mockRepo = { findById: vi.fn().mockResolvedValue(instance) }
    const mockStore = { get: vi.fn().mockResolvedValue(connectionState) }
    const searcher = new QRCodeSearcher(mockRepo, mockStore)

    const result = await searcher.execute('inst-1')
    expect(result.instanceId).toBe('inst-1')
    expect(result.qrCode).toBe('qr-data')
    expect(result.qrStatus).toBe('ready')
  })

  test('execute throws Error when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockStore = { get: vi.fn() }
    const searcher = new QRCodeSearcher(mockRepo, mockStore)

    await expect(searcher.execute('inst-none')).rejects.toThrow('Instance not found')
  })

  test('QR status is expired when connectionState exists but no qrCode', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', phoneNumber: undefined }
    const connectionState = { status: 'connected' }
    const mockRepo = { findById: vi.fn().mockResolvedValue(instance) }
    const mockStore = { get: vi.fn().mockResolvedValue(connectionState) }
    const searcher = new QRCodeSearcher(mockRepo, mockStore)

    const result = await searcher.execute('inst-1')
    expect(result.qrCode).toBeNull()
    expect(result.qrStatus).toBe('expired')
  })

  test('QR status is pending when no connectionState', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', phoneNumber: undefined }
    const mockRepo = { findById: vi.fn().mockResolvedValue(instance) }
    const mockStore = { get: vi.fn().mockResolvedValue(null) }
    const searcher = new QRCodeSearcher(mockRepo, mockStore)

    const result = await searcher.execute('inst-1')
    expect(result.qrCode).toBeNull()
    expect(result.qrStatus).toBe('pending')
  })
})
