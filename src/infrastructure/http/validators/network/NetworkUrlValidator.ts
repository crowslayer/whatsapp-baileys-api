import dns from 'node:dns/promises';
import net from 'node:net';
import { URL } from 'node:url';

export interface INetworkValidationConfig {
  enabled: boolean;
  validateDns: boolean;

  allowedProtocols: readonly string[];
  allowedPorts: readonly number[];
  allowedHosts: readonly string[];

  blockPrivateNetworks: boolean;
  blockLoopback: boolean;
  blockLinkLocal: boolean;
  blockMulticast: boolean;
  blockReserved: boolean;
}

export class NetworkUrlValidator {
  constructor(private readonly config: INetworkValidationConfig) {}

  async validate(url: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const parsed = new URL(url);

    this.validateProtocol(parsed);
    this.validateCredentials(parsed);
    this.validateHost(parsed.hostname);
    this.validatePort(parsed);

    if (this.config.validateDns) {
      await this.validateDns(parsed.hostname);
    }
  }

  private validateProtocol(url: URL): void {
    if (!this.config.allowedProtocols.includes(url.protocol.replace(':', ''))) {
      throw new Error(`Protocol "${url.protocol}" is not allowed.`);
    }
  }

  private validateCredentials(url: URL): void {
    if (url.username || url.password) {
      throw new Error('URL credentials are not allowed.');
    }
  }

  private validatePort(url: URL): void {
    const port = url.port ? Number(url.port) : 443;

    if (!this.config.allowedPorts.includes(port)) {
      throw new Error(`Port ${port} is not allowed.`);
    }
  }

  private validateHost(host: string): void {
    const allowed = this.config.allowedHosts.some((pattern) => {
      if (pattern === '*') return true;

      if (pattern.startsWith('*.')) {
        const suffix = pattern.substring(1);
        return host === suffix.substring(1) || host.endsWith(suffix);
      }

      return host === pattern;
    });

    if (!allowed) {
      throw new Error(`Host "${host}" is not allowed.`);
    }
  }

  private async validateDns(host: string): Promise<void> {
    const ipv4 = await dns.resolve4(host).catch(() => []);
    const ipv6 = await dns.resolve6(host).catch(() => []);

    const addresses = [...ipv4, ...ipv6];

    if (addresses.length === 0) {
      throw new Error(`Unable to resolve host "${host}".`);
    }

    for (const ip of addresses) {
      if (this.isBlocked(ip)) {
        throw new Error(`Host resolves to blocked address "${ip}".`);
      }
    }
  }

  private isBlocked(ip: string): boolean {
    if (net.isIPv4(ip)) {
      if (this.config.blockLoopback && ip.startsWith('127.')) return true;

      if (
        this.config.blockPrivateNetworks &&
        (ip.startsWith('10.') ||
          ip.startsWith('192.168.') ||
          /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip))
      )
        return true;

      if (this.config.blockLinkLocal && ip.startsWith('169.254.')) return true;

      if (this.config.blockMulticast && /^22[4-9]\.|23\d\./.test(ip)) return true;

      if (this.config.blockReserved && ip === '0.0.0.0') return true;
    }

    if (net.isIPv6(ip)) {
      if (this.config.blockLoopback && ip === '::1') return true;

      if (this.config.blockPrivateNetworks && (ip.startsWith('fc') || ip.startsWith('fd')))
        return true;

      if (this.config.blockLinkLocal && ip.startsWith('fe80')) return true;

      if (this.config.blockMulticast && ip.startsWith('ff')) return true;
    }

    return false;
  }
}
