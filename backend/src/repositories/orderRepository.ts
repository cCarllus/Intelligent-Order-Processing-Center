import { db } from '../db/connection';
import { storedOrderSchema, type StoredOrder, type StructuredOrder } from '../schemas/orderSchema';

type OrderRow = {
  id: number;
  original_text: string;
  structured_data: string;
  created_at: string;
};

function mapRow(row: OrderRow): StoredOrder {
  return storedOrderSchema.parse({
    id: row.id,
    originalText: row.original_text,
    structuredData: JSON.parse(row.structured_data),
    createdAt: row.created_at,
  });
}

export class OrderRepository {
  private readonly insertStatement = db.prepare(`
    INSERT INTO orders (original_text, structured_data)
    VALUES (@originalText, @structuredData)
  `);

  private readonly selectAllStatement = db.prepare(`
    SELECT id, original_text, structured_data, created_at
    FROM orders
    ORDER BY datetime(created_at) DESC, id DESC
  `);

  private readonly selectByIdStatement = db.prepare(`
    SELECT id, original_text, structured_data, created_at
    FROM orders
    WHERE id = ?
  `);

  create(originalText: string, structuredData: StructuredOrder): StoredOrder {
    const result = this.insertStatement.run({
      originalText,
      structuredData: JSON.stringify(structuredData),
    });

    const row = this.selectByIdStatement.get(result.lastInsertRowid) as OrderRow | undefined;

    if (!row) {
      throw new Error('Failed to load created order.');
    }

    return mapRow(row);
  }

  findAll(): StoredOrder[] {
    const rows = this.selectAllStatement.all() as OrderRow[];
    return rows.map(mapRow);
  }

  findById(id: number): StoredOrder | null {
    const row = this.selectByIdStatement.get(id) as OrderRow | undefined;
    return row ? mapRow(row) : null;
  }
}
