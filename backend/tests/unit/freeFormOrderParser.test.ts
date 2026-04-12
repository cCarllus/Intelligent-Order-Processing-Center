import { describe, expect, it } from 'vitest';

import {
  parseCustomer,
  parseDate,
  parseExplicitDate,
  parseItems,
  parseOrder,
} from '../../src/services/freeFormOrderParser';

describe('freeFormOrderParser', () => {
  const baseDate = new Date('2026-04-11T10:00:00Z');

  it('parses multiple items from a free-form order', () => {
    const parsed = parseOrder(
      'Cliente: Maria Oliveira\nQuero 10 caixas de leite e 5 pacotes de agua para entrega 2026-04-15',
      baseDate,
    );

    expect(parsed).toEqual({
      cliente: 'Maria Oliveira',
      data_entrega: '2026-04-15',
      itens: [
        { produto: 'leite', quantidade: 10, unidade: 'boxes' },
        { produto: 'agua', quantidade: 5, unidade: 'packs' },
      ],
    });
  });

  it('parses items with and without explicit units', () => {
    const items = parseItems('3 bananas e 2 caixas de leite');

    expect(items).toEqual([
      { produto: 'bananas', quantidade: 3, unidade: null },
      { produto: 'leite', quantidade: 2, unidade: 'boxes' },
    ]);
  });

  it('parses relative delivery dates deterministically', () => {
    expect(parseOrder('Preciso de 2 caixas de leite hoje', baseDate).data_entrega).toBe('2026-04-11');
    expect(parseOrder('Preciso de 2 caixas de leite amanha', baseDate).data_entrega).toBe(
      '2026-04-12',
    );
    expect(
      parseOrder('Preciso de 2 caixas de leite day after tomorrow', baseDate).data_entrega,
    ).toBe('2026-04-13');
  });

  it('parses supported explicit date formats into ISO', () => {
    expect(parseExplicitDate('Entrega em 11/02/2026')).toBe('2026-02-11');
    expect(parseExplicitDate('Entrega em 11-02-2026')).toBe('2026-02-11');
    expect(parseExplicitDate('Entrega em 2026-02-11')).toBe('2026-02-11');
  });

  it('ignores invalid or partial explicit dates', () => {
    expect(parseExplicitDate('Entrega em 32/13/2026')).toBeNull();
    expect(parseExplicitDate('Entrega em 31/02/2026')).toBeNull();
    expect(parseExplicitDate('Entrega em 29/02/2025')).toBeNull();
    expect(parseExplicitDate('Entrega em 11/02')).toBeNull();
    expect(parseExplicitDate('Entrega em 2026-2-11')).toBeNull();
  });

  it('prefers explicit dates over relative dates', () => {
    expect(parseDate('Entregar amanhã ou em 11/02/2026', baseDate)).toBe('2026-02-11');
    expect(parseDate('Deliver tomorrow on 2026-02-11', baseDate)).toBe('2026-02-11');
  });

  it('returns the first valid explicit date when multiple dates exist', () => {
    expect(parseExplicitDate('Datas: 32/01/2026, 11/02/2026 e 2026-03-12')).toBe('2026-02-11');
    expect(parseExplicitDate('Datas: 2026-03-12 e 11/02/2026')).toBe('2026-03-12');
  });

  it('returns no items for weak or invalid order text', () => {
    const parsed = parseOrder('Preciso disso urgente', baseDate);

    expect(parsed.itens).toEqual([]);
    expect(parsed.cliente).toBe('unknown');
    expect(parsed.data_entrega).toBeNull();
  });

  it('extracts customer names when identified in the text', () => {
    expect(parseCustomer('Meu nome é Joao Silva, preciso de 2 caixas de leite')).toBe('Joao Silva');
    expect(parseCustomer('customer: Jane Doe, send 3 bottles of water')).toBe('Jane Doe');
  });
});
