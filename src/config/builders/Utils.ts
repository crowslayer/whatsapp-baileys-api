import { URL } from 'node:url';

import { Environment } from '@config/index';

export function required(name: string, value?: string): string {
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export function toBoolean(value?: string): boolean {
  return value === 'true';
}

export function toNumber(name: string, value?: string): number {
  const parsed = Number(value);

  if (isNaN(parsed)) {
    throw new Error(`Env variable ${name} must be a number`);
  }
  return parsed;
}

export function toPort(name: string, value?: string): number {
  const n = toNumber(name, value);

  if (!Number.isInteger(n) || n < 1 || n > 65535)
    throw new Error(`${name} must be a valid port (1–65535), got: ${value}`);

  return n;
}

export function parseJwtExpiry(name: string, value: string): string {
  const JWT_DURATION_RE = /^\d+[smhd]$/;

  if (!JWT_DURATION_RE.test(value))
    throw new Error(`${name} format invalid: use e.g. '1d', '2h', '30m'`);
  return value;
}

export function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => {
      try {
        return ['http:', 'https:'].includes(new URL(o).protocol);
      } catch {
        return false;
      }
    });
}

export function parseEnvironment(value?: string): Environment {
  switch (value) {
    case 'development':
    case 'production':
    case 'test':
    case 'staging':
      return value;
    default:
      throw new Error(`Invalid NODE_ENV: ${value}`);
  }
}
