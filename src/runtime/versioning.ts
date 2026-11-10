import type { AnyExperienceManifest } from './types';

/**
 * The single version-resolution policy for every experience.
 * Current policy: exact match only (backend asks for "v2", the app must ship "v2").
 * To change it (e.g. "newest compatible", or a per-experience fallback), change only this function.
 */
export function resolveVersion(
  available: ReadonlyMap<string, AnyExperienceManifest>,
  requested: string,
): AnyExperienceManifest | undefined {
  return available.get(requested);
}
