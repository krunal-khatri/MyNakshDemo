import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import type { ConfigResult, ExperienceManifest, ExperienceProps } from '../../../runtime/types';
import { drawCards } from '../drawCards';
import { fetchDeck, TarotCard } from '../tarotApi';

/** v2 stub: a different config shape from v1 (named spread positions instead of maxCards). */
export interface TarotV2Config {
  deck: string;
  spread: string[];
}

export function validateTarotV2Config(raw: unknown): ConfigResult<TarotV2Config> {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'config must be an object' };
  }
  const { deck, spread } = raw as Record<string, unknown>;
  if (typeof deck !== 'string' || deck.length === 0) {
    return { ok: false, error: 'deck must be a non-empty string' };
  }
  const validSpread =
    Array.isArray(spread) &&
    spread.length >= 1 &&
    spread.length <= 10 &&
    spread.every(p => typeof p === 'string' && p.length > 0);
  if (!validSpread) {
    return { ok: false, error: 'spread must be a list of 1 to 10 position names' };
  }
  return { ok: true, config: { deck, spread } };
}

function TarotV2View({ config, data, complete }: ExperienceProps<TarotV2Config, TarotCard[]>) {
  const [drawn, setDrawn] = useState<TarotCard[]>([]);

  const draw = () => {
    setDrawn(drawCards(data, config.spread.length));
    complete();
  };

  return (
    <View>
      <Text>Tarot v2 (preview)</Text>
      {drawn.length === 0 ? (
        <Button title={`Draw ${config.spread.join(' / ')}`} onPress={draw} />
      ) : (
        drawn.map((card, i) => <Text key={card.id}>{`${config.spread[i]}: ${card.name}`}</Text>)
      )}
    </View>
  );
}

export const tarotV2Manifest: ExperienceManifest<TarotV2Config, TarotCard[]> = {
  name: 'tarot',
  version: 'v2',
  validateConfig: validateTarotV2Config,
  load: config => fetchDeck(config.deck),
  Component: TarotV2View,
};
