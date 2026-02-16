import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { ContainerBuilder, YamlFileLoader } from 'node-dependency-injection';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export class DIContainer {
  private static _instance: ContainerBuilder | null = null;
  private static _building: Promise<ContainerBuilder> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<ContainerBuilder> {
    if (DIContainer._instance) {
      return DIContainer._instance;
    }
    if (DIContainer._building) {
      return DIContainer._building;
    }
    DIContainer._building = DIContainer.build();
    DIContainer._instance = await DIContainer._building;
    DIContainer._building = null;

    return DIContainer._instance;
  }

  private static async build(): Promise<ContainerBuilder> {
    const container = new ContainerBuilder();

    // Cargar configuración desde archivos YAML
    const loader = new YamlFileLoader(container);
    const configPath = join(_dirname, '../../config/services');

    // Cargar servicios en orden de dependencias
    await loader.load(join(configPath, 'parameters.yaml'));
    await loader.load(join(configPath, 'shared.yaml'));
    // await loader.load(join(configPath, 'domain.yaml'));
    await loader.load(join(configPath, 'application.yaml'));
    await loader.load(join(configPath, 'infrastructure.yaml'));
    await loader.load(join(configPath, 'http.yaml'));
    // Compilar el contenedor
    container.compile();

    return container;
  }

  public static reset(): void {
    DIContainer._instance = null;
    DIContainer._building = null;
  }
}

// Export singleton
export async function getContainer(): Promise<ContainerBuilder> {
  return DIContainer.getInstance();
}
