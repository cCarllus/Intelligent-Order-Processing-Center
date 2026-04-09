import { OrderRepository } from '../repositories/orderRepository';
import { type StoredOrder } from '../schemas/orderSchema';
import { AIExtractionService } from './aiExtractionService';

export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly aiExtractionService: AIExtractionService,
  ) {}

  async createFromText(orderText: string): Promise<StoredOrder> {
    const structuredOrder = await this.aiExtractionService.extract(orderText);
    return this.repository.create(orderText, structuredOrder);
  }

  list(): StoredOrder[] {
    return this.repository.findAll();
  }

  findById(id: number): StoredOrder | null {
    return this.repository.findById(id);
  }
}
