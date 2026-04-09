export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'other'
  | null;

export type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type StructuredOrder = {
  customerName: string | null;
  deliveryAddress: string | null;
  paymentMethod: PaymentMethod;
  notes: string | null;
  totalAmount: number | null;
  items: LineItem[];
};

export type Order = {
  id: number;
  originalText: string;
  structuredData: StructuredOrder;
  createdAt: string;
};
