import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Checkbox, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './checkbox.css';

type Item = { id: string; label: string; hint?: string; initial: boolean; fixed: boolean };
type PropRow = { prop: string; type: string; meaning: string };

const ITEMS: Item[] = [
  { id: 'summary', label: 'Send a weekly summary', hint: 'Mondays at 8:00, to your account email.', initial: true, fixed: false },
  { id: 'signin', label: 'Keep me signed in on this device', initial: false, fixed: false },
  { id: 'usage', label: 'Share anonymous usage data', hint: 'Helps find slow screens. Never includes files.', initial: false, fixed: false },
  { id: 'policy', label: 'Accept the workspace policy', hint: 'Required for everyone in this workspace.', initial: true, fixed: true },
];

// The switch locks the first LOCKED_COUNT options. The last option is fixed on its own.
const LOCKED_COUNT = 3;

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Names the option beside the box. The label is part of the click target and the accessible name.',
  },
  {
    prop: 'checked',
    type: 'boolean',
    meaning: 'Whether the box is checked.',
  },
  {
    prop: 'onChange',
    type: '(checked: boolean) => void',
    meaning: 'Called with the next checked state when the user toggles the box.',
  },
  {
    prop: 'hint',
    type: 'string',
    meaning: 'Optional. A short line under the label that explains this option. It is linked to the box for assistive technology.',
  },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'Optional, 1 by default. The box takes the 2 px corner of that depth.',
  },
  {
    prop: 'disabled',
    type: 'boolean',
    meaning: 'Optional, false by default. Blocks input and sets the label, the hint, and the box edge in tertiary ink. The option stays in place, so nothing around it moves.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px row with body text and a 20 px box. Compact is a 36 px row with small text and a 16 px box. Defaults to standard.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** A checkbox is one independent choice. Its box stays the same object as the check draws in, and the count announces every change. */
export default function CheckboxDoc() {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ITEMS.map((item) => [item.id, item.initial])),
  );
  const [locked, setLocked] = useState(false);
  const selected = ITEMS.filter((item) => values[item.id]).length;

  return (
    <>
      <p className="rule-text">
        A checkbox chooses any number of independent options, and each one is on or off. Each box takes effect the moment
        the user checks it, so the choice holds without a submit step.
      </p>
      <Serves
        rules={[
          'interactive-boundaries-meet-a-contrast-floor',
          'focus-is-a-signal-not-a-separator',
          'motion-is-a-morph',
          'respond-at-once',
          'reduced-motion-keeps-continuity',
          'state-lives-on-the-object',
          'show-and-expose',
        ]}
      />
      <Example
        hint="Check a box, or Tab to one and press Space. The count updates as you go. The last option is required and stays on."
        controls={
          <Switch label={`Lock the first ${LOCKED_COUNT}`} checked={locked} onChange={setLocked} size="compact" />
        }
      >
        <div className="doc-checkbox-stack">
          <p className="doc-checkbox-count" aria-live="polite">
            {selected} of {ITEMS.length} selected
          </p>
          {ITEMS.map((item, index) => (
            <Checkbox
              key={item.id}
              label={item.label}
              hint={item.hint}
              checked={values[item.id]}
              disabled={item.fixed || (locked && index < LOCKED_COUNT)}
              onChange={(checked) => setValues((current) => ({ ...current, [item.id]: checked }))}
            />
          ))}
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList caption="Checkbox props" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
