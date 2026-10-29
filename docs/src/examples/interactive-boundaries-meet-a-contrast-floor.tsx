import { useEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import {
  Checkbox,
  Segmented,
  TextField,
  colorContrast,
  usePreferences,
  type Contrast,
  type Theme,
} from 'humane-system';
import './interactive-boundaries-meet-a-contrast-floor.css';

const FLOOR = 3;

const SCHEME: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const CONTRAST: { value: Contrast; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

type Measure = { surround: number; fill: number };

/** The nearest background the page paints behind an element. */
function backdrop(el: HTMLElement): string | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
  }
  return null;
}

/**
 * The color an element settles on. The checkbox fades its fill, and mid-fade the browser reports an
 * interpolated oklab() value, so the reading turns its transition off for the one read.
 */
function settledBackground(el: HTMLElement): string {
  const prev = el.style.transition;
  el.style.transition = 'none';
  const color = getComputedStyle(el).backgroundColor;
  el.style.transition = prev;
  return color;
}

/**
 * Reads the edge from its probe, which uses --ink-boundary, the same token the control's inset edge uses.
 * The fill is read from the control's own surface. Both are measured against the live page.
 */
function measure(cell: HTMLElement, fillSelector: string, solid = false): Measure | null {
  const probe = cell.querySelector<HTMLElement>('[data-role="edge"]');
  const fill = cell.querySelector<HTMLElement>(fillSelector);
  const surround = backdrop(cell);
  if (!probe || !fill || !surround) return null;

  const background = settledBackground(fill);
  const mark = fill.querySelector('svg');
  const edge = solid ? background : settledBackground(probe);
  const inside = solid && mark ? getComputedStyle(mark).stroke : background;
  const outsideRatio = colorContrast(edge, surround);
  const insideRatio = colorContrast(edge, inside);
  if (outsideRatio === null || insideRatio === null) return null;
  return { surround: outsideRatio, fill: insideRatio };
}

/**
 * A text field is recognized by its words, so they are measured at the text floor: its label against the plane
 * around it, and its placeholder (the --ink-3 probe) against its own fill.
 */
function measureWords(cell: HTMLElement): Measure | null {
  const label = cell.querySelector<HTMLElement>('.h-field-label');
  const fill = cell.querySelector<HTMLElement>('.h-text-field-control');
  const probe = cell.querySelector<HTMLElement>('[data-role="words"]');
  const surround = backdrop(cell);
  if (!label || !fill || !probe || !surround) return null;
  const outsideRatio = colorContrast(getComputedStyle(label).color, surround);
  const insideRatio = colorContrast(settledBackground(probe), settledBackground(fill));
  if (outsideRatio === null || insideRatio === null) return null;
  return { surround: outsideRatio, fill: insideRatio };
}

/** A text field, measured by its words, and a checkbox, measured by its edge against the plane it sits on. */
export default function BoundaryFloor() {
  const { theme, contrast, scheme, highContrast, setTheme, setContrast } = usePreferences();
  const [email, setEmail] = useState('');
  const [keep, setKeep] = useState(false);
  const fieldCell = useRef<HTMLDivElement>(null);
  const boxCell = useRef<HTMLDivElement>(null);
  const [readings, setReadings] = useState<{ field: Measure | null; box: Measure | null }>({
    field: null,
    box: null,
  });

  // An effect, not a layout effect: the provider writes color-scheme and data-contrast to the root in its layout effect, which runs after ours.
  useEffect(() => {
    setReadings({
      field: fieldCell.current ? measureWords(fieldCell.current) : null,
      box: boxCell.current ? measure(boxCell.current, '.h-checkbox-box', keep) : null,
    });
  }, [scheme, highContrast, keep]);

  return (
    <Example
      hint="Switch scheme and contrast. The field is known by its words, checked against 4.5:1. The checkbox is known by its edge, or by its solid fill and check mark once checked, checked against 3:1."
      controls={
        <>
          <Segmented label="Scheme" options={SCHEME} value={theme} onChange={setTheme} size="compact" />
          <Segmented label="Contrast" options={CONTRAST} value={contrast} onChange={setContrast} size="compact" />
        </>
      }
    >
      <div className="ex-interactive-boundaries-meet-a-contrast-floor-stage">
        <div className="ex-interactive-boundaries-meet-a-contrast-floor-cell" ref={fieldCell}>
          <TextField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            autoComplete="email"
          />
          <span className="ex-interactive-boundaries-meet-a-contrast-floor-probe" data-role="words" aria-hidden="true" />
        </div>

        <div className="ex-interactive-boundaries-meet-a-contrast-floor-cell" ref={boxCell}>
          <Checkbox label="Keep me signed in" checked={keep} onChange={setKeep} />
          <span className="ex-interactive-boundaries-meet-a-contrast-floor-probe" data-role="edge" aria-hidden="true" />
        </div>

        <ul className="ex-interactive-boundaries-meet-a-contrast-floor-readings" aria-label="Measured contrast" aria-live="polite">
          <Reading name="Text field words" measure={readings.field} floor={4.5} inside="Placeholder" outside="Label" />
          <Reading name="Checkbox edge" measure={readings.box} floor={FLOOR} inside="Inside" outside="Surroundings" />
        </ul>
      </div>
    </Example>
  );
}

function Reading({ name, measure, floor, inside, outside }: { name: string; measure: Measure | null; floor: number; inside: string; outside: string }) {
  if (!measure) {
    return (
      <li className="ex-interactive-boundaries-meet-a-contrast-floor-reading">
        <span className="ex-interactive-boundaries-meet-a-contrast-floor-name">{name}</span>
        <span className="ex-interactive-boundaries-meet-a-contrast-floor-verdict">Not read</span>
      </li>
    );
  }

  const meets = Math.min(measure.surround, measure.fill) >= floor;
  return (
    <li className="ex-interactive-boundaries-meet-a-contrast-floor-reading" data-meets={meets}>
      <span className="ex-interactive-boundaries-meet-a-contrast-floor-name">{name}</span>
      <span className="ex-interactive-boundaries-meet-a-contrast-floor-verdict">
        {meets ? `Meets ${floor}:1` : `Below ${floor}:1`}
      </span>
      <span className="ex-interactive-boundaries-meet-a-contrast-floor-values">
        <span>{outside} {measure.surround.toFixed(1)}:1</span>
        <span>{inside} {measure.fill.toFixed(1)}:1</span>
      </span>
    </li>
  );
}
