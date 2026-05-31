import { Command } from '../../../../../src/shared/domain/commands/Command';
import { CommandHandlers } from '../../../../../src/shared/infrastructure/command-bus/CommandHandlers';
import { InMemoryCommandBus } from '../../../../../src/shared/infrastructure/command-bus/in-memory/InMemoryCommandBus';

class TestCommand extends Command<string> {
  constructor(readonly value: string) {
    super();
  }
}

class TestHandler {
  subscribedTo() {
    return TestCommand;
  }
  handle(cmd: TestCommand) {
    return `handled:${cmd.value}`;
  }
}

describe('InMemoryCommandBus', () => {
  test('should dispatch command to handler', async () => {
    const handler = new TestHandler();
    const handlers = new CommandHandlers([handler]);
    const bus = new InMemoryCommandBus(handlers);

    const result = await bus.dispatch(new TestCommand('hello'));
    expect(result).toBe('handled:hello');
  });

  test('should throw for unregistered command', async () => {
    const handlers = new CommandHandlers([]);
    const bus = new InMemoryCommandBus(handlers);

    await expect(bus.dispatch(new TestCommand('test'))).rejects.toThrow();
  });
});
