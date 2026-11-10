import { registerConsultation } from '../experiences/consultation/register';
import { registerGemstone } from '../experiences/gemstone/register';
import { registerTarot } from '../experiences/tarot/register';
import { createRegistry, ExperienceRegistry } from '../runtime/registry';

/**
 * Composition root: the experiences shipped in this build.
 * A new team adds one line here; nothing in src/runtime changes.
 */
export function createAppRegistry(): ExperienceRegistry {
  const registry = createRegistry();
  registerTarot(registry);
  registerGemstone(registry);
  registerConsultation(registry);
  return registry;
}
