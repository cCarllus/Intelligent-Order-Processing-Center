import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';

import { createOrder, getOrderById, getOrders } from './api/ordersApi';
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingSelectedOrder, setIsLoadingSelectedOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);

  const loadOrders = useEffectEvent(async () => {
    try {
      setPageError(null);
      const nextOrders = await getOrders();
      setOrders(nextOrders);

      if (!selectedOrderId && nextOrders[0]) {
        setSelectedOrderId(nextOrders[0].id);
        setSelectedOrder(nextOrders[0]);
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Falha ao carregar pedidos.');
    } finally {
      setIsLoadingOrders(false);
    }
  });

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    const localOrder = orders.find((order) => order.id === selectedOrderId);
    if (localOrder) {
      setSelectedOrder(localOrder);
    }

    let cancelled = false;

    const run = async () => {
      try {
        setIsLoadingSelectedOrder(true);
        const order = await getOrderById(selectedOrderId);
        if (!cancelled) {
          setSelectedOrder(order);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : 'Falha ao carregar o pedido.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSelectedOrder(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const haystack = [
        order.structuredData.customerName,
        order.structuredData.deliveryAddress,
        ...order.structuredData.items.map((item) => item.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearch, orders]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdOrder = await createOrder(orderText);
      setLatestOrder(createdOrder);
      setSelectedOrderId(createdOrder.id);
      setSelectedOrder(createdOrder);
      setOrderText('');

      startTransition(() => {
        void loadOrders();
      });
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
          React + Vite no frontend, Express + SQLite no backend e extração estruturada via AI.
        </p>
      </header>

      {pageError ? <p className="feedback error">{pageError}</p> : null}

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
            orders={filteredOrders}
            selectedOrderId={selectedOrderId}
            search={search}
            onSearchChange={setSearch}
            onSelect={setSelectedOrderId}
          />
          <OrderDetails order={selectedOrder} isLoading={isLoadingOrders || isLoadingSelectedOrder} />
        </div>
      </section>
    </main>
  );
}

export default App;
