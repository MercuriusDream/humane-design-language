import { useState } from 'react';
import { Disclosure, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './disclosure.css';

const P = 'doc-disclosure';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'title',
    type: 'ReactNode',
    meaning: 'The name of the row. It is the text of the button that opens and closes it.',
  },
  {
    prop: 'meta',
    type: 'ReactNode (optional)',
    meaning: 'A plain value such as a count, shown at the end of the row in tertiary ink. It is never a badge.',
  },
  {
    prop: 'open',
    type: 'boolean (optional)',
    meaning: 'The open state when the parent controls it. Pair it with onOpenChange. When it is omitted, the row keeps its own state.',
  },
  {
    prop: 'onOpenChange',
    type: '(open: boolean) => void (optional)',
    meaning: 'Called with the next open state each time the user opens or closes the row. The parent stores it when it controls open.',
  },
  {
    prop: 'defaultOpen',
    type: 'boolean (optional)',
    meaning: 'The starting open state when the row is uncontrolled. Defaults to false.',
  },
  {
    prop: 'depth',
    type: '1 | 2 (optional)',
    meaning: 'The depth of the surface the row sits on. It sets the 2 px corner of the row. The inset does not change with depth. Defaults to 1.',
  },
  {
    prop: 'children',
    type: 'ReactNode (optional)',
    meaning: 'The content revealed when the row is open. It stays in the page while closed and is hidden from assistive technology.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px header with body text. Compact is a 36 px header with small text. Defaults to standard.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '25%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '25%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Rules: the row grows in place, its duration follows the height it covers, and its state is exposed. */
export default function DisclosureDoc() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <p className="rule-text">
        A disclosure is a row that opens in place to show its content. The closed row and the open row are the same
        object, so the user sees the content arrive from the row that they opened.
      </p>

      <Serves
        rules={[
          'motion-is-a-morph',
          'duration-grows-with-scale-and-the-difference-shows',
          'motion-is-interruptible',
          'reduced-motion-keeps-continuity',
          'show-and-expose',
          'divide-with-planes',
        ]}
      />

      <Example
        hint="Open a row by its header, or turn on the switch to open the first row from outside. Press a header while its row is still moving to reverse it. Metadata is nested in Photos at depth 2."
        controls={
          <Switch label="Open export settings" checked={settingsOpen} onChange={setSettingsOpen} size="compact" />
        }
      >
        <div className={`${P}-stack`}>
          <Disclosure title="Export settings" meta="3 options" open={settingsOpen} onOpenChange={setSettingsOpen}>
            <p className={`${P}-text`}>JPEG, quality 90, full size.</p>
          </Disclosure>

          <Disclosure title="Photos" meta="36" defaultOpen>
            <p className={`${P}-text`}>Fog over the river until nine. Window light only after three.</p>
            <Disclosure title="Metadata" meta="On" depth={2}>
              <p className={`${P}-text`}>Location and camera model are kept in each file.</p>
            </Disclosure>
          </Disclosure>
        </div>
      </Example>

      <div className={`${P}-props`}>
        <h4 className="doc-heading">Props</h4>
        <PropList caption="Props of Disclosure" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
      </div>
    </>
  );
}
