import { beforeEach, describe, expect, it, vi } from 'vitest';
import { join } from 'node:path';

const diMock = vi.hoisted(() => {
  const load = vi.fn(async (_path: string) => undefined);
  const compile = vi.fn(async () => undefined);

  class ContainerBuilder {
    static readonly instances: ContainerBuilder[] = [];

    constructor(
      public readonly autoRegister: boolean,
      public readonly rootPath: string
    ) {
      ContainerBuilder.instances.push(this);
    }

    async compile(): Promise<void> {
      await compile();
    }
  }

  class YamlFileLoader {
    static readonly instances: YamlFileLoader[] = [];

    constructor(public readonly container: ContainerBuilder) {
      YamlFileLoader.instances.push(this);
    }

    async load(path: string): Promise<void> {
      await load(path);
    }
  }

  return { ContainerBuilder, YamlFileLoader, load, compile };
});

vi.mock('node-dependency-injection', () => ({
  ContainerBuilder: diMock.ContainerBuilder,
  YamlFileLoader: diMock.YamlFileLoader,
}));

import { DIContainer } from '@shared/infrastructure/container/Container';

describe('DIContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    diMock.ContainerBuilder.instances.length = 0;
    diMock.YamlFileLoader.instances.length = 0;
    DIContainer.reset();
  });

  it('builds a container with the yaml loader for the given configuration', async () => {
    const container = await DIContainer.getInstance({
      rootPath: '/root',
      configDir: 'config',
    });

    expect(container).toBeInstanceOf(diMock.ContainerBuilder);
    expect(diMock.YamlFileLoader.instances).toHaveLength(1);
    expect(diMock.YamlFileLoader.instances[0].container).toBe(container);
  });

  it('loads the yaml file matching the requested environment', async () => {
    await DIContainer.getInstance({
      rootPath: '/root',
      configDir: 'config',
      environment: 'production',
    });

    expect(diMock.load).toHaveBeenCalledWith(join('/root', 'config', 'application_production.yaml'));
  });

  it('defaults to the development environment', async () => {
    await DIContainer.getInstance({
      rootPath: '/root',
      configDir: 'config',
    });

    expect(diMock.load).toHaveBeenCalledWith(join('/root', 'config', 'application_development.yaml'));
  });

  it('supports every known environment', async () => {
    const environments = ['development', 'production', 'test', 'staging'] as const;

    for (const environment of environments) {
      DIContainer.reset();
      await DIContainer.getInstance({ rootPath: '/root', configDir: 'config', environment });
    }

    expect(diMock.load).toHaveBeenCalledWith(join('/root', 'config', 'application_test.yaml'));
    expect(diMock.load).toHaveBeenCalledWith(join('/root', 'config', 'application_staging.yaml'));
  });

  it('compiles the container after loading the configuration', async () => {
    await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    expect(diMock.compile).toHaveBeenCalledTimes(1);
  });

  it('creates the container builder in non auto-register mode with the project root', async () => {
    await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    expect(diMock.ContainerBuilder.instances[0].autoRegister).toBe(false);
    expect(diMock.ContainerBuilder.instances[0].rootPath).toBe('/root');
  });

  it('resolves the project root when it is not provided', async () => {
    await DIContainer.getInstance({ configDir: 'config' });

    expect(diMock.ContainerBuilder.instances[0].rootPath).toMatch(/src$/);
  });

  it('returns the same container instance on subsequent calls', async () => {
    const first = await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });
    const second = await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    expect(second).toBe(first);
    expect(diMock.ContainerBuilder.instances).toHaveLength(1);
  });

  it('shares the same building promise between concurrent calls', async () => {
    const first = DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });
    const second = DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.any(diMock.ContainerBuilder),
      expect.any(diMock.ContainerBuilder),
    ]);
    expect(diMock.ContainerBuilder.instances).toHaveLength(1);
  });

  it('builds a new container after a reset', async () => {
    const first = await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    DIContainer.reset();

    const second = await DIContainer.getInstance({ rootPath: '/root', configDir: 'config' });

    expect(second).not.toBe(first);
    expect(diMock.ContainerBuilder.instances).toHaveLength(2);
  });

  it('rejects when the configuration cannot be loaded', async () => {
    diMock.load.mockRejectedValueOnce(new Error('missing yaml'));

    await expect(
      DIContainer.getInstance({ rootPath: '/root', configDir: 'config' })
    ).rejects.toThrow('missing yaml');
  });
});
