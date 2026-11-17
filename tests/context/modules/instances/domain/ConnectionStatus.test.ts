import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { ValueObjectValidationError } from '@shared/domain/value-object/ValueObjectValidationError ';

import {
  ConnectionStatus,
  ConnectionStatusEnum,
} from '@modules/instances/domain/ConnectionStatus';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a status from a supported enum value', () => {
    const status = ConnectionStatus.create(ConnectionStatusEnum.CONNECTED);

    expect(status.value).toBe('connected');
  });

  it('creates the disconnected status', () => {
    const status = ConnectionStatus.disconnected();

    expect(status.value).toBe(ConnectionStatusEnum.DISCONNECTED);
  });

  it('creates the connecting status', () => {
    const status = ConnectionStatus.connecting();

    expect(status.value).toBe(ConnectionStatusEnum.CONNECTING);
  });

  it('creates the connected status', () => {
    const status = ConnectionStatus.connected();

    expect(status.value).toBe(ConnectionStatusEnum.CONNECTED);
  });

  it('creates the qr ready status', () => {
    const status = ConnectionStatus.qrReady();

    expect(status.value).toBe(ConnectionStatusEnum.QR_READY);
  });

  it('creates the pairing code ready status', () => {
    const status = ConnectionStatus.pairingCodeReady();

    expect(status.value).toBe(ConnectionStatusEnum.PAIRING_CODE_READY);
  });

  it('creates the error status', () => {
    const status = ConnectionStatus.error();

    expect(status.value).toBe(ConnectionStatusEnum.ERROR);
  });

  it('throws ValidationError when the status is not supported', () => {
    expect(() => ConnectionStatus.create('unknown' as ConnectionStatusEnum)).toThrow(ValidationError);
  });

  it('exposes the validation errors with the conectionStataus field', () => {
    try {
      ConnectionStatus.create('unknown' as ConnectionStatusEnum);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors[0].field).toBe('conectionStataus');
    }
  });

  it('creates a status from a raw string value', () => {
    const status = ConnectionStatus.fromValue('connected');

    expect(status.value).toBe(ConnectionStatusEnum.CONNECTED);
  });

  it('creates a status from a raw string value trimming the whitespace', () => {
    const status = ConnectionStatus.fromValue('  qr_ready  ');

    expect(status.value).toBe(ConnectionStatusEnum.QR_READY);
  });

  it('throws ValueObjectValidationError when the raw string is not supported', () => {
    expect(() => ConnectionStatus.fromValue('unknown')).toThrow(ValueObjectValidationError);
  });

  it('throws ValueObjectValidationError when the raw string is empty', () => {
    expect(() => ConnectionStatus.fromValue('')).toThrow(ValueObjectValidationError);
  });

  it('throws ValueObjectValidationError when the raw string is only whitespace', () => {
    expect(() => ConnectionStatus.fromValue('   ')).toThrow(ValueObjectValidationError);
  });

  it('returns true for isConnected when the status is connected', () => {
    const status = ConnectionStatus.connected();

    expect(status.isConnected()).toBe(true);
  });

  it('returns false for isConnected when the status is disconnected', () => {
    const status = ConnectionStatus.disconnected();

    expect(status.isConnected()).toBe(false);
  });

  it('returns true for canSendMessages when the status is connected', () => {
    const status = ConnectionStatus.connected();

    expect(status.canSendMessages()).toBe(true);
  });

  it('returns false for canSendMessages when the status is in error', () => {
    const status = ConnectionStatus.error();

    expect(status.canSendMessages()).toBe(false);
  });

  it('returns true when comparing two statuses with the same value', () => {
    const first = ConnectionStatus.connected();
    const second = ConnectionStatus.create(ConnectionStatusEnum.CONNECTED);

    expect(first.equals(second)).toBe(true);
  });

  it('returns false when comparing two statuses with different values', () => {
    const first = ConnectionStatus.connected();
    const second = ConnectionStatus.disconnected();

    expect(first.equals(second)).toBe(false);
  });

  it('converts the status to its string representation', () => {
    const status = ConnectionStatus.connected();

    expect(status.toString()).toBe('connected');
  });
});
