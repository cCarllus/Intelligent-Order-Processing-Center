import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { createOrder, getOrders } from '../api/ordersApi';
import type { Order } from '../types/order';

vi.mock('../api/ordersApi', () => ({
  createOrder: vi.fn(),
  getOrders: vi.fn(),
}));

const mockedCreateOrder = vi.mocked(createOrder);
const mockedGetOrders = vi.mocked(getOrders);

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    textoOriginal: 'Cliente: Maria Oliveira. Quero 10 caixas de leite para entrega 2026-04-15',
    cliente: 'Maria Oliveira',
    dataEntrega: '2026-04-15',
    itens: [{ produto: 'leite', quantidade: 10, unidade: 'boxes' }],
    criadoEm: '2026-04-11T12:00:00.000Z',
    ...overrides,
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('renders the initial form shell and empty result state', async () => {
    mockedGetOrders.mockResolvedValueOnce([]);

    render(<App />);

    expect(screen.getByRole('heading', { name: /central simples para processar/i })).toBeInTheDocument();
    expect(screen.getByText(/a estrutura aparece aqui após o processamento/i)).toBeInTheDocument();
    expect(await screen.findByText(/nenhum pedido salvo ainda/i)).toBeInTheDocument();
  });

  it('loads and shows the orders list with selected order details', async () => {
    const firstOrder = buildOrder();
    const secondOrder = buildOrder({
      id: 2,
      cliente: 'Joao Souza',
      textoOriginal: 'Cliente: Joao Souza. Quero 2 garrafas de agua para entrega 2026-04-16',
      dataEntrega: '2026-04-16',
      itens: [{ produto: 'agua', quantidade: 2, unidade: 'bottles' }],
    });

    mockedGetOrders.mockResolvedValueOnce([secondOrder, firstOrder]);

    render(<App />);

    expect(await screen.findByText('Joao Souza')).toBeInTheDocument();
    expect(screen.getByText('Pedido #2')).toBeInTheDocument();
    expect(screen.getByText(/texto original/i)).toBeInTheDocument();
    expect(screen.getByText(/quero 2 garrafas de agua/i)).toBeInTheDocument();
  });

  it('submits a free-form order and shows the structured result', async () => {
    const user = userEvent.setup();
    const createdOrder = buildOrder();

    mockedGetOrders.mockResolvedValueOnce([]);
    mockedCreateOrder.mockResolvedValueOnce(createdOrder);

    render(<App />);

    const textarea = screen.getByLabelText(/texto do pedido/i);
    await user.type(
      textarea,
      'Cliente: Maria Oliveira. Quero 10 caixas de leite para entrega 2026-04-15',
    );
    await user.click(screen.getByRole('button', { name: /processar pedido/i }));

    await waitFor(() => {
      expect(mockedCreateOrder).toHaveBeenCalledWith(
        'Cliente: Maria Oliveira. Quero 10 caixas de leite para entrega 2026-04-15',
      );
    });

    expect((await screen.findAllByText('Pedido #1')).length).toBeGreaterThan(0);
    expect(screen.getByText(/json estruturado/i)).toBeInTheDocument();
    expect(screen.getAllByText('Maria Oliveira').length).toBeGreaterThan(0);
    expect(screen.getByText('leite')).toBeInTheDocument();
  });

  it('shows loading and error states for the orders list and allows retry', async () => {
    const user = userEvent.setup();
    const pendingOrders = createDeferred<Order[]>();

    mockedGetOrders
      .mockReturnValueOnce(pendingOrders.promise)
      .mockResolvedValueOnce([buildOrder({ cliente: 'Cliente Recuperado' })]);

    render(<App />);

    expect(screen.getByText(/carregando pedidos/i)).toBeInTheDocument();

    pendingOrders.reject(new Error('Falha ao carregar pedidos.'));

    expect(await screen.findByText('Falha ao carregar pedidos.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect((await screen.findAllByText('Cliente Recuperado')).length).toBeGreaterThan(0);
  });
});
