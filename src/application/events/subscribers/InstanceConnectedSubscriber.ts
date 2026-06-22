import { InstanceConnectedEvent } from '@domain/events/InstanceConnectedEvent';

import { NotifyInstanceConnected } from '@application/instances/connect/NotifyInstanceConnected';

import { AnyDomainEventClass, IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class InstanceConnectedSubscriber implements IDomainEventSubscriber<InstanceConnectedEvent> {
  constructor(private readonly connected: NotifyInstanceConnected) {}

  subscribedTo(): Array<AnyDomainEventClass> {
    return [InstanceConnectedEvent];
  }

  async on(event: InstanceConnectedEvent): Promise<void> {
    const data = event.payload;
    // store efímero
    await this.connected.execute(data);
  }
}
