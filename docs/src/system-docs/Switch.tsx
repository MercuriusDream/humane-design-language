import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './switch.css';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Names the setting. It sits beside the track and becomes the switch’s accessible name.',
  },
  {
    prop: 'checked',
    type: 'boolean',
    meaning: 'Whether the setting is on. The thumb sits at the end of the track when on and at the start when off.',
  },
  {
    prop: 'onChange',
    type: '(checked: boolean) => void',
    meaning: 'Called with the next value when the user activates the switch. The caller stores the value, so the switch always shows what the caller passes in.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px row with body text. Compact is a 36 px row with small text. The track is a 32 px pill in standard, 24 px in compact, five thirds as wide as it is tall. Defaults to standard.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** A switch is one object in two states. Its thumb travels between them, so the change is shown, not stamped on. */
export default function SwitchDoc() {
  const [sync, setSync] = useState(false);
  const [awake, setAwake] = useState(true);

  return (
    <>
      <p className="rule-text">
        A switch turns one setting on or off. Its thumb is a circle, the same object in both states, so it travels from
        one end of the track to the other instead of being replaced. The track is the system's one pill: its shape is
        the thumb's path.
      </p>
      <Serves
        rules={[
          'motion-is-a-morph',
          'one-change-one-morph',
          'motion-is-interruptible',
          'reduced-motion-keeps-continuity',
          'respond-at-once',
          'state-lives-on-the-object',
          'sharp-corners-round-marks',
          'interactive-boundaries-meet-a-contrast-floor',
          'focus-is-a-signal-not-a-separator',
          'show-and-expose',
        ]}
      />
      <Example hint="Each switch starts in a different state. Press either one, or Tab to it and press Space. The thumb travels to the other end.">
        <div className="doc-switch-stack">
          <Switch label="Sync photos" checked={sync} onChange={setSync} />
          <Switch label="Keep screen awake" checked={awake} onChange={setAwake} />
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList caption="Switch props" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
