type OrderFormProps = {
  value: string;
  isSubmitting: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const SAMPLE_TEXT = `Cliente: Maria Oliveira
Pedido:
2x Pizza Margherita R$ 35,00
1 Refrigerante R$ 8,00
Endereço: Rua das Flores, 123 - Centro
Pagamento: pix
Obs: sem cebola
`;

export function OrderForm({ value, isSubmitting, error, onChange, onSubmit }: OrderFormProps) {
  return (
    <section className="composer" aria-labelledby="composer-title">
      <div className="section-heading">
        <p className="eyebrow">Entrada livre</p>
        <h2 id="composer-title">Receba pedidos em texto e estruture no servidor</h2>
      </div>

      <p className="muted">
        O fluxo foi pensado para revisão manual: o backend armazena o texto original junto com o
        JSON estruturado.
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
