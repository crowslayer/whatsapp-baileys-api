import { ContainerBuilder } from 'node-dependency-injection';

import { DIContainer, IDIContainerOptions } from '@shared/infrastructure/container/Container';

// Export singleton
export async function getContainer(options: IDIContainerOptions): Promise<ContainerBuilder> {
  return await DIContainer.getInstance(options);
}
