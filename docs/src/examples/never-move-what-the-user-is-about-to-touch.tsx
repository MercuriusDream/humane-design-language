import { useLayoutEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import { Arrivals, Button, List, ListRow, growFrom, moveFrom, usePreferences } from 'humane-system';
import './never-move-what-the-user-is-about-to-touch.css';

type Item = { key: string; title: string; meta: string };

const START: Item[] = [
  { key: 'ferry', title: 'Ferry timetable', meta: 'Winter' },
  { key: 'session', title: 'Studio session notes', meta: 'Mon' },
  { key: 'lens', title: 'Lens repair estimate', meta: 'Tue' },
  { key: 'bread', title: 'Bread recipe, third try', meta: 'Sat' },
];

const INCOMING: Array<Omit<Item, 'key'>> = [
  { title: 'Bridge closure notice', meta: 'Today' },
  { title: 'Album shared with you', meta: 'Now' },
  { title: 'Rent receipt', meta: 'Mar' },
  { title: 'Tide table, next week', meta: 'Wed' },
  { title: 'Studio key returned', meta: 'Thu' },
];

/** Bookkeeping for one join: where every row was, and where the arrivals button was, before the list changed. */
type Flip = {
  before: Map<string, DOMRect>;
  origin: DOMRect | null;
  added: Set<string>;
  focusFirst: boolean;
};

/**
 * Rule: never move what the user is about to touch. Arrivals wait in a reserved slot above the list,
 * so nothing moves while the user reads or selects. Pressing the slot is the user's own action, so the
 * insertion may move rows: existing rows slide to their new place and new rows grow from the button.
 */
export default function NeverMove() {
  const { reducedMotion } = usePreferences();
  const [items, setItems] = useState<Item[]>(START);
  const [pending, setPending] = useState<Item[]>([]);
  const [serial, setSerial] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<Flip | null>(null);

  const simulate = () => {
    const batch = [serial, serial + 1].map((n) => {
      const next = INCOMING[n % INCOMING.length];
      return { key: `incoming-${n}`, title: next.title, meta: next.meta };
    });
    setSerial(serial + 2);
    setPending((waiting) => [...waiting, ...batch]);
  };

  const join = () => {
    const root = stageRef.current;
    const flip: Flip = {
      before: new Map(),
      origin: null,
      added: new Set(pending.map((item) => item.key)),
      focusFirst: false,
    };
    if (root) {
      const rows = root.querySelectorAll<HTMLElement>('.h-list-row');
      items.forEach((item, i) => {
        const row = rows[i];
        if (row) flip.before.set(item.key, row.getBoundingClientRect());
      });
      const button = root.querySelector<HTMLElement>('.h-arrivals-button');
      flip.origin = button?.getBoundingClientRect() ?? null;
      // The button unmounts when the slot empties. Keep keyboard users on the new content.
      flip.focusFirst = button !== null && button === document.activeElement;
      // A keyboard join is the user's own action, so the scroller may reveal the new row.
    }
    flipRef.current = flip;
    setItems((current) => [...pending, ...current]);
    setPending([]);
  };

  // Runs after the join commits and before paint, so the morph starts from the old positions.
  useLayoutEffect(() => {
    const flip = flipRef.current;
    const root = stageRef.current;
    if (!flip || !root) return;
    flipRef.current = null;

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.h-list-row'));
    items.forEach((item, i) => {
      const row = rows[i];
      if (!row) return;
      if (flip.added.has(item.key)) {
        if (flip.origin) growFrom(row, flip.origin, reducedMotion);
      } else {
        const before = flip.before.get(item.key);
        if (before) moveFrom(row, before, reducedMotion);
      }
    });

    if (flip.focusFirst) {
      const first = rows[0];
      if (first) first.focus();
    }
  }, [items, reducedMotion]);

  return (
    <Example
      hint="Select a row. Arrivals wait in the slot above the list and join only when you press the slot."
      controls={<Button size="compact" onClick={simulate}>Simulate new items</Button>}
    >
      <div className="ex-never-move-what-the-user-is-about-to-touch-stage" ref={stageRef}>
        <Arrivals count={pending.length} onShow={join}>
          <div
            className="ex-never-move-what-the-user-is-about-to-touch-scroll"
            role="region"
            aria-label="Activity, scrollable"
            tabIndex={0}
          >
            <List label="Activity">
              {items.map((item) => (
                <ListRow
                  key={item.key}
                  title={item.title}
                  meta={item.meta}
                  selected={selected === item.key}
                  onSelect={() => setSelected(item.key)}
                />
              ))}
            </List>
          </div>
        </Arrivals>
      </div>
    </Example>
  );
}
