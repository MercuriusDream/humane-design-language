import { useState } from 'react';
import { Button, RadioGroup, type RadioOption, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './radio-group.css';

type Delivery = 'standard' | 'express' | 'pickup';
type Reminder = 'never' | 'daily' | 'weekly';

const DELIVERY: RadioOption<Delivery>[] = [
  { value: 'standard', label: 'Standard', hint: 'Arrives in 3 to 5 days' },
  { value: 'express', label: 'Express', hint: 'Arrives tomorrow' },
  { value: 'pickup', label: 'Pick up', hint: 'Ready at the store today' },
];

const REMINDER: RadioOption<Reminder>[] = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'The visible name of the group, set as its legend. Assistive technology reads it as the name of the group.',
  },
  {
    prop: 'name',
    type: 'string',
    meaning: 'The native radio name that all options share. Arrow keys move within one name, so two groups on a page need two names.',
  },
  {
    prop: 'options',
    type: 'RadioOption<T>[]',
    meaning: 'The choices, in order. Each has a value, a label, and an optional hint shown beside the label. No option is styled as the default.',
  },
  {
    prop: 'value',
    type: 'T',
    meaning: 'The selected option’s value. The group is controlled: the dot shows this value, so the caller passes each new value back in.',
  },
  {
    prop: 'onChange',
    type: '(value: T) => void',
    meaning: 'Called with the value of the option the user chose.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px row with body text and a 20 px mark. Compact is a 36 px row with small text and a 16 px mark. Defaults to standard.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Exactly one choice from a short, visible list. Every option carries the same weight, so styling never steers the choice. */
export default function RadioGroupDoc() {
  const [delivery, setDelivery] = useState<Delivery>('standard');
  const [reminder, setReminder] = useState<Reminder>('daily');

  const reset = () => {
    setDelivery('standard');
    setReminder('daily');
  };

  return (
    <>
      <p className="rule-text">
        A radio group asks the user for exactly one choice from a short list that stays visible. Every option has the
        same weight, so the styling never pushes one choice over another. The mark beside each label is a circle, with a
        dot inside it for the chosen option.
      </p>
      <Serves
        rules={[
          'equal-consequence-equal-weight',
          'sharp-corners-round-marks',
          'interactive-boundaries-meet-a-contrast-floor',
          'focus-is-a-signal-not-a-separator',
          'motion-is-a-morph',
          'reduced-motion-keeps-continuity',
          'show-and-expose',
        ]}
      />
      <Example
        hint="Select an option with the mouse, or tab into a group and use the arrow keys. Reset returns both groups to their starting choice."
        controls={
          <Button size="compact" onClick={reset}>
            Reset
          </Button>
        }
      >
        <div className="doc-radio-group-specimens">
          <RadioGroup
            label="Delivery"
            name="doc-radio-group-delivery"
            options={DELIVERY}
            value={delivery}
            onChange={setDelivery}
          />
          <RadioGroup
            label="Reminder"
            name="doc-radio-group-reminder"
            options={REMINDER}
            value={reminder}
            onChange={setReminder}
          />
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList caption="RadioGroup props" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
