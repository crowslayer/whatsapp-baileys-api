import { IFlow } from '@application/services/bot/FlowTypes';

export class FlowTriggerResolver {
  resolve(flows: IFlow[], message: string): IFlow | null {
    for (const flow of flows) {
      for (const trigger of flow.triggers ?? []) {
        if (trigger.type === 'keyword' && message === trigger.value) {
          return flow;
        }

        if (trigger.type === 'contains' && message.includes(trigger.value)) {
          return flow;
        }
      }
    }

    return null;
  }
}
