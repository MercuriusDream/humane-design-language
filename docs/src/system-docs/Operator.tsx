import { useState } from 'react';
import { Button, Operator, Segmented, Surface, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './operator.css';

type Context = 'sign-in' | 'pay' | 'record';

type Scene = {
  value: Context;
  label: string;
  operator: string;
  detail?: string;
  decision: string;
  action: string;
};

const SCENES: Scene[] = [
  {
    value: 'sign-in',
    label: 'Sign in',
    operator: 'Ferrow Mail',
    detail: 'Signed in as mina@example.com',
    decision: 'Allow this app to read your messages?',
    action: 'Allow',
  },
  {
    value: 'pay',
    label: 'Pay',
    operator: 'Harbor Transit',
    detail: 'Paying with the card ending 4411',
    decision: 'Pay 42.00 for a 30-day pass.',
    action: 'Pay',
  },
  {
    value: 'record',
    label: 'Record',
    operator: 'City Land Registry',
    detail: 'Filing as notary Jon Ash',
    decision: 'File this deed in the public register.',
    action: 'File',
  },
];

const OPTIONS: { value: Context; label: string }[] = SCENES.map((scene) => ({ value: scene.value, label: scene.label }));

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'operator',
    type: 'string',
    meaning: 'Who runs the service. It leads the line in weight 600, so the name is read first.',
  },
  {
    prop: 'detail',
    type: 'string (optional)',
    meaning: 'Who is asking or signed in, such as "Signed in as mina@example.com". It follows the name after a period.',
  },
  {
    prop: 'href',
    type: 'string (optional)',
    meaning: 'Where to learn more. When set, the line ends with a link, "About this service", at a 44 px target.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Operator serves "Say who is behind it." It is one line beside the decision it names, so it is read before the choice. */
export default function OperatorDoc() {
  const [context, setContext] = useState<Context>('sign-in');
  const [showLink, setShowLink] = useState(true);
  const scene = SCENES.find((s) => s.value === context) ?? SCENES[0];

  return (
    <>
      <p className="rule-text">
        Operator states who runs a service and who is asking, on any screen where the user decides something with
        consequences. It is one quiet line, placed next to the decision it names.
      </p>
      <Serves rules={['say-who-is-behind-it', 'explain-at-the-point-of-action-or-not-at-all']} />

      <Example
        hint="Pick a decision. Turn the link off to see the line without it. Tab to the link and press Enter."
        controls={
          <div className="doc-operator-controls">
            <Segmented label="Decision" options={OPTIONS} value={context} onChange={setContext} size="compact" />
            <Switch label="About link" checked={showLink} onChange={setShowLink} size="compact" />
          </div>
        }
      >
        <Surface depth={1} className="doc-operator-card">
          <Operator
            operator={scene.operator}
            detail={scene.detail}
            href={showLink ? '#say-who-is-behind-it' : undefined}
          />
          <p className="doc-operator-decision">{scene.decision}</p>
          <div className="doc-operator-actions">
            <Button variant="strong" depth={1}>
              {scene.action}
            </Button>
            <Button depth={1}>Cancel</Button>
          </div>
        </Surface>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList caption="Props of Operator" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
