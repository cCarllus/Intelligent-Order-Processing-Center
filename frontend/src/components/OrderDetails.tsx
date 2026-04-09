import type { Order, PaymentMethod } from '../types/order';

type OrderDetailsProps = {
  order: Order | null;
  isLoading: boolean;
};

const paymentLabels: Record<Exclude<PaymentMethod, null>, string> = {
  pix: 'Pix',
  cash: 'Dinheiro',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  bank_transfer: 'Transferência',
  other: 'Outro',
};

function formatMoney(value: number | null): string {
  if (value === null) {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

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
          <dd>{order.structuredData.customerName ?? 'Não informado'}</dd>
        </div>
        <div>
          <dt>Pagamento</dt>
          <dd>
            {order.structuredData.paymentMethod
              ? paymentLabels[order.structuredData.paymentMethod]
              : 'Não informado'}
          </dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMoney(order.structuredData.totalAmount)}</dd>
        </div>
      </dl>

      <div className="original-text">
        <span className="detail-label">Texto original</span>
        <pre>{order.originalText}</pre>
      </div>
    </aside>
  );
}
