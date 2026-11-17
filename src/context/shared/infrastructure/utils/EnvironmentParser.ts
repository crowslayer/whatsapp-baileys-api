export function envNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];

  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Missing required environment variable: ${name}`);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsed;
}

export function envString(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function envBoolean(name: string, defaultValue = false): boolean {
  const value = process.env[name];

  if (value === undefined || value === '') {
    return defaultValue;
  }

  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`Environment variable ${name} must be "true" or "false"`);
}

export function envList(name: string, defaultValue: string[] = []): string[] {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

type SecurityType = 'jwt' | 'oauth2';

export function envSecurityType(value?: string): SecurityType {
  if (value === 'jwt') {
    return 'jwt';
  }

  if (value === 'oauth2') {
    return 'oauth2';
  }

  throw new Error(`Invalid SECURITY_TYPE: ${value}`);
}
