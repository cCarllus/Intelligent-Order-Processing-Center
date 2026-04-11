import Database from 'better-sqlite3';

import { db } from '../db/connection';
import { storedOrderSchema, type ParsedOrderData, type StoredOrder } from '../schemas/orderSchema';

type OrderRow = {
  id: number;
  original_text: string;
  customer_name: string | null;
  delivery_date: string | null;
  created_at: string;
};

type OrderItemRow = {
  product_name: string;
  quantity: number;
  unit: string | null;
};

type ColumnInfo = {
  name: string;
};

type NewOrder = ParsedOrderData & {
  textoOriginal: string;
};

function mapRow(row: OrderRow, itemRows: OrderItemRow[]): StoredOrder {
  return storedOrderSchema.parse({
    id: row.id,
    textoOriginal: row.original_text,
    cliente: row.customer_name,
    dataEntrega: row.delivery_date,
    itens: itemRows.map((itemRow) => ({
      produto: itemRow.product_name,
      quantidade: itemRow.quantity,
      unidade: itemRow.unit,
    })),
    criadoEm: row.created_at,
  });
}

export class OrderRepository {
  private readonly insertStatement: Database.Statement<any[]>;
  private readonly insertItemStatement: Database.Statement<any[]>;
  private readonly selectAllStatement: Database.Statement<any[]>;
  private readonly selectByIdStatement: Database.Statement<any[]>;
  private readonly selectItemsByOrderIdStatement: Database.Statement<any[]>;
  private readonly createTransaction: (order: NewOrder) => number;

  constructor(private readonly database: Database.Database = db) {
    const orderColumns = (this.database.prepare('PRAGMA table_info(orders)').all() as ColumnInfo[]).map(
      (column) => column.name,
    );
    const hasLegacyStructuredDataColumn = orderColumns.includes('structured_data');

    this.insertStatement = hasLegacyStructuredDataColumn
      ? this.database.prepare(`
          INSERT INTO orders (original_text, customer_name, delivery_date, structured_data)
          VALUES (@textoOriginal, @cliente, @dataEntrega, @structuredData)
        `)
      : this.database.prepare(`
          INSERT INTO orders (original_text, customer_name, delivery_date)
          VALUES (@textoOriginal, @cliente, @dataEntrega)
        `);

    this.insertItemStatement = this.database.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, unit)
      VALUES (@orderId, @produto, @quantidade, @unidade)
    `);

    this.selectAllStatement = this.database.prepare(`
      SELECT id, original_text, customer_name, delivery_date, created_at
      FROM orders
      ORDER BY datetime(created_at) DESC, id DESC
    `);

    this.selectByIdStatement = this.database.prepare(`
      SELECT id, original_text, customer_name, delivery_date, created_at
      FROM orders
      WHERE id = ?
    `);

    this.selectItemsByOrderIdStatement = this.database.prepare(`
      SELECT product_name, quantity, unit
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `);

    this.createTransaction = this.database.transaction((order: NewOrder): number => {
      const result = this.insertStatement.run({
        ...order,
        structuredData: JSON.stringify({
          cliente: order.cliente,
          data_entrega: order.dataEntrega,
          itens: order.itens,
        }),
      });
      const orderId = Number(result.lastInsertRowid);

      for (const item of order.itens) {
        this.insertItemStatement.run({
          orderId,
          ...item,
        });
      }

      return orderId;
    });
  }

  private loadItems(orderId: number): OrderItemRow[] {
    return this.selectItemsByOrderIdStatement.all(orderId) as OrderItemRow[];
  }

  create(order: NewOrder): StoredOrder {
    const orderId = this.createTransaction(order);
    const row = this.selectByIdStatement.get(orderId) as OrderRow | undefined;

    if (!row) {
      throw new Error('Failed to load created order.');
    }

    return mapRow(row, this.loadItems(row.id));
  }

  findAll(): StoredOrder[] {
    const rows = this.selectAllStatement.all() as OrderRow[];
    return rows.map((row) => mapRow(row, this.loadItems(row.id)));
  }

  findById(id: number): StoredOrder | null {
    const row = this.selectByIdStatement.get(id) as OrderRow | undefined;
    return row ? mapRow(row, this.loadItems(row.id)) : null;
  }
}
