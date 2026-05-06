// Seed a sample flow into MongoDB (FlowModel)
import mongoose from 'mongoose';
import { FlowModel } from '../src/infrastructure/persistence/Mongo/Models/FlowModel';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-api';
  await mongoose.connect(uri);
  try {
    const flow = {
      flowId: crypto.randomUUID(),
      instanceId: 'default',
      name: 'Sales Flow',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: {
        start: {
          id: 'start',
          type: 'message',
          text: 'Hola 👋 ¿Qué deseas hacer?\n1. Comprar\n2. Soporte',
          next: 'option',
        },
        option: { id: 'option', type: 'input', variable: 'option', next: 'condition' },
        condition: {
          id: 'condition',
          type: 'condition',
          variable: 'option',
          equals: '1',
          ifTrue: 'buy',
          ifFalse: 'support',
        },
        buy: {
          id: 'buy',
          type: 'message',
          text: 'Perfecto 🛒 ¿Qué producto te interesa?',
          next: null,
        },
        support: {
          id: 'support',
          type: 'message',
          text: 'Te ayudo con soporte 🛠️ ¿Cuál es tu problema?',
          next: null,
        },
      },
      triggers: [{ type: 'contains', value: 'sales' }],
    } as any;

    await FlowModel.create(flow);
    console.log('Seeded flow sales in Mongo');
  } catch (e) {
    console.error('Error seeding flows:', e);
  } finally {
    await mongoose.disconnect();
  }
}

main();
