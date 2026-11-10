import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import type { ConfigResult, ExperienceManifest, ExperienceProps } from '../../../runtime/types';
import { Astrologer, ConsultationMode, fetchAstrologers } from '../consultationApi';

export interface ConsultationConfig {
  mode: ConsultationMode;
}

export function validateConsultationConfig(raw: unknown): ConfigResult<ConsultationConfig> {
  const mode = (raw as { mode?: unknown } | null)?.mode;
  if (mode !== 'human_astrologer') {
    return { ok: false, error: 'mode must be "human_astrologer"' };
  }
  return { ok: true, config: { mode } };
}

function ConsultationView({ data, complete }: ExperienceProps<ConsultationConfig, Astrologer[]>) {
  const [booked, setBooked] = useState<Astrologer | null>(null);

  const book = (astrologer: Astrologer) => {
    setBooked(astrologer);
    complete();
  };

  if (booked) {
    return <Text>{`Booked with ${booked.name}`}</Text>;
  }

  return (
    <View>
      {data.map(a => (
        <View key={a.id}>
          <Text>{`${a.name} · ${a.speciality} · ₹${a.pricePerMinute}/min`}</Text>
          <Button title="Book" accessibilityLabel={`Book ${a.name}`} onPress={() => book(a)} />
        </View>
      ))}
    </View>
  );
}

export const consultationV1Manifest: ExperienceManifest<ConsultationConfig, Astrologer[]> = {
  name: 'consultation',
  version: 'v1',
  validateConfig: validateConsultationConfig,
  load: config => fetchAstrologers(config.mode),
  Component: ConsultationView,
};
