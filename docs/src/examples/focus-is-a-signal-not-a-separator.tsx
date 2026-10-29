import { Button } from 'humane-system';
import { Example } from '../components/Example';
import './focus-is-a-signal-not-a-separator.css';

const ACTIONS = ['Cut', 'Copy', 'Paste', 'Select all'];

/** The global focus ring is the only outline here, and it is the only saturated element. */
export default function FocusIsASignal() {
  return (
    <Example hint="Press Tab to move through them.">
      <div className="ex-focus-is-a-signal-not-a-separator-row">
        {ACTIONS.map((label) => (
          <Button key={label} depth={2}>
            {label}
          </Button>
        ))}
      </div>
    </Example>
  );
}
