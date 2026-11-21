import { ContainerBuilder } from 'node-dependency-injection';

import { DIContainer, IDIContainerOptions } from '@shared/infrastructure/container/Container';

// Export singleton
export function getContainer(options: IDIContainerOptions): Promise<ContainerBuilder> {
  return DIContainer.getInstance(options);
}
