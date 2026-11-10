// Demo-only switches that make the mock APIs misbehave on purpose. Not a production pattern.
export const devFlags = {
  backendFails: false,
  gemstoneFails: true,
  tarotVersion: 'v1' as 'v1' | 'v2',
  injectUnknown: false,
};

export type DevFlags = typeof devFlags;
