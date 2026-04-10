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
