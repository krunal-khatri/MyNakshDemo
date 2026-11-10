import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { devFlags, DevFlags } from '../mocks/devFlags';

type BooleanFlag = Exclude<keyof DevFlags, 'tarotVersion'>;

// `reload: false` keeps the failed card on screen so its own Retry can demonstrate recovery.
const switches: { label: string; flag: BooleanFlag; reload: boolean }[] = [
  { label: 'Config service fails', flag: 'backendFails', reload: true },
  { label: 'Gemstone API fails', flag: 'gemstoneFails', reload: false },
  { label: 'Add unknown experience', flag: 'injectUnknown', reload: true },
];

/** Demo-only panel that flips the mock APIs' behaviour, then asks the screen to reload. */
export function DemoControls({ onChange }: { onChange(): void }) {
  const [flags, setFlags] = useState<DevFlags>({ ...devFlags });

  const update = (patch: Partial<DevFlags>, reload = true) => {
    Object.assign(devFlags, patch);
    setFlags({ ...devFlags });
    if (reload) {
      onChange();
    }
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Demo controls</Text>
      {switches.map(({ label, flag, reload }) => (
        <View key={flag} style={styles.row}>
          <Text>{label}</Text>
          <Switch
            accessibilityLabel={label}
            value={flags[flag]}
            onValueChange={value => update({ [flag]: value }, reload)}
          />
        </View>
      ))}
      <View style={styles.row}>
        <Text>Tarot v2</Text>
        <Switch
          accessibilityLabel="Tarot v2"
          value={flags.tarotVersion === 'v2'}
          onValueChange={value => update({ tarotVersion: value ? 'v2' : 'v1' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 12, borderRadius: 8, backgroundColor: '#f4f4f4', marginBottom: 12 },
  title: { fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
