import { delay } from './delay';
import { devFlags } from './devFlags';

/** Mock of the backend endpoint that tells the app which experiences to show. */
export async function fetchExperienceConfig(): Promise<unknown> {
  await delay(600);
  if (devFlags.backendFails) {
    throw new Error('Experience config service unavailable');
  }

  const tarot =
    devFlags.tarotVersion === 'v2'
      ? { version: 'v2', config: { deck: 'classic', spread: ['Past', 'Present', 'Future'] } }
      : { version: 'v1', config: { deck: 'classic', maxCards: 3 } };

  const experiences = [
    { experience: 'tarot', entryPoint: 'chat', enabled: true, ...tarot },
    {
      experience: 'gemstone',
      version: 'v1',
      entryPoint: 'chat',
      enabled: true,
      config: { recommendationMode: 'personalized' },
    },
    {
      experience: 'consultation',
      version: 'v1',
      entryPoint: 'chat',
      enabled: true,
      config: { mode: 'human_astrologer' },
    },
    { experience: 'panchang', version: 'v1', entryPoint: 'chat', enabled: false, config: {} },
  ];

  if (devFlags.injectUnknown) {
    experiences.push({
      experience: 'remedies',
      version: 'v1',
      entryPoint: 'chat',
      enabled: true,
      config: {},
    });
  }

  return { experiences };
}
