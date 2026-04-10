type OrderFormProps = {
  value: string;
  isSubmitting: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const SAMPLE_TEXT = `Cliente: Maria Oliveira
Quero 10 caixas de leite e 5 pacotes de água para entrega amanhã
`;

export function OrderForm({ value, isSubmitting, error, onChange, onSubmit }: OrderFormProps) {
  return (
    <section className="composer" aria-labelledby="composer-title">
      <div className="section-heading">
        <p className="eyebrow">Entrada livre</p>
        <h2 id="composer-title">Receba pedidos em texto e estruture no servidor</h2>
      </div>

      <p className="muted">
        O backend usa o parser local para transformar texto livre em cliente, data de entrega e
        itens estruturados.
      </p>

      <textarea
        className="order-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={SAMPLE_TEXT}
        aria-label="Texto do pedido"
      />

      <div className="composer-actions">
        <button className="primary-button" type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Processar pedido'}
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={() => onChange(SAMPLE_TEXT)}
          disabled={isSubmitting}
        >
          Carregar exemplo
        </button>
      </div>

      {error ? <p className="feedback error">{error}</p> : null}
    </section>
  );
}
