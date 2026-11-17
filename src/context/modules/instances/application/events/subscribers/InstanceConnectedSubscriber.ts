import { AnyEventClass, IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { NotifyInstanceConnected } from '@modules/instances/application/connect/NotifyInstanceConnected';
import { InstanceConnectedEvent } from '@modules/instances/domain/events/InstanceConnectedEvent';

export class InstanceConnectedSubscriber implements IEventSubscriber<InstanceConnectedEvent> {
  constructor(private readonly connected: NotifyInstanceConnected) {}

  subscribedTo(): Array<AnyEventClass> {
    return [InstanceConnectedEvent];
  }

  async on(event: InstanceConnectedEvent): Promise<void> {
    const data = event.payload;
    // store efímero
    await this.connected.execute(data);
  }
}
