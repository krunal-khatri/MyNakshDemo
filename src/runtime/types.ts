import type { ComponentType } from 'react';

/** One entry of the backend's experience list, after validation at the trust boundary. */
export interface ExperienceDefinition {
  experience: string;
  version: string;
  entryPoint: string;
  enabled: boolean;
  /** Opaque to the runtime: only the experience itself interprets it. */
  config: unknown;
}

export type ConfigResult<C> = { ok: true; config: C } | { ok: false; error: string };

/** What the runtime hands to every experience component. */
export interface ExperienceProps<C, D> {
  config: C;
  data: D;
  complete(): void;
  fail(reason: string): void;
}

/** The contract an experience version implements to plug into the runtime. */
export interface ExperienceManifest<C, D> {
  name: string;
  version: string;
  validateConfig(raw: unknown): ConfigResult<C>;
  load(config: C): Promise<D>;
  Component: ComponentType<ExperienceProps<C, D>>;
}

// The registry holds manifests with different config/data types; each manifest's own
// validateConfig -> load -> Component chain keeps its types consistent.
export type AnyExperienceManifest = ExperienceManifest<any, any>;
