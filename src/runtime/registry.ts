import type { AnyExperienceManifest } from './types';
import { resolveVersion } from './versioning';

export type ResolveResult =
  | { ok: true; manifest: AnyExperienceManifest }
  | { ok: false; reason: string };

export interface ExperienceRegistry {
  register(manifest: AnyExperienceManifest): void;
  resolve(name: string, version: string): ResolveResult;
  /** Sorted "name@version" keys, for display and debugging. */
  list(): string[];
}

export function createRegistry(): ExperienceRegistry {
  const experiences = new Map<string, Map<string, AnyExperienceManifest>>();

  return {
    register(manifest) {
      const versions = experiences.get(manifest.name) ?? new Map();
      if (versions.has(manifest.version)) {
        throw new Error(`Experience "${manifest.name}@${manifest.version}" is already registered`);
      }
      versions.set(manifest.version, manifest);
      experiences.set(manifest.name, versions);
    },

    resolve(name, version) {
      const versions = experiences.get(name);
      if (!versions) {
        return { ok: false, reason: `Unknown experience "${name}"` };
      }
      const manifest = resolveVersion(versions, version);
      if (!manifest) {
        const available = [...versions.keys()].sort().join(', ');
        return {
          ok: false,
          reason: `Unsupported version "${version}" of "${name}" (available: ${available})`,
        };
      }
      return { ok: true, manifest };
    },

    list() {
      return [...experiences.values()]
        .flatMap(versions => [...versions.values()].map(m => `${m.name}@${m.version}`))
        .sort();
    },
  };
}
