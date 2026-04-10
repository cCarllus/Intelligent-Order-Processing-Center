export type ParsedOrderItem = {
  produto: string;
  quantidade: number;
  unidade: string | null;
};

export type ParsedOrder = {
  cliente: string;
  itens: ParsedOrderItem[];
  data_entrega: string | null;
};

type DatePattern = {
  regex: RegExp;
  offsetDays?: number;
};

const UNIT_ALIASES: Record<string, string> = {
  box: 'boxes',
  boxes: 'boxes',
  caixa: 'boxes',
  caixas: 'boxes',
  pack: 'packs',
  packs: 'packs',
  pacote: 'packs',
  pacotes: 'packs',
  bottle: 'bottles',
  bottles: 'bottles',
  garrafa: 'bottles',
  garrafas: 'bottles',
  unit: 'units',
  units: 'units',
  unidade: 'units',
  unidades: 'units',
};

const FILLER_PREFIX_REGEX =
  /^\s*(?:i want|please send|send|need|quero|preciso de|preciso|me veja|me envie)\s+/i;

const CUSTOMER_PATTERNS = [
  /\b(?:cliente|customer|nome)\s*[:=-]\s*([a-zà-ÿ][\p{L}\s'-]+)/iu,
  /\bmy name is\s+([a-zà-ÿ][\p{L}\s'-]+)/iu,
  /\bmeu nome é\s+([a-zà-ÿ][\p{L}\s'-]+)/iu,
];

const DATE_PATTERNS: DatePattern[] = [
  { regex: /\bday after tomorrow\b/i, offsetDays: 2 },
  { regex: /\bafter tomorrow\b/i, offsetDays: 2 },
  { regex: /\bdepois de amanh[aã]\b/i, offsetDays: 2 },
  { regex: /\btomorrow\b/i, offsetDays: 1 },
  { regex: /\bamanh[aã]\b/i, offsetDays: 1 },
  { regex: /\btoday\b/i, offsetDays: 0 },
  { regex: /\bhoje\b/i, offsetDays: 0 },
  { regex: /\b(\d{4}-\d{2}-\d{2})\b/ },
];

const DATE_CLEANUP_PATTERNS = [
  /\b(?:for delivery|delivery|deliver(?:y)?(?: on)?|para entrega|entrega(?: para)?)\b.*$/i,
  /\b(?:day after tomorrow|after tomorrow|tomorrow|today|depois de amanh[aã]|amanh[aã]|hoje)\b.*$/i,
];

const ITEM_JOINER_REGEX = /\b(?:and|e)\b\s*$/i;
const ITEM_START_REGEX = /\b\d+\b/g;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(baseDate: Date, days: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function parseCustomer(text: string): string {
  for (const pattern of CUSTOMER_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return normalizeWhitespace(match[1]);
    }
  }

  return 'unknown';
}

export function parseDate(text: string, baseDate: Date = new Date()): string | null {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (!match) {
      continue;
    }

    if (match[1]) {
      return match[1];
    }

    return formatDate(addDays(baseDate, pattern.offsetDays ?? 0));
  }

  return null;
}

function removeDateAndDeliveryHints(text: string): string {
  return DATE_CLEANUP_PATTERNS.reduce((currentText, pattern) => currentText.replace(pattern, ''), text);
}

function cleanupItemSegment(segment: string): string {
  return normalizeWhitespace(
    removeDateAndDeliveryHints(segment)
      .replace(FILLER_PREFIX_REGEX, '')
      .replace(ITEM_JOINER_REGEX, '')
      .replace(/[.,;:]+$/g, ''),
  );
}

function parseItemSegment(segment: string): ParsedOrderItem | null {
  const cleanedSegment = cleanupItemSegment(segment);
  if (!cleanedSegment) {
    return null;
  }

  const tokens = cleanedSegment.split(' ');
  const quantidade = Number.parseInt(tokens[0] ?? '', 10);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return null;
  }

  let cursor = 1;
  let unidade: string | null = null;

  const possibleUnit = normalizeToken(tokens[cursor] ?? '');
  if (possibleUnit && UNIT_ALIASES[possibleUnit]) {
    unidade = UNIT_ALIASES[possibleUnit];
    cursor += 1;
  }

  const connector = normalizeToken(tokens[cursor] ?? '');
  if (connector && ['of', 'de', 'do', 'da'].includes(connector)) {
    cursor += 1;
  }

  const produto = normalizeWhitespace(tokens.slice(cursor).join(' ')).toLowerCase();
  if (!produto) {
    return null;
  }

  return {
    produto,
    quantidade,
    unidade,
  };
}

export function parseItems(text: string): ParsedOrderItem[] {
  const matches = [...text.matchAll(ITEM_START_REGEX)];
  if (matches.length === 0) {
    return [];
  }

  const items: ParsedOrderItem[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index]?.index;
    if (start === undefined) {
      continue;
    }

    const end = matches[index + 1]?.index ?? text.length;
    const rawSegment = text.slice(start, end);
    const parsedItem = parseItemSegment(rawSegment);

    if (parsedItem) {
      items.push(parsedItem);
    }
  }

  return items;
}

export function parseOrder(text: string, baseDate: Date = new Date()): ParsedOrder {
  const normalizedText = normalizeWhitespace(text);

  return {
    cliente: parseCustomer(normalizedText),
    itens: parseItems(normalizedText),
    data_entrega: parseDate(normalizedText, baseDate),
  };
}
