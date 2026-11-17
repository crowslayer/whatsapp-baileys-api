import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class MongoTestDatabase {
  private _server?: MongoMemoryServer;

  async connect(): Promise<void> {
    this._server = await MongoMemoryServer.create();

    await mongoose.connect(this._server.getUri(`integration_${randomUUID().replace(/-/g, '')}`));

    await Promise.all(
      Object.values(mongoose.connection.models).map((model) => model.syncIndexes())
    );
  }

  async clear(): Promise<void> {
    const database = mongoose.connection.db;
    if (!database) {
      throw new Error('MongoDB test connection is not open');
    }

    const collections = await database.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  }

  async disconnect(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } finally {
      await this._server?.stop();
      this._server = undefined;
    }
  }
}
