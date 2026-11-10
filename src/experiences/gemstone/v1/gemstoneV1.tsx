import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import type { ConfigResult, ExperienceManifest, ExperienceProps } from '../../../runtime/types';
import {
  fetchGemstoneRecommendation,
  GemstoneRecommendation,
  RecommendationMode,
} from '../gemstoneApi';

export interface GemstoneConfig {
  recommendationMode: RecommendationMode;
}

export function validateGemstoneConfig(raw: unknown): ConfigResult<GemstoneConfig> {
  const mode = (raw as { recommendationMode?: unknown } | null)?.recommendationMode;
  if (mode !== 'personalized' && mode !== 'general') {
    return { ok: false, error: 'recommendationMode must be "personalized" or "general"' };
  }
  return { ok: true, config: { recommendationMode: mode } };
}

function GemstoneView({ data, complete }: ExperienceProps<GemstoneConfig, GemstoneRecommendation>) {
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    complete();
  };

  return (
    <View>
      <Text>{`Recommended: ${data.stone}`}</Text>
      <Text>{data.reason}</Text>
      {saved ? <Text>Saved to your profile</Text> : <Button title="Save recommendation" onPress={save} />}
    </View>
  );
}

export const gemstoneV1Manifest: ExperienceManifest<GemstoneConfig, GemstoneRecommendation> = {
  name: 'gemstone',
  version: 'v1',
  validateConfig: validateGemstoneConfig,
  load: config => fetchGemstoneRecommendation(config.recommendationMode),
  Component: GemstoneView,
};
