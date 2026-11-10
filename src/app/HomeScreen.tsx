import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExperienceConfig } from '../mocks/backend';
import { parseDefinitions } from '../runtime/definitions';
import { ExperienceHost } from '../runtime/ExperienceHost';
import type { ExperienceRegistry } from '../runtime/registry';
import type { ExperienceDefinition } from '../runtime/types';
import { DemoControls } from './DemoControls';

type ScreenState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; definitions: ExperienceDefinition[] };

export function HomeScreen({ registry }: { registry: ExperienceRegistry }) {
  const [state, setState] = useState<ScreenState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchExperienceConfig()
      .then(raw => parseDefinitions(raw).filter(d => d.enabled))
      .then(
        definitions => !cancelled && setState({ status: 'loaded', definitions }),
        (error: unknown) =>
          !cancelled &&
          setState({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
      );
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setReloadKey(k => k + 1);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>MyNaksh Experiences</Text>
      <Text style={styles.registered}>{`Registered: ${registry.list().join(', ')}`}</Text>
      <DemoControls onChange={reload} />

      {state.status === 'loading' && (
        <View style={styles.row}>
          <ActivityIndicator />
          <Text>Loading experiences…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View>
          <Text style={styles.error}>{state.message}</Text>
          <Button title="Retry" accessibilityLabel="Retry loading experiences" onPress={reload} />
        </View>
      )}

      {state.status === 'loaded' && state.definitions.length === 0 && (
        <Text>No experiences available</Text>
      )}

      {state.status === 'loaded' &&
        state.definitions.map((definition, index) => (
          // reloadKey in the key remounts every host on reload, giving it a fresh lifecycle.
          <ExperienceHost
            key={`${reloadKey}:${index}:${definition.experience}@${definition.version}`}
            definition={definition}
            registry={registry}
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  registered: { color: '#555', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  error: { color: '#c62828', marginBottom: 8 },
});
