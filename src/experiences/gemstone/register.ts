import type { ExperienceRegistry } from '../../runtime/registry';
import { gemstoneV1Manifest } from './v1/gemstoneV1';

export function registerGemstone(registry: ExperienceRegistry): void {
  registry.register(gemstoneV1Manifest);
}
