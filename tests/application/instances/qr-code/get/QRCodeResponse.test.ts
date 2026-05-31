import { QRCodeResponse } from '../../../../../src/application/instances/qr-code/get/QRCodeResponse'

describe('QRCodeResponse', () => {
  test('create wraps instance', () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'pending', qrCode: 'data', qrText: 'text', phoneNumber: undefined, qrStatus: 'ready' }
    const response = QRCodeResponse.create(instance)
    expect(response.content).toBe(instance)
  })
})
