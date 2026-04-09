import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import { env } from '../config/env';
import { structuredOrderSchema, type StructuredOrder } from '../schemas/orderSchema';

const EXTRACTION_INSTRUCTIONS = `
Você recebe pedidos em texto livre em português.
Extraia apenas o que estiver claramente presente.
Regras obrigatórias:
- Responda apenas com JSON compatível com o schema fornecido.
- Não invente dados.
- Quando um campo não estiver informado, retorne null.
- "items" deve conter todos os itens identificáveis do pedido.
- quantity deve ser inteiro positivo.
- unitPrice e lineTotal devem ser números quando presentes, sem símbolo de moeda.
- totalAmount deve ser o total do pedido quando ele estiver explícito ou puder ser calculado com segurança.
- paymentMethod deve ser um de: pix, cash, credit_card, debit_card, bank_transfer, other.
- Mantenha nomes de itens e observações em português quando possível.
`.trim();

const pricePattern = /(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)/;
const itemLinePattern =
  /^(?:(\d+)\s*(?:x|un|und|unidade|unidades)?\s*)?(.+?)(?:\s+R\$\s*(\d+(?:[.,]\d{1,2})?))?$/i;

function toNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  return Number(value.replace(/\./g, '').replace(',', '.'));
}

function detectPaymentMethod(text: string): StructuredOrder['paymentMethod'] {
  const normalized = text.toLowerCase();

  if (normalized.includes('pix')) {
    return 'pix';
  }

  if (normalized.includes('dinheiro')) {
    return 'cash';
  }

  if (normalized.includes('cartão de crédito') || normalized.includes('cartao de credito')) {
    return 'credit_card';
  }

  if (normalized.includes('cartão de débito') || normalized.includes('cartao de debito')) {
    return 'debit_card';
  }

  if (normalized.includes('transferência') || normalized.includes('transferencia')) {
    return 'bank_transfer';
  }

  return null;
}

function extractLabelValue(text: string, labels: string[]): string | null {
  const lines = text.split(/\n+/);

  for (const line of lines) {
    const normalizedLine = line.trim();
    for (const label of labels) {
      const regex = new RegExp(`^${label}\\s*[:\\-]\\s*(.+)$`, 'i');
      const match = normalizedLine.match(regex);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }

  return null;
}

function buildFallbackStructure(orderText: string): StructuredOrder {
  const segments = orderText
    .split(/\n|;/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter(
      (segment) =>
        !/^(pedido)\s*[:\-]?$/i.test(segment) &&
        !/^(cliente|nome|endereço|endereco|entrega|pagamento|obs|observação|observacao)\s*[:\-]/i.test(
          segment,
        ),
    );

  const items = segments
    .map((segment) => {
      const normalizedSegment = segment.replace(/^[-*]\s*/, '');
      const match = normalizedSegment.match(itemLinePattern);
      if (!match) {
        return null;
      }

      const quantity = Number(match[1] ?? 1);
      const rawName = match[2]?.trim() ?? '';
      const name = rawName.replace(/\s+R\$\s*\d+(?:[.,]\d{1,2})?$/i, '').trim();
      const unitPrice = toNumber(match[3]);
      const lineTotal = unitPrice !== null ? Number((quantity * unitPrice).toFixed(2)) : null;

      if (!name || /^(cliente|nome|endereço|endereco|entrega|pagamento|obs)$/i.test(name)) {
        return null;
      }

      return {
        name,
        quantity,
        unitPrice,
        lineTotal,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) {
    items.push({
      name: 'Item não identificado',
      quantity: 1,
      unitPrice: null,
      lineTotal: null,
    });
  }

  const explicitTotalLine = segments.find((segment) => /total/i.test(segment));
  const explicitTotal = explicitTotalLine?.match(pricePattern);
  const calculatedTotal = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const totalAmount =
    toNumber(explicitTotal?.[1]) ?? (calculatedTotal > 0 ? Number(calculatedTotal.toFixed(2)) : null);

  return structuredOrderSchema.parse({
    customerName: extractLabelValue(orderText, ['cliente', 'nome']) ?? null,
    deliveryAddress:
      extractLabelValue(orderText, ['endereço', 'endereco', 'entrega']) ??
      extractLabelValue(orderText, ['rua', 'av', 'avenida']) ??
      null,
    paymentMethod: detectPaymentMethod(orderText),
    notes: extractLabelValue(orderText, ['obs', 'observação', 'observacao']) ?? null,
    totalAmount,
    items,
  });
}

export class AIExtractionService {
  private readonly client =
    env.openAiApiKey && !env.useFakeAi ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

  async extract(orderText: string): Promise<StructuredOrder> {
    if (!this.client) {
      return buildFallbackStructure(orderText);
    }

    const response = await this.client.responses.create({
      model: env.openAiModel,
      instructions: EXTRACTION_INSTRUCTIONS,
      input: orderText,
      text: {
        format: zodTextFormat(structuredOrderSchema, 'structured_order'),
      },
    });

    return structuredOrderSchema.parse(JSON.parse(response.output_text));
  }
}
