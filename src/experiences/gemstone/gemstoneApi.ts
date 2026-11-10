import { delay } from '../../mocks/delay';
import { devFlags } from '../../mocks/devFlags';

export type RecommendationMode = 'personalized' | 'general';

export interface GemstoneRecommendation {
  stone: string;
  reason: string;
}

/** Mock Gemstone API. Fails by default (devFlags.gemstoneFails) to demo isolated failure. */
export async function fetchGemstoneRecommendation(
  mode: RecommendationMode,
): Promise<GemstoneRecommendation> {
  await delay(500);
  if (devFlags.gemstoneFails) {
    throw new Error('Gemstone service unavailable (503)');
  }
  return mode === 'personalized'
    ? { stone: 'Yellow Sapphire', reason: 'Strengthens Jupiter in your chart' }
    : { stone: 'Amethyst', reason: 'Supports calm and clarity' };
}
