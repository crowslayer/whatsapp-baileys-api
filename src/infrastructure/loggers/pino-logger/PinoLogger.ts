import pino, { LoggerOptions, Logger as PinoLoggerType } from 'pino';

import { ILogger } from '@infrastructure/loggers/Logger';

enum Levels {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
  SILENT = 'silent',
}

export class PinoLogger implements ILogger {
  private _logger: PinoLoggerType;

  constructor(options: LoggerOptions = {}) {
    const date = new Date();
    const optionsDefault = {
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: Levels.DEBUG,
            options: {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
          {
            target: 'pino/file',
            level: Levels.DEBUG,
            options: {
              destination: `./logs/apps/log.app.siec-${Levels.DEBUG}-${date.toJSON().slice(0, 10)}.log`,
              mkdir: true,
            },
          },
        ],
      },
    };
    // const initOptions = Object.assign(optionsDefault, options);
    // console.log(initOptions)
    const initOptions = deepMerge(optionsDefault, options);
    this._logger = pino(initOptions);
  }

  trace(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.trace(args[0], message);
      return;
    }
    this._logger.trace(message, '', ...args);
  }
  info(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.info(args[0], message);
      return;
    }
    this._logger.info(message, ...args);
  }
  warn(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.warn(args[0], message);
      return;
    }
    this._logger.warn(message, ...args);
  }
  error(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.error(args[0], message);
      return;
    }
    this._logger.error(message, ...args);
  }
  fatal(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.fatal(args[0], message);
      return;
    }
    this._logger.fatal(message, ...args);
  }
  debug(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.debug(args[0], message);
      return;
    }
    this._logger.debug(message, ...args);
  }
  log(message: string | Error | object, ...args: any[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.info(args[0], message);
      return;
    }
    this._logger.info(message, ...args);
  }

  getLogger() {
    return this._logger;
  }

  child(childName: string) {
    return this._logger.child({ service: childName });
  }
}

function deepMerge(target: any, source: any) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
}
