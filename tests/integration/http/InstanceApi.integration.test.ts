import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiTestApplication } from '../support/ApiTestApplication';
import { MongoTestDatabase } from '../support/MongoTestDatabase';

describe('Instance API integration', () => {
  const database = new MongoTestDatabase();
  const app = createApiTestApplication();
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await database.connect();
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 60_000);

  beforeEach(async () => {
    vi.clearAllMocks();
    await database.clear();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await database.disconnect();
  }, 60_000);

  it('creates, lists, retrieves, and deletes an instance through HTTP and MongoDB', async () => {
    // Arrange
    const payload = { name: 'P1 integration instance' };

    // Act
    const createResponse = await fetch(`${baseUrl}/instances`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const created = (await createResponse.json()) as {
      content: { instanceId: string; name: string; status: string };
    };
    const listResponse = await fetch(`${baseUrl}/instances`);
    const listed = (await listResponse.json()) as {
      content: Array<{ instanceId: string; name: string }>;
    };
    const getResponse = await fetch(`${baseUrl}/instances/${created.content.instanceId}`);
    const retrieved = (await getResponse.json()) as {
      content: { instanceId: string; name: string; status: string };
    };
    const deleteResponse = await fetch(`${baseUrl}/instances/${created.content.instanceId}`, {
      method: 'DELETE',
    });
    const listAfterDeleteResponse = await fetch(`${baseUrl}/instances`);
    const afterDelete = (await listAfterDeleteResponse.json()) as { content: unknown[] };

    // Assert
    expect(createResponse.status).toBe(201);
    expect(created.content).toMatchObject({ name: payload.name, status: 'disconnected' });
    expect(listResponse.status).toBe(200);
    expect(listed.content).toHaveLength(1);
    expect(getResponse.status).toBe(200);
    expect(retrieved.content).toMatchObject({
      instanceId: created.content.instanceId,
      name: payload.name,
    });
    expect(deleteResponse.status).toBe(204);
    expect(afterDelete.content).toHaveLength(0);
  });

  it('returns a 400 response for invalid creation input instead of leaving the request pending', async () => {
    // Arrange
    const payload = { name: '  ' };

    // Act
    const response = await fetch(`${baseUrl}/instances`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2_000),
    });
    const body = (await response.json()) as { success: boolean; status: number; errors: unknown[] };

    // Assert
    expect(response.status).toBe(400);
    expect(body).toMatchObject({ success: false, status: 400 });
    expect(body.errors.length).toBeGreaterThan(0);
  });
});
