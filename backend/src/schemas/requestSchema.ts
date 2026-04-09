import { z } from 'zod';

export const createOrderRequestSchema = z.object({
  texto: z.string().trim().min(10, 'Informe um pedido com mais detalhes.'),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
