import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Segmented, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './segmented.css';

type Option = { value: string; label: string };

const TWO: Option[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const THREE: Option[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const FOUR: Option[] = [
  { value: 'all', label: 'All' },
  { value: 'photos', label: 'Photos' },
  { value: 'notes', label: 'Notes' },
  { value: 'archive', label: 'Archive' },
];

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Visible name of the group. The group is labelled by it for assistive technology.',
  },
  {
    prop: 'options',
    type: '{ value: T; label: string }[]',
    meaning:
      'The choices, in order. Each one is a button. They share the width equally unless a label needs more, and wrap onto a second line when they cannot fit, so the track never scrolls.',
  },
  {
    prop: 'value',
    type: 'T',
    meaning: 'The chosen option. Its button is pressed, the indicator moves under it, and its label takes the strongest ink. Selection never changes the weight.',
  },
  {
    prop: 'onChange',
    type: '(value: T) => void',
    meaning: 'Called with the value of the option the user picked. The component is controlled and never changes value on its own.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px track with body text. Compact is a 36 px track with small text, for a narrow controls column. Defaults to standard.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Segmented serves the motion rules: the indicator is one object that travels between options. */
export default function SegmentedDoc() {
  const [theme, setTheme] = useState('light');
  const [range, setRange] = useState('week');
  const [scope, setScope] = useState('photos');

  return (
    <>
      <p className="rule-text">
        A choice between a few options, shown as a track with one indicator. The indicator is the same object for every
        choice, so picking an option moves it instead of replacing it.
      </p>
      <Serves
        rules={[
          'motion-is-a-morph',
          'one-change-one-morph',
          'motion-is-interruptible',
          'reduced-motion-keeps-continuity',
          'equal-consequence-equal-weight',
          'show-and-expose',
        ]}
      />

      <Example hint="Pick an option, then pick another before the indicator lands. It moves from where it is. Tab to an option and press Space or Enter.">
        <div className="doc-segmented-stack">
          <Segmented label="Theme" options={TWO} value={theme} onChange={setTheme} />
          <Segmented label="Range" options={THREE} value={range} onChange={setRange} />
          <Segmented label="Show" options={FOUR} value={scope} onChange={setScope} />
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow>
        caption="Props of Segmented"
        columns={PROP_COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
