import axios, { AxiosInstance } from 'axios';

import {
  CircuitBreaker,
  CircuitState,
  ICircuitBreakerOptions,
} from '@infrastructure/http/webhooks/CircuitBreaker';
import { ILogger } from '@infrastructure/loggers/Logger';

export interface IWebhookPayload {
  type: string;
  body: unknown;
  instanceId: string;
  timestamp: string;
}

export interface IWebhookServiceOptions {
  timeout?: number;
  circuitBreaker?: Partial<ICircuitBreakerOptions>;
}

const DEFAULT_CB_OPTIONS: ICircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
};

export class WebhookService {
  private readonly _clients: Map<string, AxiosInstance> = new Map();
  private readonly _circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private readonly _cbOptions: ICircuitBreakerOptions;
  private readonly _timeout: number;
  private readonly _logger: ILogger;

  constructor(logger: ILogger, options: IWebhookServiceOptions = {}) {
    this._logger = logger;
    this._timeout = options.timeout ?? 10000;
    this._cbOptions = {
      failureThreshold:
        options.circuitBreaker?.failureThreshold ?? DEFAULT_CB_OPTIONS.failureThreshold,
      successThreshold:
        options.circuitBreaker?.successThreshold ?? DEFAULT_CB_OPTIONS.successThreshold,
      timeout: options.circuitBreaker?.timeout ?? DEFAULT_CB_OPTIONS.timeout,
    };
  }

  configureWebhook(webhookUrl: string, instanceId: string): void {
    const baseURL = webhookUrl.replace(/\/$/, '');

    this._clients.set(
      instanceId,
      axios.create({
        baseURL,
        timeout: this._timeout,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    this._circuitBreakers.set(
      instanceId,
      new CircuitBreaker(`webhook:${instanceId}`, this._cbOptions, {
        warn: (msg) => this._logger.warn(msg),
        error: (msg) => this._logger.error(msg),
      })
    );

    this._logger.info(`Webhook configured for instance ${instanceId}: ${baseURL}`);
  }

  removeWebhook(instanceId: string): void {
    this._clients.delete(instanceId);
    this._circuitBreakers.delete(instanceId);
  }

  async send(instanceId: string, type: string, body: unknown): Promise<boolean> {
    const client = this._clients.get(instanceId);
    const circuitBreaker = this._circuitBreakers.get(instanceId);

    if (!client || !circuitBreaker) {
      return false;
    }

    const payload: IWebhookPayload = {
      type,
      body,
      instanceId,
      timestamp: new Date().toISOString(),
    };

    const result = await circuitBreaker.execute(async () => {
      await client.post('', payload);
    });

    return result !== undefined;
  }

  getCircuitState(instanceId: string): CircuitState | undefined {
    return this._circuitBreakers.get(instanceId)?.getState();
  }

  resetCircuit(instanceId: string): void {
    this._circuitBreakers.get(instanceId)?.reset();
    this._logger.info(`Circuit breaker reset for instance ${instanceId}`);
  }

  getAllCircuitStates(): Map<string, CircuitState> {
    const states = new Map<string, CircuitState>();
    this._circuitBreakers.forEach((cb, id) => {
      states.set(id, cb.getState());
    });
    return states;
  }
}
