import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Segmented, morphDuration, usePreferences } from 'humane-system';
import './a-heading-sits-closer-to-what-it-introduces.css';

type Mode = 'equal' | 'closer';

const MODES: { value: Mode; label: string }[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'closer', label: 'Closer' },
];

/**
 * Equal spreads --space-8 + 2 * --space-2 (80 px) evenly over three gaps; Closer sets 8 px below each heading.
 * The farthest any line travels is that difference: 80 / 3 - 8, about 19 px.
 */
const MORPH_DISTANCE_PX = 80 / 3 - 8;

/** Two sections. The same total space sits between them in both modes; only how it is divided changes. */
export default function HeadingGaps() {
  const [mode, setMode] = useState<Mode>('equal');
  const { reducedMotion } = usePreferences();
  const duration = reducedMotion ? '0ms' : `${morphDuration(MORPH_DISTANCE_PX)}ms`;

  return (
    <Example
      hint="Equal floats each heading midway between the content above and the content below. Closer pulls it down onto the text it introduces."
      controls={
        <div className="ex-a-heading-sits-closer-to-what-it-introduces-controls">
          <Segmented size="compact" label="Gaps around headings" options={MODES} value={mode} onChange={setMode} />
        </div>
      }
    >
      <div className="ex-a-heading-sits-closer-to-what-it-introduces-page" data-mode={mode} style={{ '--dur': duration } as CSSProperties}>
        <section className="ex-a-heading-sits-closer-to-what-it-introduces-section">
          <h3 className="ex-a-heading-sits-closer-to-what-it-introduces-heading">Morning light</h3>
          <p className="ex-a-heading-sits-closer-to-what-it-introduces-body">Fog over the river until nine.</p>
        </section>
        <section className="ex-a-heading-sits-closer-to-what-it-introduces-section">
          <h3 className="ex-a-heading-sits-closer-to-what-it-introduces-heading">Studio session</h3>
          <p className="ex-a-heading-sits-closer-to-what-it-introduces-body">Window light only, from the north wall.</p>
        </section>
      </div>
    </Example>
  );
}
