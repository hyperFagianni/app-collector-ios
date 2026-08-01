import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeScheme } from '@/constants/theme';
import { Collection, Deck, OwnedCard, PriceSnapshot } from './types';

const COLLECTION_KEY = 'collection';
const THEME_KEY = 'themePreference';
const DECKS_KEY = 'decks';
const historyKey = (cardId: string) => `history:${cardId}`;

export async function getThemePreference(): Promise<ThemeScheme | null> {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export async function saveThemePreference(scheme: ThemeScheme): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, scheme);
}

export async function getCollection(): Promise<Collection> {
  const raw = await AsyncStorage.getItem(COLLECTION_KEY);
  return raw ? (JSON.parse(raw) as Collection) : {};
}

async function saveCollection(collection: Collection): Promise<void> {
  await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
}

function totalCopies(card: OwnedCard): number {
  return Object.values(card.rarities).reduce((sum, qty) => sum + qty, 0);
}

/** Merges rarity quantities into the card, creating it if new. Used by the "Fine" add flow. */
export async function upsertCardRarities(
  meta: Pick<OwnedCard, 'id' | 'name' | 'type' | 'imageUrl'>,
  rarityQuantities: Record<string, number>,
): Promise<void> {
  const collection = await getCollection();
  const existing = collection[meta.id];
  const rarities = { ...existing?.rarities };
  for (const [rarity, qty] of Object.entries(rarityQuantities)) {
    if (qty > 0) rarities[rarity] = (rarities[rarity] ?? 0) + qty;
  }
  collection[meta.id] = { ...meta, rarities };
  await saveCollection(collection);
}

/** Adjusts a single rarity's quantity by delta (+1/-1 stepper). Removes the card once every copy is gone. */
export async function adjustRarityCopies(
  cardId: string,
  rarity: string,
  delta: number,
): Promise<Collection> {
  const collection = await getCollection();
  const card = collection[cardId];
  if (!card) return collection;

  const nextQty = Math.max(0, (card.rarities[rarity] ?? 0) + delta);
  const rarities = { ...card.rarities };
  if (nextQty === 0) {
    delete rarities[rarity];
  } else {
    rarities[rarity] = nextQty;
  }

  const updated: OwnedCard = { ...card, rarities };
  if (totalCopies(updated) === 0) {
    delete collection[cardId];
  } else {
    collection[cardId] = updated;
  }
  await saveCollection(collection);
  return collection;
}

export async function getPriceHistory(cardId: string): Promise<PriceSnapshot[]> {
  const raw = await AsyncStorage.getItem(historyKey(cardId));
  return raw ? (JSON.parse(raw) as PriceSnapshot[]) : [];
}

/** Records today's price, replacing an existing snapshot from the same day instead of duplicating it. */
export async function appendPriceSnapshot(cardId: string, price: number): Promise<PriceSnapshot[]> {
  const history = await getPriceHistory(cardId);
  const today = new Date().toISOString().slice(0, 10);
  const withoutToday = history.filter((snapshot) => snapshot.date !== today);
  const updated = [...withoutToday, { date: today, price }];
  await AsyncStorage.setItem(historyKey(cardId), JSON.stringify(updated));
  return updated;
}

export async function getDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(DECKS_KEY);
  return raw ? (JSON.parse(raw) as Deck[]) : [];
}

async function saveDecks(decks: Deck[]): Promise<void> {
  await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

/** Creates or updates a deck (matched by id). */
export async function upsertDeck(deck: Deck): Promise<void> {
  const decks = await getDecks();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index === -1) {
    decks.push(deck);
  } else {
    decks[index] = deck;
  }
  await saveDecks(decks);
}

export async function deleteDeck(deckId: string): Promise<void> {
  const decks = await getDecks();
  await saveDecks(decks.filter((d) => d.id !== deckId));
}

export async function setDeckOwnedFlags(
  deckId: string,
  ownedFlags: Record<string, boolean>,
): Promise<void> {
  const decks = await getDecks();
  const index = decks.findIndex((d) => d.id === deckId);
  if (index === -1) return;
  decks[index] = { ...decks[index], ownedFlags };
  await saveDecks(decks);
}
