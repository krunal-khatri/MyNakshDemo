import { delay } from '../../mocks/delay';

export interface TarotCard {
  id: string;
  name: string;
}

const decks: Record<string, string[]> = {
  classic: [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
  ],
};

/** Mock Tarot API: owned by the Tarot experience, not by the runtime. */
export async function fetchDeck(deck: string): Promise<TarotCard[]> {
  await delay(400);
  const names = decks[deck];
  if (!names) {
    throw new Error(`Unknown tarot deck "${deck}"`);
  }
  return names.map((name, i) => ({ id: `${deck}-${i}`, name }));
}
