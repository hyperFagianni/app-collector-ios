import { Category, Collection, Deck, OwnedCard } from './types';

function compareItalian(a: string, b: string): number {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

const CATEGORY_ORDER: Category[] = [
  'Synchro',
  'Fusione',
  'XYZ',
  'Link',
  'Mostri',
  'Magie',
  'Trappole',
  'Altro',
];

/** Fixed, theme-independent label colors per category. */
export const CATEGORY_COLORS: Record<Category, string> = {
  Mostri: '#FFD400',
  Synchro: '#FFFFFF',
  Fusione: '#B23CE0',
  XYZ: '#000000',
  Link: '#4CAF6D',
  Magie: '#29B6F6',
  Trappole: '#D8B6FF',
  Altro: '#A9A6B8',
};

export function bucketCategory(type: string): Category {
  if (type.includes('Fusion')) return 'Fusione';
  if (type.includes('Synchro')) return 'Synchro';
  if (/xyz/i.test(type)) return 'XYZ';
  if (type.includes('Link')) return 'Link';
  if (type.includes('Monster')) return 'Mostri';
  if (type.includes('Spell')) return 'Magie';
  if (type.includes('Trap')) return 'Trappole';
  return 'Altro';
}

export type CardSection = {
  category: Category;
  data: OwnedCard[];
};

export function sortForHome(collection: Collection): CardSection[] {
  const buckets = new Map<Category, OwnedCard[]>();
  for (const card of Object.values(collection)) {
    const category = bucketCategory(card.type);
    if (!buckets.has(category)) buckets.set(category, []);
    buckets.get(category)!.push(card);
  }

  return CATEGORY_ORDER.filter((category) => buckets.has(category)).map((category) => ({
    category,
    data: buckets.get(category)!.sort((a, b) => compareItalian(a.name, b.name)),
  }));
}

export type DeckFormat = 'Tengu' | 'Edison' | 'Tutti';

const DECK_FORMAT_ORDER: DeckFormat[] = ['Tengu', 'Edison', 'Tutti'];

export function bucketDeckFormat(title: string): DeckFormat {
  const lower = title.toLowerCase();
  if (lower.includes('tengu')) return 'Tengu';
  if (lower.includes('edison')) return 'Edison';
  return 'Tutti';
}

export type DeckSectionGroup = {
  format: DeckFormat;
  data: Deck[];
};

export function sortDecksForList(decks: Deck[]): DeckSectionGroup[] {
  const buckets = new Map<DeckFormat, Deck[]>();
  for (const deck of decks) {
    const format = bucketDeckFormat(deck.title);
    if (!buckets.has(format)) buckets.set(format, []);
    buckets.get(format)!.push(deck);
  }

  return DECK_FORMAT_ORDER.filter((format) => buckets.has(format)).map((format) => ({
    format,
    data: buckets.get(format)!.sort((a, b) => compareItalian(a.title, b.title)),
  }));
}
