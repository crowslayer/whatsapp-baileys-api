export interface ILogger {
  info(message: string | Error | object, ...args: unknown[]): void;
  warn(message: string | Error | object, ...args: unknown[]): void;
  error(message: string | Error | object, ...args: unknown[]): void;
  fatal(message: string | Error | object, ...args: unknown[]): void;
  debug(message: string | Error | object, ...args: unknown[]): void;
  trace(message: string | Error | object, ...args: unknown[]): void;
}
