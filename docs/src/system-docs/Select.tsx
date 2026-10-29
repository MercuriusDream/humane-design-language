import { useState } from 'react';
import { Select, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './select.css';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'unset';

const OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'unset', label: 'Not set' },
];

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  { prop: 'label', type: 'string', meaning: 'The visible label. It is also the accessible name of the control.' },
  { prop: 'value', type: 'T, a string union', meaning: 'The chosen option. The parent owns it, so the control is controlled.' },
  { prop: 'onChange', type: '(value: T) => void', meaning: 'Called with the typed value of the option the user picked.' },
  { prop: 'options', type: '{ value: T; label: string }[]', meaning: 'The choices. The value is stored; the label is what the user reads.' },
  { prop: 'hint', type: 'string (optional)', meaning: 'Short help under the label, above the control. It stays while an error is set, so pass none when the error says enough.' },
  { prop: 'error', type: 'string (optional)', meaning: 'What went wrong and what to do next, under the control. It marks the control invalid and is announced politely.' },
  { prop: 'depth', type: '1 | 2 (optional, default 1)', meaning: 'The depth of the surface the select sits on. The control takes the 2 px corner of that depth.' },
  { prop: 'size', type: "'standard' | 'compact'", meaning: 'Standard is a 44 px control with body text. Compact is a 36 px control with small text, for a dense region such as a toolbar. Defaults to standard.' },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '22%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '36%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Serves the contrast floor, saturation for state, and the rules for showing and explaining. */
export default function SelectDoc() {
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [nested, setNested] = useState(false);
  const depth = nested ? 2 : 1;

  const field = (
    <Select
      label="Summary frequency"
      value={frequency}
      onChange={setFrequency}
      options={OPTIONS}
      depth={depth}
      hint={frequency === 'unset' ? undefined : 'The team gets the summary at this interval.'}
      error={frequency === 'unset' ? 'Choose a frequency. The summary is not sent until one is set.' : undefined}
    />
  );

  return (
    <>
      <p className="rule-text">
        Picks one value from a list of options. Its label and value identify it, so no edge is drawn; the control plane
        carries the field.
        visible even on a calm surface.
      </p>
      <Serves
        rules={[
          'interactive-boundaries-meet-a-contrast-floor',
          'saturation-belongs-to-state',
          'show-and-expose',
          'explain-at-the-point-of-action-or-not-at-all',
        ]}
      />

      <Example
        hint="Pick Not set to see the error stated in words. The edge takes the danger signal. Put it inside a surface to see depth 2."
        controls={
          <div className="doc-select-controls">
            <Switch label="Inside a surface" checked={nested} onChange={setNested} size="compact" />
          </div>
        }
      >
        <div className="doc-select-stage">
          {/* Always mounted, so the select keeps its identity when depth changes; only the plane around it morphs. */}
          <div className="doc-select-plane" data-depth={depth}>
            {field}
          </div>
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <div className="doc-select-props">
        <PropList caption="Select props" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
      </div>
    </>
  );
}
