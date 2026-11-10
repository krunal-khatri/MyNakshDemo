import type { ExperienceDefinition } from './types';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

/**
 * Trust boundary: backend data is untrusted. Malformed entries are skipped so one bad
 * entry cannot take down the others; `config` is passed through untouched.
 */
export function parseDefinitions(raw: unknown): ExperienceDefinition[] {
  const list = (raw as { experiences?: unknown } | null)?.experiences;
  if (!Array.isArray(list)) {
    throw new Error('Malformed experience configuration');
  }

  return list.flatMap((entry, index): ExperienceDefinition[] => {
    const e = (entry ?? {}) as Record<string, unknown>;
    if (!isNonEmptyString(e.experience) || !isNonEmptyString(e.version)) {
      console.warn(`Skipping malformed experience definition at index ${index}`);
      return [];
    }
    return [
      {
        experience: e.experience,
        version: e.version,
        entryPoint: typeof e.entryPoint === 'string' ? e.entryPoint : 'chat',
        enabled: typeof e.enabled === 'boolean' ? e.enabled : true,
        config: e.config,
      },
    ];
  });
}
