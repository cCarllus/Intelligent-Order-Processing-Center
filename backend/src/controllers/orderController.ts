import { Request, Response, NextFunction } from 'express';

import { createOrderRequestSchema, orderIdParamSchema } from '../schemas/requestSchema';
import { OrderService } from '../services/orderService';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { texto } = createOrderRequestSchema.parse(request.body);
      const order = await this.orderService.createFromText(texto);
      response.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  listOrders = (_request: Request, response: Response): void => {
    const orders = this.orderService.list();
    response.json(orders);
  };

  getOrderById = (request: Request, response: Response): void => {
    const { id } = orderIdParamSchema.parse(request.params);
    const order = this.orderService.findById(id);

    if (!order) {
      response.status(404).json({ message: 'Pedido não encontrado.' });
      return;
    }

    response.json(order);
  };
}
