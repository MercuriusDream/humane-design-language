import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Switch, morphDuration, oklchLightness, usePreferences } from 'humane-system';
import './check-signals-against-the-lightness-hierarchy.css';

const P = 'ex-check-signals-against-the-lightness-hierarchy';

type Sample = { token: string; text: string };
type Reading = { l: number | null; dur: number };

// Two neutral text colors and the two signals, in the order the eye should read them.
const SAMPLES: Sample[] = [
  { token: '--ink-1', text: 'Essential text' },
  { token: '--ink-3', text: 'Tertiary text' },
  { token: '--signal-focus', text: 'Focus is here' },
  { token: '--signal-danger', text: 'Payment failed' },
];

/**
 * Rule: check signals against the lightness hierarchy. Each bar is the measured OKLCH lightness distance between a
 * color and the plane it sits on, so the longest bar is the color that stands out most in either mode. Raw lightness
 * would run backwards in light mode, where the darkest ink is the strongest. Grayscale shows where the hue stops
 * carrying the signal.
 */
export default function CheckSignalsAgainstTheLightnessHierarchy() {
  const [gray, setGray] = useState(false);
  const { scheme, highContrast } = usePreferences();
  const [readings, setReadings] = useState<Record<string, Reading>>({});
  const probes = useRef<Record<string, HTMLParagraphElement | null>>({});
  const rows = useRef<Record<string, HTMLLIElement | null>>({});
  const tracks = useRef<Record<string, HTMLSpanElement | null>>({});
  const last = useRef<Record<string, number | null>>({});

  // Measure after every layout effect has applied the scheme and contrast attributes to the root.
  // The fill morphs by the distance it actually travels. On first measure there is no earlier value, so nothing animates on load.
  useEffect(() => {
    const next: Record<string, Reading> = {};
    for (const sample of SAMPLES) {
      const el = probes.current[sample.token];
      const track = tracks.current[sample.token];
      const row = rows.current[sample.token];
      const ink = el ? oklchLightness(getComputedStyle(el).color) : null;
      const plane = row ? oklchLightness(getComputedStyle(row).backgroundColor) : null;
      const l = typeof ink === 'number' && typeof plane === 'number' ? Math.abs(ink - plane) : null;
      const before = last.current[sample.token];
      const px = typeof l === 'number' && typeof before === 'number' && track ? Math.abs(l - before) * track.offsetWidth : 0;
      next[sample.token] = { l, dur: px > 0 ? morphDuration(px) : 0 };
      last.current[sample.token] = l;
    }
    setReadings(next);
  }, [scheme, highContrast]);

  return (
    <Example
      hint="Each bar is the measured lightness distance from the row's plane. Saturated colors stand out more than their bar, so judge each signal by how it looks. Turn on grayscale to check that the order holds without hue."
      controls={<Switch size="compact" label="Grayscale" checked={gray} onChange={setGray} />}
    >
      <ul className={`${P}-list`} data-gray={gray} aria-label="Text colors by lightness distance from their plane">
        {SAMPLES.map((sample) => {
          const reading = readings[sample.token];
          const l = reading?.l ?? null;
          const pct = typeof l === 'number' ? Math.round(l * 1000) / 10 : 0;
          const signal = sample.token.startsWith('--signal');
          return (
            <li
              key={sample.token}
              className={`${P}-row`}
              ref={(el) => {
                rows.current[sample.token] = el;
              }}
              data-signal={signal}
              style={{ '--tone': `var(${sample.token})`, '--dur': `${reading?.dur ?? 0}ms` } as CSSProperties}
            >
              <div className={`${P}-main`}>
                <p
                  className={`${P}-sample`}
                  ref={(el) => {
                    probes.current[sample.token] = el;
                  }}
                >
                  {sample.text}
                </p>
                <code className={`${P}-name`}>{sample.token}</code>
              </div>
              <div className={`${P}-meter`}>
                <span
                  className={`${P}-track`}
                  aria-hidden="true"
                  ref={(el) => {
                    tracks.current[sample.token] = el;
                  }}
                >
                  <span className={`${P}-fill`} style={{ '--l': `${pct}%` } as CSSProperties} />
                </span>
                <span className={`${P}-value`}>{typeof l === 'number' ? `ΔL ${l.toFixed(2)}` : 'ΔL …'}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Example>
  );
}
