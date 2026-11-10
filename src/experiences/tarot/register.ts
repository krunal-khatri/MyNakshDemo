import type { ExperienceRegistry } from '../../runtime/registry';
import { tarotV1Manifest } from './v1/tarotV1';
import { tarotV2Manifest } from './v2/tarotV2';

/** Tarot registers its own versions; the runtime never imports this folder. */
export function registerTarot(registry: ExperienceRegistry): void {
  registry.register(tarotV1Manifest);
  registry.register(tarotV2Manifest);
}
