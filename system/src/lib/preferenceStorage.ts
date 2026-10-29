export type Theme = 'system' | 'light' | 'dark';
export type Contrast = 'system' | 'standard' | 'high';
export type Side = 'left' | 'right';

export type StoredPreferences = {
  theme: Theme;
  contrast: Contrast;
  side: Side;
  grayscale: boolean;
  /** null follows the operating system setting. */
  reducedMotion: boolean | null;
};

export const PREFERENCES_KEY = 'humane-preferences';

/** Persisted data is untrusted. Invalid fields fall back independently to system defaults. */
export function parsePreferences(value: unknown): StoredPreferences {
  const s = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    theme: s.theme === 'light' || s.theme === 'dark' ? s.theme : 'system',
    contrast: s.contrast === 'standard' || s.contrast === 'high' ? s.contrast : 'system',
    side: s.side === 'right' ? 'right' : 'left',
    grayscale: s.grayscale === true,
    reducedMotion: typeof s.reducedMotion === 'boolean' ? s.reducedMotion : null,
  };
}
