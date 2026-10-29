import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Switch } from 'humane-system';
import './luminance-carries-structure.css';

const TITLES = [
  { id: 'plans', title: 'Plans', count: '4 items' },
  { id: 'done', title: 'Done', count: '11 items' },
  { id: 'late', title: 'Late', count: '2 items' },
  { id: 'notes', title: 'Notes', count: '7 items' },
];

// Four hues spread around the wheel. Each tile keeps the same lightness as the others.
const HUES = [25, 85, 150, 255];

/** Two identical strips. One differs only in hue, the other only in lightness. Grayscale shows which keeps its edges. */
export default function LuminanceCarriesStructure() {
  const [gray, setGray] = useState(false);
  return (
    <Example
      hint="Turn on grayscale. Only the strip that differs in lightness keeps its edges."
      controls={<Switch size="compact" label="Grayscale" checked={gray} onChange={setGray} />}
    >
      <div className="ex-luminance-carries-structure-stage" data-gray={gray}>
        <section className="ex-luminance-carries-structure-group" aria-labelledby="ex-lcs-hue">
          <h4 className="ex-luminance-carries-structure-label" id="ex-lcs-hue">
            Same lightness, different hue
          </h4>
          <ul className="ex-luminance-carries-structure-strip">
            {TITLES.map((item, i) => (
              <li
                key={item.id}
                className="ex-luminance-carries-structure-tile"
                data-kind="hue"
                style={{ '--hue': HUES[i] } as CSSProperties}
              >
                <span className="ex-luminance-carries-structure-title">{item.title}</span>
                <span className="ex-luminance-carries-structure-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ex-luminance-carries-structure-group" aria-labelledby="ex-lcs-light">
          <h4 className="ex-luminance-carries-structure-label" id="ex-lcs-light">
            Same hue, different lightness
          </h4>
          <ul className="ex-luminance-carries-structure-strip">
            {TITLES.map((item, i) => (
              <li
                key={item.id}
                className="ex-luminance-carries-structure-tile"
                data-kind="lightness"
                data-step={i}
              >
                <span className="ex-luminance-carries-structure-title">{item.title}</span>
                <span className="ex-luminance-carries-structure-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Example>
  );
}
