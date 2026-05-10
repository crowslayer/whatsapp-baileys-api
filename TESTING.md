# Testing

## Running Tests

```bash
pnpm test              # Run all tests
pnpm test:unit         # Run unit tests
pnpm test:integration  # Run integration tests (MongoDB)
pnpm test:coverage     # Run with coverage report
```

## Test Structure

| Directory | Purpose |
|---|---|
| `tests/unit/` | Unit tests for application services, controllers, value objects |
| `tests/domain/` | Domain aggregate/entity unit tests |
| `tests/integration/` | Integration tests (MongoDB with `mongodb-memory-server`) |
| `tests/e2e/` | End-to-end API tests (require running server) |
| `tests/helpers/` | Shared mocks and utilities (e.g. `MockLogger`) |

## Conventions

- **Vitest 4.1.5** with globals enabled (`describe`, `test`, `expect`, `vi`)
- Use `vi.fn()` for mocks, `vi.spyOn()` for spies
- Create helper mocks in `tests/helpers/` for reusable patterns
- Domain tests go in `tests/domain/`; everything else goes in `tests/unit/`
- Integration tests for Mongo models share a single file to avoid `OverwriteModelError`
- Name test files after the module they test: `FlowAggregate.test.ts`, `CampaignAggregate.test.ts`

## Coverage

```bash
pnpm test:coverage
```

Provider: `v8` | Reports: `text`, `lcov`, `html`

Coverage excludes config files, server entry point, and type declarations.
