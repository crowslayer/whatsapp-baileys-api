import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeEach, describe, expect, test } from 'vitest';
import { FlowModel } from '../../../src/infrastructure/persistence/mongo/models/FlowModel';
import { FlowSessionModel } from '../../../src/infrastructure/persistence/mongo/models/FlowSessionModel';

describe('FlowModel integration', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await FlowModel.deleteMany({});
  });

  test('should create and read a Flow document', async () => {
    const doc = await FlowModel.create({
      flowId: 'flow-test-001',
      instanceId: 'test-inst',
      name: 'Test Flow',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: {
        start: { id: 'start', type: 'message', text: 'Hello', next: null },
      },
      triggers: [],
    });
    expect(doc).toBeDefined();
    expect(doc.flowId).toBe('flow-test-001');
    expect(doc.name).toBe('Test Flow');
    expect(doc.isActive).toBe(true);
  });

  test('should find flows by instanceId and active status', async () => {
    await FlowModel.create({
      flowId: 'f1',
      instanceId: 'inst-x',
      name: 'F1',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Hi', next: null } },
      triggers: [],
    });
    await FlowModel.create({
      flowId: 'f2',
      instanceId: 'inst-x',
      name: 'F2',
      version: 1,
      isActive: false,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Hi', next: null } },
      triggers: [],
    });

    const active = await FlowModel.find({ instanceId: 'inst-x', isActive: true });
    expect(active).toHaveLength(1);
    expect(active[0].flowId).toBe('f1');
  });

  test('should find by flowId', async () => {
    await FlowModel.create({
      flowId: 'unique-flow',
      instanceId: 'inst-y',
      name: 'Unique',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Hi', next: null } },
      triggers: [{ type: 'keyword', value: 'hello' }],
    });

    const found = await FlowModel.findOne({ flowId: 'unique-flow' });
    expect(found).toBeDefined();
    expect(found!.triggers).toHaveLength(1);
    expect(found!.triggers![0].value).toBe('hello');
  });

  test('should update a Flow document', async () => {
    const doc = await FlowModel.create({
      flowId: 'flow-update',
      instanceId: 'inst-z',
      name: 'Original',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Old', next: null } },
      triggers: [],
    });

    doc.name = 'Updated';
    doc.version = 2;
    await doc.save();

    const found = await FlowModel.findById(doc._id);
    expect(found!.name).toBe('Updated');
    expect(found!.version).toBe(2);
  });

  test('should delete a Flow document', async () => {
    const doc = await FlowModel.create({
      flowId: 'flow-delete',
      instanceId: 'inst-del',
      name: 'Delete Me',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Bye', next: null } },
      triggers: [],
    });

    await FlowModel.findByIdAndDelete(doc._id);
    const found = await FlowModel.findOne({ flowId: 'flow-delete' });
    expect(found).toBeNull();
  });

  test('should query with lean for read repository pattern', async () => {
    await FlowModel.create({
      flowId: 'lean-flow',
      instanceId: 'inst-lean',
      name: 'Lean Flow',
      version: 1,
      isActive: true,
      start: 'start',
      nodes: { start: { id: 'start', type: 'message', text: 'Hi', next: null } },
      triggers: [{ type: 'keyword', value: 'test' }],
    });

    const docs = await FlowModel.find({ instanceId: 'inst-lean' }).sort({ createdAt: -1 }).lean();
    expect(docs).toHaveLength(1);
    expect(docs[0].name).toBe('Lean Flow');
    expect(docs[0].triggers).toBeDefined();
  });
});

describe('FlowSessionModel integration', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await FlowSessionModel.deleteMany({});
  });

  test('should create and read a FlowSession', async () => {
    const doc = await FlowSessionModel.create({
      instanceId: 'inst-1',
      chatId: 'chat-1',
      currentFlowId: 'flow-1',
      currentNodeId: 'node-1',
      variables: { color: 'red' },
    });
    expect(doc).toBeDefined();
    const found = await FlowSessionModel.findById(doc._id);
    expect(found?.instanceId).toBe('inst-1');
    expect(found?.currentFlowId).toBe('flow-1');
    expect(found?.variables).toEqual({ color: 'red' });
  });

  test('should find sessions by instance and chat', async () => {
    await FlowSessionModel.create({ instanceId: 'inst-1', chatId: 'chat-1', variables: {} });
    await FlowSessionModel.create({ instanceId: 'inst-1', chatId: 'chat-2', variables: {} });

    const found = await FlowSessionModel.findOne({ instanceId: 'inst-1', chatId: 'chat-1' });
    expect(found).toBeDefined();
    expect(found?.chatId).toBe('chat-1');
  });

  test('should update variables on a session', async () => {
    const doc = await FlowSessionModel.create({
      instanceId: 'inst-1',
      chatId: 'chat-u',
      variables: { a: 1 },
    });
    doc.variables = { a: 1, b: 2 };
    await doc.save();
    const updated = await FlowSessionModel.findById(doc._id);
    expect(updated?.variables).toEqual({ a: 1, b: 2 });
  });
});
