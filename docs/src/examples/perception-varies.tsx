import { Example } from '../components/Example';
import { Surface } from 'humane-system';
import './perception-varies.css';

type Condition = {
  id: string;
  label: string;
  /** Sets data-contrast on the stage, so the system's high contrast tokens apply to that stage alone. */
  contrast?: 'high';
  /** Scales the type tokens on the stage, and grayscale removes hue from it. */
  look?: 'larger' | 'grayscale';
};

const CONDITIONS: Condition[] = [
  { id: 'default', label: 'Default' },
  { id: 'larger', label: 'Larger text', look: 'larger' },
  { id: 'high', label: 'High contrast', contrast: 'high' },
  { id: 'grayscale', label: 'Grayscale', look: 'grayscale' },
];

/** One message card under four conditions. Each stays readable, and its hierarchy survives without hue. */
export default function PerceptionVaries() {
  return (
    <Example hint="The same message card under four conditions: default, larger text, high contrast, and grayscale. Each one stays readable.">
      <div className="ex-perception-varies-grid">
        {CONDITIONS.map((c) => (
          <figure key={c.id} className="ex-perception-varies-case">
            <figcaption className="ex-perception-varies-caption">{c.label}</figcaption>
            <div
              className="ex-perception-varies-stage"
              data-root
              data-look={c.look}
              data-contrast={c.contrast}
            >
              <Surface depth={1} plane="raised" className="ex-perception-varies-card" as="article">
                <h4 className="ex-perception-varies-sender">Ana Ruiz</h4>
                <p className="ex-perception-varies-text">
                  Can you send the revised floor plan before the 3 pm review?
                </p>
              </Surface>
            </div>
          </figure>
        ))}
      </div>
    </Example>
  );
}
