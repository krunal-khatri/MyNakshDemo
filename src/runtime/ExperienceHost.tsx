import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExperienceErrorBoundary } from './ExperienceErrorBoundary';
import { initialLifecycle, lifecycleReducer, LifecycleState } from './lifecycle';
import type { ExperienceRegistry } from './registry';
import type { AnyExperienceManifest, ExperienceDefinition } from './types';

interface Props {
  definition: ExperienceDefinition;
  registry: ExperienceRegistry;
}

interface Loaded {
  manifest: AnyExperienceManifest;
  config: unknown;
  data: unknown;
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

const statusLabel = (state: LifecycleState) => {
  switch (state.status) {
    case 'initializing':
      return 'Initializing…';
    case 'loading':
      return 'Loading…';
    case 'ready':
      return 'Ready';
    case 'completed':
      return 'Completed';
    case 'failed':
      return `Failed: ${state.reason}`;
  }
};

/**
 * Runs one experience through the common lifecycle: resolve -> validate config -> load -> render.
 * `definition` and `registry` are fixed for the host's lifetime; the parent remounts it (via `key`)
 * to change them.
 */
export function ExperienceHost({ definition, registry }: Props) {
  const [lifecycle, dispatch] = useReducer(lifecycleReducer, initialLifecycle);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fail = (reason: string) => {
      if (!cancelled) {
        dispatch({ type: 'FAIL', reason });
      }
    };

    const run = async () => {
      const resolved = registry.resolve(definition.experience, definition.version);
      if (!resolved.ok) {
        return fail(resolved.reason);
      }
      const { manifest } = resolved;

      let result;
      try {
        result = manifest.validateConfig(definition.config);
      } catch (error) {
        return fail(`Invalid config: ${messageOf(error)}`);
      }
      if (!result.ok) {
        return fail(`Invalid config: ${result.error}`);
      }

      dispatch({ type: 'LOAD' });
      try {
        const data = await manifest.load(result.config);
        if (!cancelled) {
          setLoaded({ manifest, config: result.config, data });
          dispatch({ type: 'READY' });
        }
      } catch (error) {
        fail(messageOf(error));
      }
    };

    // Anything unexpected (e.g. a malformed validator result) still ends in Failed, never a stuck card.
    run().catch(error => fail(messageOf(error)));
    return () => {
      cancelled = true;
    };
    // definition/registry are fixed for this host's lifetime (see doc comment); only retries re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const complete = useCallback(() => dispatch({ type: 'COMPLETE' }), []);
  const failFromExperience = useCallback(
    (reason: string) => dispatch({ type: 'FAIL', reason }),
    [],
  );
  const onCrash = useCallback(
    (error: unknown) => dispatch({ type: 'CRASH', reason: `Crashed: ${messageOf(error)}` }),
    [],
  );
  const retry = () => {
    dispatch({ type: 'RETRY' });
    setAttempt(n => n + 1);
  };

  const { experience, version, entryPoint } = definition;
  const showExperience =
    loaded && (lifecycle.status === 'ready' || lifecycle.status === 'completed');
  const ExperienceComponent = loaded?.manifest.Component;

  return (
    <View style={styles.card}>
      <Text testID={`header-${experience}`} style={styles.header}>
        {`${experience} · ${version} · ${entryPoint}`}
      </Text>
      <Text
        testID={`status-${experience}`}
        style={lifecycle.status === 'failed' ? styles.failed : styles.status}>
        {statusLabel(lifecycle)}
      </Text>

      {showExperience && ExperienceComponent && (
        <ExperienceErrorBoundary key={attempt} onError={onCrash}>
          <ExperienceComponent
            config={loaded.config}
            data={loaded.data}
            complete={complete}
            fail={failFromExperience}
          />
        </ExperienceErrorBoundary>
      )}

      {lifecycle.status === 'failed' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Retry ${experience}`}
          onPress={retry}
          style={styles.retry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  header: { fontWeight: '600', fontSize: 16 },
  status: { color: '#2e7d32' },
  failed: { color: '#c62828' },
  retry: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  retryText: { fontWeight: '600' },
});
