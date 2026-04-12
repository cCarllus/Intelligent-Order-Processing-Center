import { HttpError } from '../errors/httpError';
import { OrderRepository } from '../repositories/orderRepository';
import { parsedOrderSchema, type ParsedOrderData, type StoredOrder } from '../schemas/orderSchema';
import type { OrderParser } from './orderParser';

export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly orderParser: OrderParser,
  ) {}

  private async normalizeParsedOrder(orderText: string): Promise<ParsedOrderData> {
    const parsedOrder = await this.orderParser.parse(orderText);
    const cliente = parsedOrder.cliente === 'unknown' ? null : parsedOrder.cliente;

    if (parsedOrder.itens.length === 0) {
      throw new HttpError(422, 'Não foi possível identificar itens no pedido.');
    }

    return parsedOrderSchema.parse({
      cliente,
      dataEntrega: parsedOrder.data_entrega,
      itens: parsedOrder.itens,
    });
  }

  async createFromText(orderText: string): Promise<StoredOrder> {
    const parsedOrder = await this.normalizeParsedOrder(orderText);

    return this.repository.create({
      textoOriginal: orderText,
      ...parsedOrder,
    });
  }

  list(): StoredOrder[] {
    return this.repository.findAll();
  }

  findById(id: number): StoredOrder | null {
    return this.repository.findById(id);
  }
}
