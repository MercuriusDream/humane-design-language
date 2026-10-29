import { usePreferences, type Contrast, type Side, type Theme } from '../preferences';
import { Segmented } from './Segmented';
import { Switch } from './Switch';
import './preference-controls.css';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const CONTRASTS: { value: Contrast; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

const SIDES: { value: Side; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

/** Every display preference the system honors. Scheme and contrast are separate choices. Every control is compact. */
export function PreferenceControls({ showGrayscale = false }: { showGrayscale?: boolean }) {
  const p = usePreferences();
  return (
    <div className="h-preferences" role="group" aria-label="Display preferences">
      <Segmented label="Theme" options={THEMES} value={p.theme} onChange={p.setTheme} size="compact" />
      <Segmented label="Contrast" options={CONTRASTS} value={p.contrast} onChange={p.setContrast} size="compact" />
      <Segmented label="Sidebar" options={SIDES} value={p.side} onChange={p.setSide} size="compact" />
      <div className="h-preferences-switches">
        {showGrayscale && <Switch label="Grayscale test" checked={p.grayscale} onChange={p.setGrayscale} size="compact" />}
        <Switch label="Reduced motion" checked={p.reducedMotion} onChange={p.setReducedMotion} size="compact" />
      </div>
    </div>
  );
}
