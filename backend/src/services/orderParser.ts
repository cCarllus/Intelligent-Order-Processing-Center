import type { ParsedOrder } from './freeFormOrderParser';

export type OrderParserContext = {
  baseDate?: Date;
};

export interface OrderParser {
  parse(text: string, context?: OrderParserContext): Promise<ParsedOrder>;
}
