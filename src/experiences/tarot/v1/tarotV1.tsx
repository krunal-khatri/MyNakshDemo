import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import type { ConfigResult, ExperienceManifest, ExperienceProps } from '../../../runtime/types';
import { drawCards } from '../drawCards';
import { fetchDeck, TarotCard } from '../tarotApi';

export interface TarotV1Config {
  deck: string;
  maxCards: number;
}

export function validateTarotV1Config(raw: unknown): ConfigResult<TarotV1Config> {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'config must be an object' };
  }
  const { deck, maxCards } = raw as Record<string, unknown>;
  if (typeof deck !== 'string' || deck.length === 0) {
    return { ok: false, error: 'deck must be a non-empty string' };
  }
  if (typeof maxCards !== 'number' || !Number.isInteger(maxCards) || maxCards < 1 || maxCards > 10) {
    return { ok: false, error: 'maxCards must be an integer from 1 to 10' };
  }
  return { ok: true, config: { deck, maxCards } };
}

function TarotV1View({ config, data, complete }: ExperienceProps<TarotV1Config, TarotCard[]>) {
  const [drawn, setDrawn] = useState<TarotCard[]>([]);

  const draw = () => {
    setDrawn(drawCards(data, config.maxCards));
    complete();
  };

  return (
    <View>
      <Text>{`Deck: ${config.deck} · up to ${config.maxCards} cards`}</Text>
      {drawn.length === 0 ? (
        <Button title={`Draw ${config.maxCards} cards`} onPress={draw} />
      ) : (
        drawn.map(card => <Text key={card.id}>{`• ${card.name}`}</Text>)
      )}
    </View>
  );
}

export const tarotV1Manifest: ExperienceManifest<TarotV1Config, TarotCard[]> = {
  name: 'tarot',
  version: 'v1',
  validateConfig: validateTarotV1Config,
  load: config => fetchDeck(config.deck),
  Component: TarotV1View,
};
