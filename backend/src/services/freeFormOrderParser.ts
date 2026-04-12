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

type ExplicitDatePattern = {
  regex: RegExp;
  extractor: (match: RegExpExecArray) => { day: number; month: number; year: number };
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
  /\b(?:cliente|customer|nome)\s*[:=-]\s*([^\n\r,;]+)/iu,
  /\bmy name is\s+([^\n\r,;]+)/iu,
  /\bmeu nome é\s+([^\n\r,;]+)/iu,
];

const DATE_PATTERNS: DatePattern[] = [
  { regex: /day after tomorrow/i, offsetDays: 2 },
  { regex: /after tomorrow/i, offsetDays: 2 },
  { regex: /depois de amanh[aã]/iu, offsetDays: 2 },
  { regex: /tomorrow/i, offsetDays: 1 },
  { regex: /amanh[aã]/iu, offsetDays: 1 },
  { regex: /today/i, offsetDays: 0 },
  { regex: /hoje/iu, offsetDays: 0 },
];

const EXPLICIT_DATE_PATTERNS: ExplicitDatePattern[] = [
  {
    regex: /(?:^|[^\p{L}\d])(\d{2})\/(\d{2})\/(\d{4})(?=$|[^\p{L}\d])/gu,
    extractor: (match) => ({
      day: Number.parseInt(match[1] ?? '', 10),
      month: Number.parseInt(match[2] ?? '', 10),
      year: Number.parseInt(match[3] ?? '', 10),
    }),
  },
  {
    regex: /(?:^|[^\p{L}\d])(\d{2})-(\d{2})-(\d{4})(?=$|[^\p{L}\d])/gu,
    extractor: (match) => ({
      day: Number.parseInt(match[1] ?? '', 10),
      month: Number.parseInt(match[2] ?? '', 10),
      year: Number.parseInt(match[3] ?? '', 10),
    }),
  },
  {
    regex: /(?:^|[^\p{L}\d])(\d{4})-(\d{2})-(\d{2})(?=$|[^\p{L}\d])/gu,
    extractor: (match) => ({
      year: Number.parseInt(match[1] ?? '', 10),
      month: Number.parseInt(match[2] ?? '', 10),
      day: Number.parseInt(match[3] ?? '', 10),
    }),
  },
];

const DATE_CLEANUP_PATTERNS = [
  /\b(?:for delivery|delivery|deliver(?:y)?(?: on)?|para entrega|entrega(?: para)?)\b.*$/i,
  /(?:day after tomorrow|after tomorrow|tomorrow|today|depois de amanh[aã]|amanh[aã]|hoje).*$/iu,
  /(?:\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2}).*$/u,
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

function isLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidExplicitDate(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }

  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  return day >= 1 && day <= getDaysInMonth(month, year);
}

function formatExplicitDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

export function parseExplicitDate(text: string): string | null {
  let firstValidMatch: { index: number; value: string } | null = null;

  for (const pattern of EXPLICIT_DATE_PATTERNS) {
    const regex = new RegExp(pattern.regex);

    for (const match of text.matchAll(regex)) {
      const fullMatch = match[0] ?? '';
      const dateText = fullMatch.trimStart();
      const index = (match.index ?? 0) + (fullMatch.length - dateText.length);
      const { day, month, year } = pattern.extractor(match);

      if (!isValidExplicitDate(day, month, year)) {
        continue;
      }

      const value = formatExplicitDate(year, month, day);
      if (!firstValidMatch || index < firstValidMatch.index) {
        firstValidMatch = { index, value };
      }
    }
  }

  return firstValidMatch?.value ?? null;
}

export function parseDate(text: string, baseDate: Date = new Date()): string | null {
  const explicitDate = parseExplicitDate(text);
  if (explicitDate) {
    return explicitDate;
  }

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
  const rawText = text.trim();
  const normalizedText = normalizeWhitespace(rawText);

  return {
    cliente: parseCustomer(rawText),
    itens: parseItems(normalizedText),
    data_entrega: parseDate(rawText, baseDate),
  };
}
