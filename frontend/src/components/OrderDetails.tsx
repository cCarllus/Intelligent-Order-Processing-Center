import type { Order } from '../types/order';

type OrderDetailsProps = {
  order: Order | null;
  isLoading: boolean;
};

export function OrderDetails({ order, isLoading }: OrderDetailsProps) {
  if (isLoading) {
    return (
      <aside className="inspector-panel">
        <p className="eyebrow">Detalhes</p>
        <h2>Carregando pedido...</h2>
      </aside>
    );
  }

  if (!order) {
    return (
      <aside className="inspector-panel">
        <p className="eyebrow">Detalhes</p>
        <h2>Selecione um pedido</h2>
        <p className="muted">A inspeção completa do texto original fica disponível aqui.</p>
      </aside>
    );
  }

  return (
    <aside className="inspector-panel">
      <div className="section-heading">
        <p className="eyebrow">Detalhes</p>
        <h2>Pedido #{order.id}</h2>
      </div>

      <dl className="inspector-meta">
        <div>
          <dt>Cliente</dt>
          <dd>{order.cliente ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>{order.dataEntrega ?? 'Não informada'}</dd>
        </div>
        <div>
          <dt>Itens</dt>
          <dd>{order.itens.length}</dd>
        </div>
      </dl>

      <div className="original-text">
        <span className="detail-label">Texto original</span>
        <pre>{order.textoOriginal}</pre>
      </div>
    </aside>
  );
}
