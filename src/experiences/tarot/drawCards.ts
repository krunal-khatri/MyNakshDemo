import type { TarotCard } from './tarotApi';

/** Draws up to `count` unique cards (partial Fisher–Yates on a copy; the deck is not mutated). */
export function drawCards(deck: TarotCard[], count: number): TarotCard[] {
  const cards = [...deck];
  const n = Math.min(count, cards.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (cards.length - i));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, n);
}
