import type { ExperienceRegistry } from '../../runtime/registry';
import { consultationV1Manifest } from './v1/consultationV1';

export function registerConsultation(registry: ExperienceRegistry): void {
  registry.register(consultationV1Manifest);
}
