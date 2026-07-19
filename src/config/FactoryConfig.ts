import { DatabaseConfigBuilder } from '@config/builders/DatabaseConfigBuilder';
import { SecurityConfigBuilder } from '@config/builders/SecurityConfigBuilder';
import { toPort } from '@config/builders/Utils';
import { WebhookConfigBuilder } from '@config/builders/WebhookConfigBuilder';

import { IConfig } from '.';

type Environment = 'development' | 'production' | 'test' | 'staging';

export class FactoryConfig {
  static loadConfig(): IConfig {
    const PORT = toPort('PORT', process.env.PORT ?? '3333');
    const ENVIRONMENT = FactoryConfig.parseEnvironment(process.env.NODE_ENV);
    const API_PATH = (process.env.API_PATH || 'api').replace(/^\/+|\/+$/g, '');
    const API_VERSION = (process.env.API_VERSION || 'v1').replace(/^\/+|\/+$/g, '');
    const APP_URL =
      process.env.APP_URL ??
      (ENVIRONMENT === 'production'
        ? (() => {
            throw new Error('APP_URL is required in production');
          })()
        : `http://localhost:${PORT}`);

    return Object.freeze({
      environment: ENVIRONMENT,
      api: {
        port: PORT,
        path: API_PATH,
        version: API_VERSION,
        url: APP_URL,
      },
      database: DatabaseConfigBuilder.build(),
      security: SecurityConfigBuilder.build(),
      webhooks: WebhookConfigBuilder.build(),
    });
  }

  private static parseEnvironment(value?: string): Environment {
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
}
