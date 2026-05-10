import { ILogger } from '../../src/infrastructure/loggers/Logger'

export class MockLogger implements ILogger {
  info = vi.fn()
  warn = vi.fn()
  error = vi.fn()
  fatal = vi.fn()
  debug = vi.fn()
  trace = vi.fn()
}
