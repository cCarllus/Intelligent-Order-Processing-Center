import { z } from 'zod';

const nullableString = z.string().trim().min(1).nullable();
const deliveryDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();

export const orderItemSchema = z.object({
  produto: z.string().trim().min(1),
  quantidade: z.number().int().positive(),
  unidade: nullableString,
});

export const parsedOrderSchema = z.object({
  cliente: nullableString,
  dataEntrega: deliveryDateSchema,
  itens: z.array(orderItemSchema).min(1),
});

export type ParsedOrderData = z.infer<typeof parsedOrderSchema>;

export const storedOrderSchema = z.object({
  id: z.number().int().positive(),
  textoOriginal: z.string().trim().min(1),
  cliente: nullableString,
  dataEntrega: deliveryDateSchema,
  itens: z.array(orderItemSchema).min(1),
  criadoEm: z.string(),
});

export type StoredOrder = z.infer<typeof storedOrderSchema>;
