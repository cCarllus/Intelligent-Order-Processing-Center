export type OrderItem = {
  produto: string;
  quantidade: number;
  unidade: string | null;
};

export type Order = {
  id: number;
  textoOriginal: string;
  cliente: string | null;
  dataEntrega: string | null;
  itens: OrderItem[];
  criadoEm: string;
};

export type ApiResponse<T> = {
  data: T;
};

export type OrdersListResponse = {
  data: Order[];
  meta: {
    total: number;
  };
};

export type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: unknown;
  };
};
