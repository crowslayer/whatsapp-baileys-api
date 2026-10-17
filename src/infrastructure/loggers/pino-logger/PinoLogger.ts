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
            level: Levels.TRACE,
            options: {
              destination: `./logs/apps/log.app.siec-${Levels.DEBUG}-${date.toJSON().slice(0, 10)}.log`,
              mkdir: true,
            },
          },
        ],
      },
    };

    const initOptions = deepMerge(optionsDefault, options);
    this._logger = pino(initOptions);
  }

  trace(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.trace(args[0], message);
      return;
    }
    this._logger.trace(message, ...(args as never[]));
  }

  info(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.info(args[0], message);
      return;
    }
    this._logger.info(message, ...(args as never[]));
  }

  warn(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.warn(args[0], message);
      return;
    }
    this._logger.warn(message, ...(args as never[]));
  }

  error(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.error(args[0], message);
      return;
    }
    this._logger.error(message, ...(args as never[]));
  }

  fatal(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.fatal(args[0], message);
      return;
    }
    this._logger.fatal(message, ...(args as never[]));
  }

  debug(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.debug(args[0], message);
      return;
    }
    this._logger.debug(message, ...(args as never[]));
  }

  log(message: string | Error | object, ...args: unknown[]): void {
    if (typeof message === 'string' && args.length > 0 && typeof args[0] === 'object') {
      this._logger.info(args[0], message);
      return;
    }
    this._logger.info(message, ...(args as never[]));
  }

  getLogger(): PinoLoggerType {
    return this._logger;
  }

  child(childName: string): PinoLoggerType {
    return this._logger.child({ service: childName });
  }
}

function deepMerge(target: LoggerOptions, source: LoggerOptions): LoggerOptions {
  const targetRecord = target as Record<string, unknown>;
  const sourceRecord = source as Record<string, unknown>;

  for (const key of Object.keys(sourceRecord)) {
    const sourceValue = sourceRecord[key];
    const targetValue = targetRecord[key];

    if (sourceValue instanceof Object && targetValue instanceof Object) {
      Object.assign(
        sourceValue,
        deepMerge(targetValue as LoggerOptions, sourceValue as LoggerOptions)
      );
    }
  }

  return { ...target, ...source };
}
