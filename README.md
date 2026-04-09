# Smart Order Processing Center

Full-stack technical assignment with:

- `backend/`: Node.js + Express + SQLite
- `frontend/`: React + Vite
- AI-based extraction of structured order data from free-form text

## Requirements

- Node.js 24+ recommended
- An OpenAI API key for the real AI path

## Run the backend

```bash
cd /Users/carllosintfpc/Documents/teste/backend
cp .env.example .env
npm install
npm run dev
```

The backend starts on `http://localhost:3001`.

Environment variables:

- `OPENAI_API_KEY`: required for real AI extraction
- `OPENAI_MODEL`: defaults to `gpt-5-mini`
- `USE_FAKE_AI=true`: optional local fallback parser for demos without an API key

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
  "texto": "Cliente: Maria\n2x Pizza Margherita R$ 35,00\nEndereço: Rua das Flores, 123\nPagamento: pix"
}
```

## Architecture

- `routes -> controller -> service -> repository -> SQLite`
- `aiExtractionService` centralizes the LLM integration
- Both `original_text` and `structured_data` are stored for traceability and manual validation

## Notes

- The fallback parser exists only to keep the project runnable without an API key.
- The intended production/demo path is the OpenAI integration with structured JSON output.
