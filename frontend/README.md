# Smart Order Processing Center Frontend

Minimal React + TypeScript + Vite frontend for the assignment.

## Goal

The UI covers the core demo flow:

1. Type a free-form order
2. Send it to `POST /pedido`
3. Show the structured order returned by the backend
4. List previously created orders from `GET /pedidos`
5. Show loading and error states without extra libraries

## Frontend architecture

The app keeps state in a single screen component and pushes rendering into small presentational components.

- `src/App.tsx`
  Coordinates page state and async actions.
- `src/api/ordersApi.ts`
  Small API client for backend requests.
- `src/types/order.ts`
  Shared frontend types for API responses and orders.
- `src/components/OrderForm.tsx`
  Free-form text input and submit action.
- `src/components/OrderResult.tsx`
  Latest structured order returned after submission.
- `src/components/OrdersList.tsx`
  Previously saved orders with loading/error feedback.
- `src/components/OrderDetails.tsx`
  Details for the selected order, including the original text.

## State flow

- `orderText`
  Controlled textarea value.
- `isSubmitting` + `submitError`
  Handles the submission button and request feedback.
- `orders` + `isLoadingOrders` + `ordersError`
  Handles the historical list.
- `latestOrder`
  Stores the most recently created order for the result panel.
- `selectedOrderId`
  Tracks which order is highlighted in the history panel.

This keeps the explanation straightforward:

- on page load: fetch orders once
- on submit: call `POST /pedido`
- on success: show returned order, prepend it locally to the list, select it
- on click in history: swap the selected order in the details panel

## Local setup

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment

`VITE_API_URL` defaults to `http://localhost:3001`.

If your backend uses another port, change it in `.env`.
