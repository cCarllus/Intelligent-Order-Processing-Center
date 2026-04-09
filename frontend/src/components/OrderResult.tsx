import type { Order, PaymentMethod } from '../types/order';

type OrderResultProps = {
  order: Order | null;
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

export function OrderResult({ order }: OrderResultProps) {
  if (!order) {
    return (
      <section className="result-panel empty-panel" aria-live="polite">
        <p className="eyebrow">Resultado</p>
        <h2>A estrutura aparece aqui após o processamento</h2>
        <p className="muted">
          Envie um pedido para visualizar o JSON interpretado, os itens identificados e o total.
        </p>
      </section>
    );
  }

  const { structuredData } = order;

  return (
    <section className="result-panel" aria-live="polite">
      <div className="section-heading inline">
        <div>
          <p className="eyebrow">Último processamento</p>
          <h2>Pedido #{order.id}</h2>
        </div>
        <p className="stamp">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
      </div>

      <div className="detail-grid">
        <div>
          <span className="detail-label">Cliente</span>
          <strong>{structuredData.customerName ?? 'Não informado'}</strong>
        </div>
        <div>
          <span className="detail-label">Pagamento</span>
          <strong>
            {structuredData.paymentMethod ? paymentLabels[structuredData.paymentMethod] : 'Não informado'}
          </strong>
        </div>
        <div>
          <span className="detail-label">Entrega</span>
          <strong>{structuredData.deliveryAddress ?? 'Não informado'}</strong>
        </div>
        <div>
          <span className="detail-label">Total</span>
          <strong>{formatMoney(structuredData.totalAmount)}</strong>
        </div>
      </div>

      <div className="items-table" role="table" aria-label="Itens do pedido">
        <div className="items-row items-head" role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Qtd.</span>
          <span role="columnheader">Unit.</span>
          <span role="columnheader">Linha</span>
        </div>
        {structuredData.items.map((item, index) => (
          <div className="items-row" role="row" key={`${item.name}-${index}`}>
            <span role="cell">{item.name}</span>
            <span role="cell">{item.quantity}</span>
            <span role="cell">{formatMoney(item.unitPrice)}</span>
            <span role="cell">{formatMoney(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="json-preview">
        <span className="detail-label">JSON estruturado</span>
        <pre>{JSON.stringify(structuredData, null, 2)}</pre>
      </div>
    </section>
  );
}
