# Smart Order Processing Center

Full-stack technical assignment with:

- `backend/`: Node.js + Express + SQLite
- `frontend/`: React + Vite
- rule-based parsing of structured order data from free-form text

## Requirements

- Node.js 24+ recommended

## Run the backend

```bash
cd /Users/carllosintfpc/Documents/teste/backend
cp .env.example .env
npm install
npm run dev
```

The backend starts on `http://localhost:3001`.

Environment variables:

- `PORT`: defaults to `3001`
- `FRONTEND_URL`: defaults to `http://localhost:5173`
- `DATABASE_PATH`: defaults to `./data/orders.db`

## Run the frontend

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

If needed, set `VITE_API_URL` to point to another backend URL.

## API

- `POST /pedido`
- `GET /pedidos`
- `GET /pedido/:id`

Example payload for `POST /pedido`:

```json
{
  "texto": "Cliente: Maria Oliveira\nQuero 10 caixas de leite e 5 pacotes de água para entrega amanhã"
}
```

## Architecture

- `routes -> controller -> service -> repository -> SQLite`
- `orderService` centralizes parser integration and validation
- `OrderRepository` persists `orders` and `order_items` in SQLite
- The original text is stored together with the parsed structure for traceability

## Notes

- The parser output is intentionally simple: customer, delivery date, and identified items.
- The backend returns a consistent `{ "data": ... }` envelope on success and `{ "error": ... }` on failures.
