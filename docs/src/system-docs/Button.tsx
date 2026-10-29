import { useState, type ReactNode } from 'react';
import { Button, Segmented, Surface, Switch, type ButtonVariant, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { Name, TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './button.css';

type Depth = '1' | '2';

const VARIANTS = [
  { variant: 'default', label: 'Edit' },
  { variant: 'strong', label: 'Save' },
  { variant: 'quiet', label: 'Cancel' },
  { variant: 'danger', label: 'Delete' },
] as const;

// Equal consequence, equal weight: both choices take the same variant.
const PAIR = [
  { variant: 'default', label: 'Accept' },
  { variant: 'default', label: 'Decline' },
] as const;

type PropRow = { prop: string; type: string; meaning: ReactNode };

const PROPS: PropRow[] = [
  {
    prop: 'variant',
    type: "'default' | 'strong' | 'quiet' | 'danger'",
    meaning:
      'The role of the action. Default is a control plane. Strong is the one main action of a region, set in ink. Quiet has no plane until hovered. Danger marks a destructive action and is the only saturated variant. Defaults to default.',
  },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'Depth of the surface the button sits on. The button takes the 2 px corner of that depth. Defaults to 1.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning:
      'Standard is the control height, 44 px, with body text. Compact is 36 px with small text, for a dense region such as a narrow controls column. Defaults to standard.',
  },
  {
    prop: 'type',
    type: "'button' | 'submit' | 'reset'",
    meaning: 'Defaults to button, so a button inside a form does not submit it unless asked.',
  },
  {
    prop: 'className',
    type: 'string',
    meaning: (
      <>
        Added after the <Name>h-button</Name> class.
      </>
    ),
  },
  {
    prop: 'ref',
    type: 'Ref<HTMLButtonElement>',
    meaning: 'Forwarded to the button element.',
  },
  {
    prop: 'Other attributes',
    type: 'ButtonHTMLAttributes',
    meaning: (
      <>
        Pass through to the element, such as disabled, onClick, and <Name>aria-*</Name>.
      </>
    ),
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '22%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** A plane identified by its label. Serves the contrast, saturation, and weight rules. */
export default function ButtonDoc() {
  const [depth, setDepth] = useState<Depth>('1');
  const [disabled, setDisabled] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const renderButtons = (items: readonly { variant: ButtonVariant; label: string }[]) =>
    items.map(({ variant, label }) => (
      <Button
        key={label}
        variant={variant}
        depth={depth === '2' ? 2 : 1}
        disabled={disabled}
        onClick={() => setLast(label)}
      >
        {label}
      </Button>
    ));

  const buttons = (
    <div className="doc-button-stack">
      <div className="doc-button-row">{renderButtons(VARIANTS)}</div>
      <div className="doc-button-row">{renderButtons(PAIR)}</div>
    </div>
  );

  return (
    <>
      <p className="rule-text">
        A button is a plane identified by its label, not by its color. Its variant says what the action weighs, and
        saturation appears only on danger, so choices with equal consequence take the same variant.
      </p>
      <Serves
        rules={[
          'interactive-boundaries-meet-a-contrast-floor',
          'saturation-belongs-to-state',
          'spend-signals-on-a-budget',
          'equal-consequence-equal-weight',
          'respond-at-once',
          'corners-are-small-never-chosen',
        ]}
      />
      <Example
        hint="Switch depth and disabled, then press a button. The result shows on the line below."
        controls={
          <div className="doc-button-controls">
            <Segmented
              label="Depth"
              value={depth}
              onChange={setDepth}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
              ]}
              size="compact"
            />
            <Switch label="Disabled" checked={disabled} onChange={setDisabled} size="compact" />
          </div>
        }
      >
        <div className="doc-button-specimen" data-depth={depth}>
          {depth === '2' ? (
            <Surface depth={1} plane="raised" className="doc-button-panel">
              {buttons}
            </Surface>
          ) : (
            buttons
          )}
          <p className="doc-button-status" role="status" aria-live="polite">
            {last ? `Last pressed: ${last}.` : 'No button pressed yet.'}
          </p>
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow>
        caption="Button props"
        columns={PROP_COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
