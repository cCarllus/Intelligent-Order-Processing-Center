import { parseOrder, type ParsedOrder } from './freeFormOrderParser';
import type { OrderParser, OrderParserContext } from './orderParser';

export class RuleBasedOrderParser implements OrderParser {
  async parse(text: string, context: OrderParserContext = {}): Promise<ParsedOrder> {
    return parseOrder(text, context.baseDate);
  }
}
