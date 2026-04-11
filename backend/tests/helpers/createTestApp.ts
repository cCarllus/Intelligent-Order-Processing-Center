import type Database from 'better-sqlite3';

import { createApp } from '../../src/app';
import { OrderController } from '../../src/controllers/orderController';
import { createDatabaseConnection } from '../../src/db/createConnection';
import { runMigrations } from '../../src/db/migrations';
import { OrderRepository } from '../../src/repositories/orderRepository';
import { OrderService } from '../../src/services/orderService';

type TestApp = {
  app: ReturnType<typeof createApp>;
  database: Database.Database;
};

export function createTestApp(): TestApp {
  const database = createDatabaseConnection(':memory:');
  runMigrations(database);

  const repository = new OrderRepository(database);
  const service = new OrderService(repository);
  const controller = new OrderController(service);

  return {
    app: createApp({
      frontendUrl: 'http://localhost:5173',
      orderController: controller,
    }),
    database,
  };
}
