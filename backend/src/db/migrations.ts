import { db } from './connection';

type ColumnInfo = {
  name: string;
};

type LegacyOrderRow = {
  id: number;
  structured_data: string | null;
};

function hasTable(tableName: string): boolean {
  const row = db
    .prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
      `,
    )
    .get(tableName);

  return Boolean(row);
}

function getColumns(tableName: string): string[] {
  if (!hasTable(tableName)) {
    return [];
  }

  return (db.prepare(`PRAGMA table_info(${tableName})`).all() as ColumnInfo[]).map((column) => column.name);
}

function addColumnIfMissing(tableName: string, columnName: string, definition: string): void {
  if (getColumns(tableName).includes(columnName)) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toPositiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function runLegacyBackfill(): void {
  const orderColumns = getColumns('orders');
  if (!orderColumns.includes('structured_data')) {
    return;
  }

  const legacyRows = db.prepare(`
    SELECT id, structured_data
    FROM orders
    WHERE structured_data IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM order_items
        WHERE order_items.order_id = orders.id
      )
  `);

  const updateOrderStatement = db.prepare(`
    UPDATE orders
    SET customer_name = COALESCE(customer_name, @cliente),
        delivery_date = COALESCE(delivery_date, @dataEntrega)
    WHERE id = @id
  `);

  const insertItemStatement = db.prepare(`
    INSERT INTO order_items (order_id, product_name, quantity, unit)
    VALUES (@orderId, @produto, @quantidade, @unidade)
  `);

  const backfill = db.transaction((rows: LegacyOrderRow[]) => {
    for (const row of rows) {
      if (!row.structured_data) {
        continue;
      }

      try {
        const payload = JSON.parse(row.structured_data) as Record<string, unknown>;
        const cliente = toNullableString(payload.customerName) ?? toNullableString(payload.cliente);
        const dataEntrega =
          toNullableString(payload.deliveryDate) ?? toNullableString(payload.data_entrega);

        updateOrderStatement.run({
          id: row.id,
          cliente,
          dataEntrega,
        });

        const rawItems = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.itens)
            ? payload.itens
            : [];

        for (const item of rawItems) {
          if (!item || typeof item !== 'object') {
            continue;
          }

          const itemData = item as Record<string, unknown>;
          const produto = toNullableString(itemData.produto) ?? toNullableString(itemData.name);
          const quantidade = toPositiveInteger(itemData.quantidade) ?? toPositiveInteger(itemData.quantity);
          const unidade = toNullableString(itemData.unidade) ?? toNullableString(itemData.unit);

          if (!produto || !quantidade) {
            continue;
          }

          insertItemStatement.run({
            orderId: row.id,
            produto,
            quantidade,
            unidade,
          });
        }
      } catch (error) {
        console.warn(`Skipping legacy order ${row.id} during backfill.`, error);
      }
    }
  });

  backfill(legacyRows.all() as LegacyOrderRow[]);
}

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_text TEXT NOT NULL,
      customer_name TEXT,
      delivery_date TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  addColumnIfMissing('orders', 'customer_name', 'TEXT');
  addColumnIfMissing('orders', 'delivery_date', 'TEXT');
  runLegacyBackfill();
}
