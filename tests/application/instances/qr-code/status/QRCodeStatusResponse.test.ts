import { QRCodeStatusResponse } from '../../../../../src/application/instances/qr-code/status/QRCodeStatusResponse'

describe('QRCodeStatusResponse', () => {
  test('create wraps instance', () => {
    const instance = { status: 'connected', qrCode: null, qrText: null, phoneNumber: '5215512345678', qrStatus: 'expired', connected: true }
    const response = QRCodeStatusResponse.create(instance)
    expect(response.content).toBe(instance)
  })
})
