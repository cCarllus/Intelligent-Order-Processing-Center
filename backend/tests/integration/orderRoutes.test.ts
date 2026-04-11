import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestApp } from '../helpers/createTestApp';

describe('order routes', () => {
  let database: ReturnType<typeof createTestApp>['database'];
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    const testApp = createTestApp();
    database = testApp.database;
    app = testApp.app;
  });

  afterEach(() => {
    database.close();
  });

  it('creates an order with POST /pedido', async () => {
    const response = await request(app).post('/pedido').send({
      texto: 'Cliente: Maria Oliveira\nQuero 10 caixas de leite e 5 pacotes de agua para entrega 2026-04-15',
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 1,
      cliente: 'Maria Oliveira',
      dataEntrega: '2026-04-15',
      itens: [
        { produto: 'leite', quantidade: 10, unidade: 'boxes' },
        { produto: 'agua', quantidade: 5, unidade: 'packs' },
      ],
    });
  });

  it('rejects invalid payloads in POST /pedido', async () => {
    const response = await request(app).post('/pedido').send({
      texto: 'curto',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Dados inválidos.');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'texto',
        }),
      ]),
    );
  });

  it('lists stored orders with GET /pedidos', async () => {
    await request(app).post('/pedido').send({
      texto: 'Cliente: Maria Oliveira\nQuero 10 caixas de leite para entrega 2026-04-15',
    });
    await request(app).post('/pedido').send({
      texto: 'Cliente: Joao\nQuero 2 garrafas de agua para entrega 2026-04-16',
    });

    const response = await request(app).get('/pedidos');

    expect(response.status).toBe(200);
    expect(response.body.meta).toEqual({ total: 2 });
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      id: 2,
      cliente: 'Joao',
    });
  });

  it('returns a stored order with GET /pedido/:id', async () => {
    const createResponse = await request(app).post('/pedido').send({
      texto: 'Cliente: Maria Oliveira\nQuero 10 caixas de leite para entrega 2026-04-15',
    });

    const response = await request(app).get(`/pedido/${createResponse.body.data.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: createResponse.body.data.id,
      cliente: 'Maria Oliveira',
      itens: [{ produto: 'leite', quantidade: 10, unidade: 'boxes' }],
    });
  });

  it('returns 404 when GET /pedido/:id does not exist', async () => {
    const response = await request(app).get('/pedido/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: 'Pedido não encontrado.',
      },
    });
  });
});
