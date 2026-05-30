import { InstanceConnectedEvent } from '@domain/events/InstanceConnectedEvent';

import { AnyDomainEventClass, IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class NotifyInstanceConnected implements IDomainEventSubscriber<InstanceConnectedEvent> {
  subscribedTo(): AnyDomainEventClass[] {
    return [InstanceConnectedEvent];
  }

  async on(event: InstanceConnectedEvent): Promise<void> {
    console.log(event.payload.instanceName);

    console.log(event.payload.phoneNumber);
  }
}
