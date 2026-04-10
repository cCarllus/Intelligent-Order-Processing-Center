import type { Order } from '../types/order';

type OrdersListProps = {
  orders: Order[];
  selectedOrderId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (orderId: number) => void;
};

export function OrdersList({
  orders,
  selectedOrderId,
  search,
  onSearchChange,
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

      <label className="search-field">
        <span>Buscar pedidos</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cliente ou item"
        />
      </label>

      <div className="orders-list">
        {orders.length === 0 ? (
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
