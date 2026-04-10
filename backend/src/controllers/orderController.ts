import { Request, Response, NextFunction } from 'express';

import { createOrderRequestSchema, orderIdParamSchema } from '../schemas/requestSchema';
import { OrderService } from '../services/orderService';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { texto } = createOrderRequestSchema.parse(request.body);
      const order = await this.orderService.createFromText(texto);
      response.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  };

  listOrders = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = this.orderService.list();
      response.json({
        data: orders,
        meta: {
          total: orders.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = orderIdParamSchema.parse(request.params);
      const order = this.orderService.findById(id);

      if (!order) {
        response.status(404).json({
          error: {
            message: 'Pedido não encontrado.',
          },
        });
        return;
      }

      response.json({ data: order });
    } catch (error) {
      next(error);
    }
  };
}
