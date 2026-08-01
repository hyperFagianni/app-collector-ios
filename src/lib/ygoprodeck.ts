import { ApiCard } from './types';

const BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

async function fetchCards(url: string): Promise<ApiCard[]> {
  const response = await fetch(url);
  if (response.status === 400) {
    // YGOPRODeck returns 400 with an error body when nothing matches the query.
    return [];
  }
  if (!response.ok) {
    throw new Error(`Richiesta carte fallita (${response.status})`);
  }
  const json = await response.json();
  return (json.data ?? []) as ApiCard[];
}

/**
 * Searches Italian localized names first (many cards have names that aren't a
 * literal translation of the English one), falling back to English for the
 * subset of cards YGOPRODeck hasn't translated yet.
 */
export async function searchCards(query: string): Promise<ApiCard[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const italianResults = await fetchCards(
    `${BASE_URL}?fname=${encodeURIComponent(trimmed)}&language=it`,
  );
  if (italianResults.length > 0) return italianResults;

  return fetchCards(`${BASE_URL}?fname=${encodeURIComponent(trimmed)}`);
}

export async function fetchCardById(id: string): Promise<ApiCard | null> {
  const italian = await fetchCards(`${BASE_URL}?id=${encodeURIComponent(id)}&language=it`);
  if (italian[0]) return italian[0];

  const fallback = await fetchCards(`${BASE_URL}?id=${encodeURIComponent(id)}`);
  return fallback[0] ?? null;
}

/**
 * Resolves a decklist line's card name (Italian or English, exact or slightly off)
 * to a single card: tries an exact match in both languages first (most reliable when
 * the name is correct), then falls back to fuzzy search and takes the closest hit.
 */
export async function resolveCardByName(name: string): Promise<ApiCard | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const exactIt = await fetchCards(`${BASE_URL}?name=${encodeURIComponent(trimmed)}&language=it`);
  if (exactIt[0]) return exactIt[0];

  const exactEn = await fetchCards(`${BASE_URL}?name=${encodeURIComponent(trimmed)}`);
  if (exactEn[0]) return exactEn[0];

  const fuzzy = await searchCards(trimmed);
  return fuzzy[0] ?? null;
}

export function getCardRarities(card: ApiCard): string[] {
  const rarities = new Set<string>();
  for (const set of card.card_sets ?? []) {
    if (set.set_rarity) rarities.add(set.set_rarity);
  }
  return Array.from(rarities).sort();
}

export function getCurrentPrice(card: ApiCard): number | null {
  const raw = card.card_prices?.[0]?.cardmarket_price;
  if (!raw) return null;
  const price = Number(raw);
  return Number.isFinite(price) && price > 0 ? price : null;
}
