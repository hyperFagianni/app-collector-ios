import { resolveCardByName } from './ygoprodeck';
import { DeckCardEntry, DeckSection, UnresolvedLine } from './types';

const LINE_PATTERN = /^(\d+)\s*x?\s+(.+)$/i;
const CONCURRENCY = 5;

type ParsedLine = { quantity: number; name: string };

function parseLines(text: string): ParsedLine[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(LINE_PATTERN);
      if (!match) return null;
      return { quantity: parseInt(match[1], 10), name: match[2].trim() };
    })
    .filter((entry): entry is ParsedLine => entry !== null);
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function resolveSectionText(
  section: DeckSection,
  text: string,
): Promise<{ entries: DeckCardEntry[]; unresolved: UnresolvedLine[] }> {
  const lines = parseLines(text);
  const entries: DeckCardEntry[] = [];
  const unresolved: UnresolvedLine[] = [];

  await mapWithConcurrency(lines, CONCURRENCY, async (line) => {
    const card = await resolveCardByName(line.name);
    if (!card) {
      unresolved.push({ section, raw: line.name });
      return;
    }
    entries.push({
      cardId: String(card.id),
      name: card.name,
      imageUrl: card.card_images[0]?.image_url ?? '',
      quantity: line.quantity,
    });
  });

  return { entries, unresolved };
}
