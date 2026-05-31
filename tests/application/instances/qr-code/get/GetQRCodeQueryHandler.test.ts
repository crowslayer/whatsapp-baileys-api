import { GetQRCodeQueryHandler } from '../../../../../src/application/instances/qr-code/get/GetQRCodeQueryHandler'
import { GetQRCodeQuery } from '../../../../../src/application/instances/qr-code/get/GetQRCodeQuery'
import { NotFoundError } from '../../../../../src/shared/infrastructure/errors/NotFoundError'

describe('GetQRCodeQueryHandler', () => {
  test('subscribedTo() returns GetQRCodeQuery', () => {
    const handler = new GetQRCodeQueryHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(GetQRCodeQuery)
  })

  test('handle returns QRCodeResponse', async () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', qrCode: 'data', qrText: 'text', phoneNumber: undefined, qrStatus: 'ready' }
    const mockSearcher = { execute: vi.fn().mockResolvedValue(instance) }
    const handler = new GetQRCodeQueryHandler(mockSearcher)

    const query = new GetQRCodeQuery('inst-1')
    const result = await handler.handle(query)
    expect(result.content.instanceId).toBe('inst-1')
  })

  test('re-throws NotFoundError from searcher', async () => {
    const mockSearcher = { execute: vi.fn().mockRejectedValue(new NotFoundError('instance not found')) }
    const handler = new GetQRCodeQueryHandler(mockSearcher)

    const query = new GetQRCodeQuery('inst-none')
    await expect(handler.handle(query)).rejects.toThrow(NotFoundError)
  })
})
