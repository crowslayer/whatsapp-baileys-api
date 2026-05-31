import { Command } from '../../../../src/shared/domain/commands/Command';
import { CommandNotRegisteredError } from '../../../../src/shared/domain/commands/CommandNotRegisteredError';

class TestCommand extends Command<void> {}

describe('CommandNotRegisteredError', () => {
  test('error message includes the command class name', () => {
    const cmd = new TestCommand();
    const error = new CommandNotRegisteredError(cmd);
    expect(error.message).toContain('TestCommand');
  });

  test('extends Error', () => {
    const cmd = new TestCommand();
    const error = new CommandNotRegisteredError(cmd);
    expect(error).toBeInstanceOf(Error);
  });
});
