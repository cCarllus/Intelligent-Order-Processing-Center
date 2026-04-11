# Smart Order Processing Center

Full-stack technical assignment for processing free-form purchase orders into structured data, storing them in SQLite, and exposing them through a simple API and React UI.

## Overview

The system accepts natural-language order text such as:

```text
Cliente: Maria Oliveira
Quero 10 caixas de leite e 5 pacotes de água para entrega amanhã
```

It parses the input into a structured order, persists the result, and allows the user to review previous orders.

### Main features

- Create an order from free-form text
- Parse customer, delivery date, and multiple items from a single sentence
- Persist orders and order items in SQLite
- List all saved orders
- View a single order by id
- Display the structured result immediately in the frontend
- Return consistent success and error response shapes

### Technologies used

- Backend: Node.js, Express, TypeScript, Zod, better-sqlite3
- Frontend: React, TypeScript, Vite
- Database: SQLite
- Parsing: custom rule-based parser using string normalization and regex patterns

## Running the project

### Prerequisites

- Node.js 24+ recommended
- npm

### 1. Backend

```bash
cd /Users/carllosintfpc/Documents/teste/backend
npm install
cp .env.example .env
npm run dev
```

Backend URL: `http://localhost:3001`

Available scripts:

```bash
npm run dev
npm run build
npm run start
```

### 2. Frontend

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL: `http://localhost:5173`

Available scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Environment variables

Backend `.env`:

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `PORT` | No | `3001` | Backend port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
| `DATABASE_PATH` | No | `./data/orders.db` | SQLite file path |
| `OPENAI_API_KEY` | No | empty | Present in config, not required for the current rule-based parser |
| `OPENAI_MODEL` | No | `gpt-5-mini` | Present in config, not required for the current rule-based parser |
| `USE_FAKE_AI` | No | `false` | Present in config, not required for the current rule-based parser |

Frontend `.env`:

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:3001` | Backend base URL |

### Quick demo flow

1. Start the backend
2. Start the frontend
3. Open `http://localhost:5173`
4. Submit a free-form order
5. Verify that:
   - the order is parsed and displayed
   - the order appears in the history list
   - the order can be viewed again from the stored data

## API summary

- `POST /pedido`
- `GET /pedidos`
- `GET /pedido/:id`

Success responses:

- `POST /pedido` -> `{ data: Order }`
- `GET /pedido/:id` -> `{ data: Order }`
- `GET /pedidos` -> `{ data: Order[], meta: { total } }`

Error responses:

- `{ error: { message, details? } }`

## Architecture

### Backend structure

The backend follows a simple layered flow:

- `routes`
  Defines the HTTP endpoints.
- `controller`
  Handles request/response concerns and delegates business logic.
- `service`
  Normalizes input, runs parsing, applies validation, and coordinates persistence.
- `repository`
  Encapsulates SQLite reads/writes and transaction logic.
- `parser`
  Extracts `cliente`, `data_entrega`, and `itens` from free-form text.

Relevant files:

- `backend/src/routes/orderRoutes.ts`
- `backend/src/controllers/orderController.ts`
- `backend/src/services/orderService.ts`
- `backend/src/services/freeFormOrderParser.ts`
- `backend/src/repositories/orderRepository.ts`
- `backend/src/db/migrations.ts`

### Frontend structure

The frontend is intentionally single-page and keeps state local to the main screen.

- `frontend/src/App.tsx`
  Coordinates loading, submission, selection, and error states.
- `frontend/src/components/OrderForm.tsx`
  Free-form text input and submit button.
- `frontend/src/components/OrderResult.tsx`
  Shows the latest parsed order returned by the API.
- `frontend/src/components/OrdersList.tsx`
  Shows previously created orders and loading/error states.
- `frontend/src/components/OrderDetails.tsx`
  Shows the selected order, including the original text.
- `frontend/src/api/ordersApi.ts`
  Small API layer for backend requests.
- `frontend/src/types/order.ts`
  Shared TypeScript types for API data.

### Data flow

1. The user enters a free-form order in the React form.
2. The frontend sends `POST /pedido` with `{ texto }`.
3. The backend validates the request body with Zod.
4. `OrderService` calls the parser and normalizes the result.
5. Parsed data is validated again against the stored order schema.
6. `OrderRepository` writes the order and items to SQLite inside a transaction.
7. The backend returns the created order.
8. The frontend renders the structured result and updates the local history list.
9. Existing orders are loaded with `GET /pedidos` and can be inspected individually in the UI.

## AI-assisted development

This section should be factual. Replace bracketed placeholders with the tools you actually used before submission.

### Tools used

- `[e.g. ChatGPT]`
- `[e.g. GitHub Copilot]`
- `[remove any tool that was not actually used]`

### Where AI was used

- Architecture exploration:
  Used to compare a simple layered backend structure and a minimal single-page frontend approach.
- Parsing logic:
  Used to brainstorm regex patterns, normalization steps, and edge-case examples for free-form orders.
- Backend boilerplate:
  Used to accelerate repetitive setup such as route/controller/service scaffolding, validation shape ideas, and error-handling structure.
- Frontend structure:
  Used to outline a small component tree, local state flow, and API client shape.

### How prompts evolved

- Initial prompts were broad and focused on overall architecture.
- Later prompts became specific to:
  - exact API response contracts
  - parser edge cases
  - SQLite persistence model
  - React component responsibilities
  - keeping the solution appropriate for a short technical assignment

### Where AI output was incomplete or incorrect

Examples of issues worth documenting if they happened in your workflow:

- overly generic boilerplate that did not match the project contract
- parser suggestions that failed on mixed Portuguese/English phrasing
- solutions that were more complex than necessary for the assignment scope
- inconsistent naming or response shapes
- frontend suggestions that introduced unnecessary state-management complexity

### What was manually corrected or improved

Examples to keep or adapt based on your actual process:

- aligned the implementation to the required API contract
- simplified the frontend to local state instead of adding extra libraries
- adjusted parser rules to better support the expected input format
- normalized naming and response formats across the stack
- refined error handling and validation messages

## Key technical decisions

### Why SQLite

- Very fast to set up for a technical assignment
- No external database service required
- Good fit for a small local system with relational data
- Easy to evaluate because the reviewer can run everything locally

### Why a rule-based parser instead of NLP

- The assignment scope is narrow and the expected entities are known
- A deterministic parser is easier to test, reason about, and explain
- It avoids dependence on external services and network calls
- It keeps the behavior stable for demo purposes

Trade-off:

- A rule-based parser is less flexible than a true NLP pipeline and requires explicit handling of new language patterns.

### Why the frontend is single-page with local state

- The UI has one primary workflow
- Global state would add complexity without clear benefit
- Local state keeps the code easy to read and easy to explain in an interview
- It is sufficient for the create/list/view scope of the assignment

### Time-based trade-offs

- Focused on end-to-end correctness over advanced UI polish
- Chose a deterministic parser over a more ambitious but less reliable approach
- Kept the frontend intentionally small instead of adding routing or global state
- Prioritized readable code and predictable behavior over extra abstractions

## Edge cases handled

- Invalid or empty input:
  request validation rejects incomplete payloads and returns structured errors
- Missing quantities:
  items without a valid positive integer quantity are ignored, and the request fails if no valid items remain
- Missing units:
  unit is optional and stored as `null` when not detected
- Relative date parsing:
  supports terms such as `today`, `tomorrow`, `day after tomorrow`, `hoje`, `amanhã`, and `depois de amanhã`
- Multiple items in one sentence:
  item parsing splits by repeated numeric item starts, allowing input such as `10 caixas de leite e 5 pacotes de água`
- Missing customer:
  if the parser cannot identify a customer name, the stored value is normalized to `null`

## Final review checklist

Before submission, verify:

- API responses are consistent across success and error cases
- naming is consistent across backend, frontend, and database mapping
- temporary logs, commented code, and debug helpers were removed
- unused files and leftover template assets were removed if they are not part of the final demo
- `.gitignore` covers `node_modules`, build output, `.env`, SQLite database files, and SQLite `-wal` / `-shm` files
- README instructions work from a clean clone
- backend and frontend both start successfully
- the happy path works end to end

## Suggestions before submission

- Fill in the AI section with the exact tools and examples from your real workflow. Do not claim tools you did not use.
- Add one screenshot or a short GIF to the README if the submission format allows it.
- Review `.gitignore` and include:
  - `backend/data/*.db-wal`
  - `backend/data/*.db-shm`
  - `.env` files
- Remove unused OpenAI-related config and dependencies if they are not part of the final delivered solution.
- Run a final smoke test:
  - backend starts
  - frontend starts
  - order creation works
  - order listing works
  - order details work

## Project structure

```text
backend/
  src/
    config/
    controllers/
    db/
    errors/
    middlewares/
    repositories/
    routes/
    schemas/
    services/
frontend/
  src/
    api/
    components/
    types/
```
