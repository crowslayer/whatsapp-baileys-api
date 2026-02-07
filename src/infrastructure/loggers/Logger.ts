export interface Logger {
  info(message: string | Error | object, ...args: any[]): void;
  warn(message: string | Error | object, ...args: any[]): void;
  error(message: string | Error | object, ...args: any[]): void;
  fatal(message: string | Error | object, ...args: any[]): void;
  debug(message: string | Error | object, ...args: any[]): void;
  trace(message: string | Error | object, ...args: any[]): void;
}
