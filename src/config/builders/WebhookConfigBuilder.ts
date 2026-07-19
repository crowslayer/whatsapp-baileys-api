import { toBoolean, toNumber } from '@config/builders/Utils';
import { AlgorithmType, ICircuitBreaker, IWebhookConfig } from '@config/index';

export class WebhookConfigBuilder {
  // eslint-disable-next-line
  static build(): IWebhookConfig {
    const environment = process.env.NODE_ENV;
    const enabled = toBoolean(process.env.WEBHOOK_ENABLED ?? 'true');

    const timeout = toNumber('WEBHOOK_TIMEOUT', process.env.WEBHOOK_TIMEOUT ?? '10000');

    const retryAttempts = toNumber(
      'WEBHOOK_RETRY_ATTEMPTS',
      process.env.WEBHOOK_RETRY_ATTEMPTS ?? '3'
    );

    const maxPayloadSize = toNumber(
      'WEBHOOK_MAX_PAYLOAD_SIZE',
      process.env.WEBHOOK_MAX_PAYLOAD_SIZE ?? '1048576' // 1MB
    );

    const userAgent = process.env.WEBHOOK_USER_AGENT ?? 'ApiRestWhatsAPI/1.0';

    const signPayload = toBoolean(process.env.WEBHOOK_SIGN_PAYLOAD ?? 'true');

    const signatureAlgorithm = this.parseSignatureAlgorithm(
      process.env.WEBHOOK_SIGNATURE_ALGORITHM ?? 'sha256'
    );

    const allowedProtocols = this.parseProtocols(process.env.WEBHOOK_ALLOWED_PROTOCOLS ?? 'https');

    const allowedPorts = this.parsePorts(process.env.WEBHOOK_ALLOWED_PORTS ?? '443');

    const allowedHosts = this.parseHosts(process.env.WEBHOOK_ALLOWED_HOSTS ?? '');

    const allowPrivateNetworks =
      environment === 'development' ? toBoolean(process.env.WEBHOOK_ALLOW_PRIVATE_NETWORKS) : false;

    const validateDns = toBoolean(process.env.WEBHOOK_VALIDATE_DNS ?? 'true');
    const circuitBreaker = WebhookConfigBuilder.buildCircuirBreaker();
    const bodyLength = toNumber('MAx_BODY_LENGTH', process.env.WEBHOOK_MAX_BODY_LENGTH ?? '2');
    const maxBodyLength = bodyLength * 1024 * 1024;
    const contenLength = toNumber(
      'MAx_CONTENT_LENGTH',
      process.env.WEBHOOK_MAX_CONTENT_LENGTH ?? '5'
    );
    const maxContentLength = contenLength * 1024 * 1024;

    const blockPrivateNetworks = toBoolean(process.env.WEBHOOK_BLOCK_PRIVATE_NETWORKS);
    const blockLoopback = toBoolean(process.env.WEBHOOK_BLOCK_LOOP_BACK);
    const blockLinkLocal = toBoolean(process.env.WEBHOOK_BLOCK_LINK_LOCAL);
    const blockMulticast = toBoolean(process.env.WEBHOOK_BLOCK_MULTICAST);
    const blockReserved = toBoolean(process.env.WEBHOOK_BLOCK_RESERVED);

    return Object.freeze({
      enabled,
      timeout,
      retryAttempts,
      maxPayloadSize,
      userAgent,
      signPayload,
      signatureAlgorithm,
      allowedProtocols,
      allowedPorts,
      allowedHosts,
      allowPrivateNetworks,
      validateDns,
      circuitBreaker,
      maxBodyLength,
      maxContentLength,
      blockPrivateNetworks,
      blockLoopback,
      blockLinkLocal,
      blockMulticast,
      blockReserved,
    });
  }

  private static buildCircuirBreaker(): ICircuitBreaker {
    return {
      failureThreshold: toNumber(
        'WEBHOOK_CIRCUIT_BREAKER_FAILURE_THRESHOLD',
        process.env.WEBHOOK_CIRCUIT_BREAKER_FAILURE_THRESHOLD ?? '5'
      ),
      successThreshold: toNumber(
        'WEBHOOK_CIRCUIT_BREAKER_SUCCESS_THRESHOLD',
        process.env.WEBHOOK_CIRCUIT_BREAKER_SUCCESS_THRESHOLD ?? '2'
      ),
      timeout: toNumber(
        'WEBHOOK_CIRCUIT_BREAKER_TIMEOUT',
        process.env.WEBHOOK_CIRCUIT_BREAKER_TIMEOUT ?? '30000'
      ),
    };
  }

  private static parseProtocols(value: string): 'https'[] {
    const protocols = value.split(',').map((v) => v.trim().toLowerCase());

    if (!protocols.every((p) => p === 'https')) {
      throw new Error('Only HTTPS protocol is supported.');
    }

    return ['https'];
  }

  private static parsePorts(value: string): number[] {
    const ports = value.split(',').map((v) => Number(v.trim()));

    ports.forEach((port) => {
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid webhook port: ${port}`);
      }
    });

    return ports;
  }

  private static parseHosts(value: string): string[] {
    if (!value.trim()) {
      return [];
    }

    return value
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  private static parseSignatureAlgorithm(value: string): AlgorithmType {
    switch (value.toLowerCase()) {
      case 'sha256':
      case 'sha384':
      case 'sha512':
        return value.toLowerCase() as AlgorithmType;

      default:
        throw new Error(`Unsupported signature algorithm: ${value}`);
    }
  }
}
