import {
  ConnectionStatus,
  ConnectionStatusEnum,
} from '../../../src/domain/value-objects/ConnectionStatus';

describe('ConnectionStatus', () => {
  test('disconnected creates status with value disconnected', () => {
    const status = ConnectionStatus.disconnected();
    expect(status.value).toBe(ConnectionStatusEnum.DISCONNECTED);
  });

  test('connecting creates status with value connecting', () => {
    const status = ConnectionStatus.connecting();
    expect(status.value).toBe(ConnectionStatusEnum.CONNECTING);
  });

  test('connected creates status with value connected', () => {
    const status = ConnectionStatus.connected();
    expect(status.value).toBe(ConnectionStatusEnum.CONNECTED);
  });

  test('qrReady creates status with value qr_ready', () => {
    const status = ConnectionStatus.qrReady();
    expect(status.value).toBe(ConnectionStatusEnum.QR_READY);
  });

  test('pairingCodeReady creates status with value pairing_code_ready', () => {
    const status = ConnectionStatus.pairingCodeReady();
    expect(status.value).toBe(ConnectionStatusEnum.PAIRING_CODE_READY);
  });

  test('error creates status with value error', () => {
    const status = ConnectionStatus.error();
    expect(status.value).toBe(ConnectionStatusEnum.ERROR);
  });

  test('isConnected returns true only when connected', () => {
    expect(ConnectionStatus.connected().isConnected()).toBe(true);
    expect(ConnectionStatus.disconnected().isConnected()).toBe(false);
    expect(ConnectionStatus.connecting().isConnected()).toBe(false);
    expect(ConnectionStatus.qrReady().isConnected()).toBe(false);
    expect(ConnectionStatus.pairingCodeReady().isConnected()).toBe(false);
    expect(ConnectionStatus.error().isConnected()).toBe(false);
  });

  test('canSendMessages returns true only when connected', () => {
    expect(ConnectionStatus.connected().canSendMessages()).toBe(true);
    expect(ConnectionStatus.disconnected().canSendMessages()).toBe(false);
    expect(ConnectionStatus.connecting().canSendMessages()).toBe(false);
    expect(ConnectionStatus.qrReady().canSendMessages()).toBe(false);
    expect(ConnectionStatus.pairingCodeReady().canSendMessages()).toBe(false);
    expect(ConnectionStatus.error().canSendMessages()).toBe(false);
  });
});
