# Testing

## Running Tests

```bash
pnpm test              # Run all tests
pnpm test:unit         # Run unit tests
pnpm test:integration  # Run integration tests (MongoDB)
pnpm test:coverage     # Run with coverage report
```

## Test Structure

| Directory              | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `tests/unit/`          | Unit tests for application services, controllers, value objects |
| `tests/application/`   | Application uses cases unit tests                               |
| `tests/domain/`        | Domain aggregate/entity unit tests                              |
| `tests/infrastrucure/` | Infrastructure unit tests                                       |
| `tests/shared/`        | Shared unit tests                                               |
| `tests/integration/`   | Integration tests (MongoDB with `mongodb-memory-server`)        |
| `tests/e2e/`           | End-to-end API tests (require running server)                   |
| `tests/helpers/`       | Shared mocks and utilities (e.g. `MockLogger`)                  |

## Conventions

- **Vitest 4.1.5** with globals enabled (`describe`, `test`, `expect`, `vi`)
- Use `vi.fn()` for mocks, `vi.spyOn()` for spies
- Create helper mocks in `tests/helpers/` for reusable patterns
- Domain tests go in `tests/domain/`; everything else goes in `tests/unit/`
- Integration tests for Mongo models share a single file to avoid `OverwriteModelError`
- Name test files after the module they test: `FlowAggregate.test.ts`, `CampaignAggregate.test.ts`

## Controller Validation Patterns

Controllers validate input at the start of `handle()`. If validation fails, a `ValidationError` is thrown and caught by the existing `try/catch`, which delegates to `next(error)`:

```ts
if (!participants || !Array.isArray(participants) || participants.length === 0) {
  throw new ValidationError([
    { field: 'participants', message: 'Participants must be a non-empty array' },
  ]);
}
```

Edge case tests assert that `next()` is called (and optionally check the error type):

```ts
test('should call next with error when participants is empty array', async () => {
  req.body = { participants: [] };
  await controller.handle(req as Request, res as Response, next);
  expect(next).toHaveBeenCalled();
});

test('should call next with ValidationError when name is empty', async () => {
  req.body = { instanceId: 'inst-1', name: '' };
  await controller.handle(req as Request, res as Response, next);
  expect(next.mock.calls[0][0].constructor.name).toBe('ValidationError');
});
```

## Coverage

```bash
pnpm test:coverage
```

Provider: `v8` | Reports: `text`, `lcov`, `html`

Coverage excludes config files, server entry point, and type declarations.
