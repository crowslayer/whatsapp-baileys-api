import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { ContainerBuilder, YamlFileLoader } from 'node-dependency-injection';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

type Environment = 'development' | 'production' | 'test' | 'staging';

export interface IDIContainerOptions {
  environment?: Environment;
  /** Ruta raíz del proyecto (donde reside el package.json) */
  rootPath?: string;
  /** Ruta relativa desde la raíz del proyecto hacia el directorio que contiene los YAML */
  configDir: string;
}

export class DIContainer {
  private static _instance: ContainerBuilder | null = null;
  private static _building: Promise<ContainerBuilder> | null = null;

  private constructor() {}

  public static async getInstance(options: IDIContainerOptions): Promise<ContainerBuilder> {
    if (DIContainer._instance) {
      return DIContainer._instance;
    }

    if (DIContainer._building) {
      return DIContainer._building;
    }

    DIContainer._building = DIContainer.build(options);
    DIContainer._instance = await DIContainer._building;
    DIContainer._building = null;

    return DIContainer._instance;
  }

  private static async build(options: IDIContainerOptions): Promise<ContainerBuilder> {
    const { rootPath, configDir } = options;

    const projectRoot = rootPath ?? resolve(join(_dirname, '../../../../'));

    const container = new ContainerBuilder(false, projectRoot);

    // Cargar configuración desde archivos YAML
    const loader = new YamlFileLoader(container);
    const yamlEntryPointPath = join(projectRoot, configDir);

    const configPath = yamlEntryPointPath;

    const service = options.environment ? options.environment : 'development';
    const serviceName = `application_${service}.yaml`;

    // Cargar servicios en orden de dependencias
    await loader.load(join(configPath, serviceName));

    // Compilar el contenedor
    await container.compile();

    return container;
  }

  public static reset(): void {
    DIContainer._instance = null;
    DIContainer._building = null;
  }
}
