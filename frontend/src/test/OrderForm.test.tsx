import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrderForm } from '../components/OrderForm';

describe('OrderForm', () => {
  it('renders the main form controls', () => {
    render(
      <OrderForm
        value=""
        isSubmitting={false}
        error={null}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /receba pedidos em texto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/texto do pedido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /processar pedido/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /carregar exemplo/i })).toBeInTheDocument();
  });
});
