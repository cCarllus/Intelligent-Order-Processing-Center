import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { OrderController } from './controllers/orderController';
import { runMigrations } from './db/migrations';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { OrderRepository } from './repositories/orderRepository';
import { createOrderRoutes } from './routes/orderRoutes';
import { OrderService } from './services/orderService';
import { RuleBasedOrderParser } from './services/ruleBasedOrderParser';

type CreateAppOptions = {
  frontendUrl?: string;
  orderController?: OrderController;
};

function buildOrderController(): OrderController {
  runMigrations();
  const orderRepository = new OrderRepository();
  const orderParser = new RuleBasedOrderParser();
  const orderService = new OrderService(orderRepository, orderParser);
  return new OrderController(orderService);
}

export function createApp({
  frontendUrl = env.frontendUrl,
  orderController = buildOrderController(),
}: CreateAppOptions = {}) {
  const app = express();

  app.use(
    cors({
      origin: frontendUrl,
    }),
  );
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use(createOrderRoutes(orderController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
