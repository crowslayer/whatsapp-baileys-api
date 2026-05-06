import { IFlow } from '@application/bot/types/FlowTypes';

export class FlowTriggerResolver {
  resolve(flows: IFlow[], message: string): IFlow | null {
    const normalized = message.trim().toLowerCase();

    for (const flow of flows) {
      for (const trigger of flow.triggers ?? []) {
        if (trigger.type === 'keyword' && normalized === trigger.value.toLowerCase()) {
          return flow;
        }

        if (trigger.type === 'contains' && normalized.includes(trigger.value.toLowerCase())) {
          return flow;
        }
      }
    }

    return null;
  }
}
