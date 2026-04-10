import type { Order } from '../types/order';

type OrderResultProps = {
  order: Order | null;
};

export function OrderResult({ order }: OrderResultProps) {
  if (!order) {
    return (
      <section className="result-panel empty-panel" aria-live="polite">
        <p className="eyebrow">Resultado</p>
        <h2>A estrutura aparece aqui após o processamento</h2>
        <p className="muted">
          Envie um pedido para visualizar os itens identificados e a estrutura persistida pelo
          backend.
        </p>
      </section>
    );
  }

  return (
    <section className="result-panel" aria-live="polite">
      <div className="section-heading inline">
        <div>
          <p className="eyebrow">Último processamento</p>
          <h2>Pedido #{order.id}</h2>
        </div>
        <p className="stamp">{new Date(order.criadoEm).toLocaleString('pt-BR')}</p>
      </div>

      <div className="detail-grid">
        <div>
          <span className="detail-label">Cliente</span>
          <strong>{order.cliente ?? 'Não informado'}</strong>
        </div>
        <div>
          <span className="detail-label">Entrega</span>
          <strong>{order.dataEntrega ?? 'Não informado'}</strong>
        </div>
      </div>

      <div className="items-table" role="table" aria-label="Itens do pedido">
        <div className="items-row items-head" role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Qtd.</span>
          <span role="columnheader">Unidade</span>
        </div>
        {order.itens.map((item, index) => (
          <div className="items-row" role="row" key={`${item.produto}-${index}`}>
            <span role="cell">{item.produto}</span>
            <span role="cell">{item.quantidade}</span>
            <span role="cell">{item.unidade ?? 'Não informada'}</span>
          </div>
        ))}
      </div>

      <div className="json-preview">
        <span className="detail-label">JSON estruturado</span>
        <pre>{JSON.stringify(order, null, 2)}</pre>
      </div>
    </section>
  );
}
