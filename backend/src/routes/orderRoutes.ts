import { Router } from 'express';

import { OrderController } from '../controllers/orderController';

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.post('/pedido', orderController.createOrder);
  router.get('/pedidos', orderController.listOrders);
  router.get('/pedido/:id', orderController.getOrderById);

  return router;
}
