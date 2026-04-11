import type { ApiErrorResponse, ApiResponse, Order, OrdersListResponse } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(payload?.error?.message ?? 'Request failed.');
  }

  return (await response.json()) as ApiResponse<T>;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, init);
  return parseResponse<T>(response);
}

async function requestOrdersList(path: string): Promise<OrdersListResponse> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(payload?.error?.message ?? 'Request failed.');
  }

  return (await response.json()) as OrdersListResponse;
}

export async function createOrder(texto: string): Promise<Order> {
  const response = await request<Order>('/pedido', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto }),
  });

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await requestOrdersList('/pedidos');
  return response.data;
}
