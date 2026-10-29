import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Slider, morphDuration } from 'humane-system';
import './whitespace-is-syntax.css';

const GAP_WITHIN = 8; // px, --gap-within. Each slider step adds one within gap to the gap between groups.

/** Six items in three pairs. Each pair is one group, and the groups are separated by space alone. */
const GROUPS = [
  ['Name', 'Email'],
  ['Street', 'City'],
  ['Card number', 'Expiry'],
];

/** The gap between groups is a multiple of the gap within a group. At 1 the groups vanish. Serves: whitespace is syntax. */
export default function WhitespaceIsSyntax() {
  const [ratio, setRatio] = useState(3);
  const [dur, setDur] = useState(morphDuration(0));

  // The duration comes from the distance the between-group gap travels in this one change.
  const change = (next: number) => {
    setDur(morphDuration(Math.abs(next - ratio) * GAP_WITHIN));
    setRatio(next);
  };

  return (
    <Example
      hint="Move the slider. At 1 the pairs merge into one list. At 3 each pair is clearly its own group."
      controls={
        <Slider size="compact" label="Gap between groups" value={ratio} min={1} max={4} onChange={change} unit="× within" />
      }
    >
      <ul
        className="ex-whitespace-is-syntax-groups"
        role="list"
        style={{ '--ratio': ratio, '--dur': `${dur}ms` } as CSSProperties}
      >
        {GROUPS.map(([first, second]) => (
          <li key={first} className="ex-whitespace-is-syntax-group">
            <ul className="ex-whitespace-is-syntax-items" role="list">
              <li className="ex-whitespace-is-syntax-item">{first}</li>
              <li className="ex-whitespace-is-syntax-item">{second}</li>
            </ul>
          </li>
        ))}
      </ul>
    </Example>
  );
}
