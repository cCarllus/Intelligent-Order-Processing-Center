import { useEffect, useMemo, useState } from 'react';

import { createOrder, getOrders } from './api/ordersApi';
import { OrderDetails } from './components/OrderDetails';
import { OrderForm } from './components/OrderForm';
import { OrderResult } from './components/OrderResult';
import { OrdersList } from './components/OrdersList';
import type { Order } from './types/order';
import './App.css';

function App() {
  const [orderText, setOrderText] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrderId || !orders[0]) {
      return;
    }

    setSelectedOrderId(orders[0].id);
  }, [orders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  async function loadOrders() {
    try {
      setOrdersError(null);
      const nextOrders = await getOrders();
      setOrders(nextOrders);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Falha ao carregar pedidos.');
    } finally {
      setIsLoadingOrders(false);
    }
  }

  const handleSubmit = async () => {
    const trimmedOrderText = orderText.trim();
    if (!trimmedOrderText) {
      setSubmitError('Digite um pedido antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdOrder = await createOrder(trimmedOrderText);
      setLatestOrder(createdOrder);
      setSelectedOrderId(createdOrder.id);
      setOrderText('');
      setOrders((currentOrders) => [createdOrder, ...currentOrders]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Falha ao processar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart Order Processing Center</p>
          <h1>Central simples para processar, armazenar e revisar pedidos livres</h1>
        </div>
        <p className="header-note">
          Interface simples para demonstrar envio, parsing e histórico de pedidos com o backend
          existente.
        </p>
      </header>

      <section className="workspace">
        <div className="workspace-main">
          <OrderForm
            value={orderText}
            isSubmitting={isSubmitting}
            error={submitError}
            onChange={setOrderText}
            onSubmit={handleSubmit}
          />
          <OrderResult order={latestOrder} />
        </div>

        <div className="workspace-side">
          <OrdersList
            orders={orders}
            error={ordersError}
            isLoading={isLoadingOrders}
            selectedOrderId={selectedOrderId}
            onRetry={loadOrders}
            onSelect={setSelectedOrderId}
          />
          <OrderDetails order={selectedOrder} isLoading={isLoadingOrders} />
        </div>
      </section>
    </main>
  );
}

export default App;
