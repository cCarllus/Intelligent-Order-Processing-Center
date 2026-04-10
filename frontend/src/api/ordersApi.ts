import type { ApiResponse, Order } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(payload?.error?.message ?? 'Request failed.');
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export async function createOrder(texto: string): Promise<Order> {
  const response = await fetch(`${API_URL}/pedido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto }),
  });

  return handleResponse<Order>(response);
}

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/pedidos`);
  return handleResponse<Order[]>(response);
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await fetch(`${API_URL}/pedido/${id}`);
  return handleResponse<Order>(response);
}
