import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { OrderController } from './controllers/orderController';
import { runMigrations } from './db/migrations';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { OrderRepository } from './repositories/orderRepository';
import { createOrderRoutes } from './routes/orderRoutes';
import { AIExtractionService } from './services/aiExtractionService';
import { OrderService } from './services/orderService';

runMigrations();

const orderRepository = new OrderRepository();
const aiExtractionService = new AIExtractionService();
const orderService = new OrderService(orderRepository, aiExtractionService);
const orderController = new OrderController(orderService);

export const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
  }),
);
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use(createOrderRoutes(orderController));

app.use(notFoundHandler);
app.use(errorHandler);
