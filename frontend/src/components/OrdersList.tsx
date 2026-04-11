import type { Order } from '../types/order';

type OrdersListProps = {
  orders: Order[];
  error: string | null;
  isLoading: boolean;
  selectedOrderId: number | null;
  onRetry: () => void;
  onSelect: (orderId: number) => void;
};

export function OrdersList({
  orders,
  error,
  isLoading,
  selectedOrderId,
  onRetry,
  onSelect,
}: OrdersListProps) {
  return (
    <section className="orders-panel" aria-labelledby="orders-title">
      <div className="section-heading inline">
        <div>
          <p className="eyebrow">Histórico</p>
          <h2 id="orders-title">Pedidos armazenados</h2>
        </div>
        <span className="counter-pill">{orders.length}</span>
      </div>

      <div className="orders-list">
        {isLoading ? (
          <p className="muted">Carregando pedidos...</p>
        ) : error ? (
          <div className="list-feedback">
            <p className="feedback error">{error}</p>
            <button className="ghost-button" type="button" onClick={onRetry}>
              Tentar novamente
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="muted">Nenhum pedido salvo ainda.</p>
        ) : (
          orders.map((order) => {
            const isSelected = order.id === selectedOrderId;

            return (
              <button
                className={`order-list-item ${isSelected ? 'selected' : ''}`}
                key={order.id}
                type="button"
                onClick={() => onSelect(order.id)}
              >
                <span className="order-list-main">
                  <strong>#{order.id}</strong>
                  <span>{order.cliente ?? 'Cliente não identificado'}</span>
                </span>
                <span className="order-list-meta">
                  <span>{order.itens.length} item(ns)</span>
                  <span>{new Date(order.criadoEm).toLocaleDateString('pt-BR')}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
