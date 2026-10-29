import { Example } from '../components/Example';
import { Button, Surface } from 'humane-system';
import './every-mode-is-built-not-inverted.css';

type Mode = 'inverted' | 'built';

const MODES: { id: Mode; label: string }[] = [
  { id: 'inverted', label: 'Inverted' },
  { id: 'built', label: 'Built' },
];

/**
 * Rule: every mode is built, not inverted. The same card in two dark versions.
 * Inverted flips the light card, so its raised surface sinks below its plane.
 * Built defines dark steps of its own, so raised stays lighter than base.
 */
export default function EveryModeIsBuiltNotInverted() {
  return (
    <Example hint="One card, two dark versions. Inverted flips the light card, so its raised surface sinks below the plane. Built sets dark steps, so raised stays raised. Hover or tab to the buttons in each.">
      <div className="ex-every-mode-is-built-not-inverted-grid">
        {MODES.map((mode) => (
          <figure key={mode.id} className="ex-every-mode-is-built-not-inverted-case">
            <figcaption className="ex-every-mode-is-built-not-inverted-caption">{mode.label}</figcaption>
            <div className="ex-every-mode-is-built-not-inverted-stage" data-root data-mode={mode.id}>
              <Surface depth={1} plane="raised" as="article" className="ex-every-mode-is-built-not-inverted-card">
                <h4 className="ex-every-mode-is-built-not-inverted-title">Budget review</h4>
                <p className="ex-every-mode-is-built-not-inverted-body">
                  Three lines over last month. Travel is the only one that grew.
                </p>
                <div className="ex-every-mode-is-built-not-inverted-actions">
                  <Button variant="strong" depth={2}>
                    Approve
                  </Button>
                  <Button depth={2}>Later</Button>
                </div>
              </Surface>
            </div>
          </figure>
        ))}
      </div>
    </Example>
  );
}
