import crypto, { randomUUID } from 'crypto';
import { setTimeout } from 'node:timers/promises';

import axios, { AxiosInstance } from 'axios';

import { NetworkUrlValidator } from '@infrastructure/http/validators/network/NetworkUrlValidator';
import { CircuitBreaker, CircuitState } from '@infrastructure/http/webhooks/CircuitBreaker';
import { ILogger } from '@infrastructure/loggers/Logger';

import { IWebhookConfig } from '@config/index';

export interface IWebhookPayload {
  type: string;
  body: unknown;
  instanceId: string;
  timestamp: string;
  eventId: string;
  correlationId?: string;
  causationId?: string;
  version: 1;
}

interface IWebhookResult {
  success: boolean;
  status?: number;
  duration: number;
  retries: number;
  error?: string;
}

interface IWebhookEndpoint {
  registration: IWebhookRegistration;
  client: AxiosInstance;
  circuitBreaker: CircuitBreaker;
}

export interface IWebhookRegistration {
  instanceId: string;
  url: string;
  secret: string;
  enabled?: boolean;
}

export class WebhookService {
  private readonly _endpoints = new Map<string, IWebhookEndpoint>();

  constructor(
    private readonly config: IWebhookConfig,
    private readonly validator: NetworkUrlValidator,
    private readonly logger: ILogger
  ) {}

  private signPayload(payload: IWebhookPayload, secret: string): string {
    return crypto
      .createHmac(this.config.signatureAlgorithm, secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  private createPayload(instanceId: string, type: string, body: unknown): IWebhookPayload {
    if (!type.trim()) {
      throw new Error('Invalid event type');
    }
    if (body == null) {
      throw new Error('Payload cannot be null');
    }
    const eventId = randomUUID();
    return {
      eventId,
      type,
      body,
      instanceId,
      timestamp: new Date().toISOString(),
      version: 1,
      causationId: eventId,
      correlationId: randomUUID(),
    };
  }

  private async executeWithRetry(
    action: () => Promise<void>,
    attempts = this.config.retryAttempts
  ): Promise<void> {
    let delay = 500;

    for (let i = 0; i < attempts; i++) {
      try {
        return await action();
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }
        await setTimeout(delay);
        delay *= 2;
      }
    }
  }

  async configureWebhook(registration: IWebhookRegistration): Promise<void> {
    await this.validator.validate(registration.url);

    const baseURL = registration.url.replace(/\/$/, '');
    const instanceId = registration.instanceId;
    const circuitBreaker = new CircuitBreaker(`webhook:${instanceId}`, this.config.circuitBreaker, {
      warn: (msg) => this.logger.warn(msg),
      error: (msg) => this.logger.error(msg),
    });

    const client = axios.create({
      baseURL,
      timeout: this.config.timeout,
      headers: { 'Content-Type': 'application/json', 'User-Agent': this.config.userAgent },
      validateStatus: (status) => status < 500,
      maxBodyLength: this.config.maxBodyLength,
      maxContentLength: this.config.maxContentLength,
    });

    const config: IWebhookEndpoint = {
      registration: { ...registration, enabled: registration.enabled ?? true },
      client,
      circuitBreaker,
    };

    this._endpoints.set(instanceId, config);

    this.logger.info({
      event: 'webhook.configured',
      instanceId,
      url: baseURL,
    });
  }

  removeWebhook(instanceId: string): void {
    this._endpoints.delete(instanceId);
  }

  async send(instanceId: string, type: string, body: unknown): Promise<boolean> {
    const endpoint = this._endpoints.get(instanceId);
    if (!endpoint || !endpoint.registration.enabled) {
      return false;
    }
    const client = endpoint.client;
    const circuitBreaker = endpoint.circuitBreaker;

    if (!client || !circuitBreaker) {
      return false;
    }

    const payload = this.createPayload(instanceId, type, body);

    const signature = this.signPayload(payload, endpoint.registration.secret);

    const result = await circuitBreaker.execute(async () => {
      await this.executeWithRetry(() =>
        client.post('', payload, {
          headers: {
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': payload.timestamp,
            'X-Webhook-Nonce': randomUUID(),
            'X-Webhook-Event': payload.type,
            'X-Webhook-Version': '1',
            'Idempotency-Key': payload.eventId,
          },
        })
      );
    });

    this.logger.info({
      event: 'webhook.sent',
      instanceId,
      eventId: payload.eventId,
      // duration,
      // retry,
      correlationId: payload.correlationId,
      causationId: payload.causationId,
    });

    return result !== undefined;
  }

  getCircuitState(instanceId: string): CircuitState | undefined {
    return this._endpoints.get(instanceId)?.circuitBreaker.getState();
  }

  resetCircuit(instanceId: string): void {
    this._endpoints.get(instanceId)?.circuitBreaker.reset();
    this.logger.info(`Circuit breaker reset for instance ${instanceId}`);
  }

  getAllCircuitStates(): Map<string, CircuitState> {
    const states = new Map<string, CircuitState>();
    this._endpoints.forEach((cb, id) => {
      states.set(id, cb.circuitBreaker.getState());
    });
    return states;
  }
}
