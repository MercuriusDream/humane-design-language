import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { watchRootRadii } from './lib/rootRadius';
import { parsePreferences, PREFERENCES_KEY, type StoredPreferences, type Theme, type Contrast, type Side } from './lib/preferenceStorage';

export type { Theme, Contrast, Side } from './lib/preferenceStorage';

export type Preferences = {
  theme: Theme;
  scheme: 'light' | 'dark';
  contrast: Contrast;
  highContrast: boolean;
  side: Side;
  grayscale: boolean;
  reducedMotion: boolean;
  setTheme: (theme: Theme) => void;
  setContrast: (contrast: Contrast) => void;
  setSide: (side: Side) => void;
  setGrayscale: (on: boolean) => void;
  setReducedMotion: (on: boolean | null) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredPreferences>(load);
  const systemDark = useMedia('(prefers-color-scheme: dark)');
  const systemHigh = useMedia('(prefers-contrast: more)');
  const systemReduced = useMedia('(prefers-reduced-motion: reduce)');

  const scheme = stored.theme === 'system' ? (systemDark ? 'dark' : 'light') : stored.theme;
  const highContrast = stored.contrast === 'system' ? systemHigh : stored.contrast === 'high';
  const reducedMotion = stored.reducedMotion ?? systemReduced;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = stored.theme === 'system' ? 'light dark' : stored.theme;
    root.dataset.contrast = highContrast ? 'high' : 'standard';
    root.toggleAttribute('data-grayscale', stored.grayscale);
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
  }, [stored.theme, highContrast, stored.grayscale, reducedMotion]);

  // Every root on the page takes the 2px corner cap, measured from its own size.
  useLayoutEffect(() => watchRootRadii(), []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(stored));
    } catch {
      // Storage is a convenience. The page works without it.
    }
  }, [stored]);

  const update = (patch: Partial<StoredPreferences>) => setStored((s) => ({ ...s, ...patch }));

  return (
    <PreferencesContext.Provider
      value={{
        theme: stored.theme,
        scheme,
        contrast: stored.contrast,
        highContrast,
        side: stored.side,
        grayscale: stored.grayscale,
        reducedMotion,
        setTheme: (theme) => update({ theme }),
        setContrast: (contrast) => update({ contrast }),
        setSide: (side) => update({ side }),
        setGrayscale: (grayscale) => update({ grayscale }),
        setReducedMotion: (on) => update({ reducedMotion: on }),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): Preferences {
  const settings = useContext(PreferencesContext);
  if (!settings) throw new Error('usePreferences must be used inside PreferencesProvider');
  return settings;
}

export function useMedia(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const media = matchMedia(query);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  const snapshot = useCallback(() => matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

function load(): StoredPreferences {
  try {
    return parsePreferences(JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? '{}'));
  } catch {
    return parsePreferences(null);
  }
}
