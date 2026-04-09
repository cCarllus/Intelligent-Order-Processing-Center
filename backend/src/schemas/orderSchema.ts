import { z } from 'zod';

const nullableString = z.string().trim().min(1).nullable();
const nullableMoney = z.number().nonnegative().nullable();

export const lineItemSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  unitPrice: nullableMoney,
  lineTotal: nullableMoney,
});

export const structuredOrderSchema = z.object({
  customerName: nullableString,
  deliveryAddress: nullableString,
  paymentMethod: z
    .enum(['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'])
    .nullable(),
  notes: nullableString,
  totalAmount: nullableMoney,
  items: z.array(lineItemSchema).min(1),
});

export type StructuredOrder = z.infer<typeof structuredOrderSchema>;

export const storedOrderSchema = z.object({
  id: z.number().int().positive(),
  originalText: z.string(),
  structuredData: structuredOrderSchema,
  createdAt: z.string(),
});

export type StoredOrder = z.infer<typeof storedOrderSchema>;
