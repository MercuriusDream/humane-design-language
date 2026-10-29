import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Tabs, type TableColumn, type TabItem } from 'humane-system';
import { PropList } from '../components/PropList';
import './tabs.css';

const THREE: TabItem[] = [
  { id: 'walk', label: 'Walk', content: <p className="doc-tabs-text">Fog over the river until nine.</p> },
  { id: 'studio', label: 'Studio', content: <p className="doc-tabs-text">Window light only. North wall after three.</p> },
  { id: 'harbor', label: 'Harbor', content: <p className="doc-tabs-text">Long exposures from the breakwater.</p> },
];

const FIVE: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p className="doc-tabs-text">Forty photos in four sets.</p> },
  { id: 'photos', label: 'Photos', content: <p className="doc-tabs-text">Sorted by the day they were taken.</p> },
  { id: 'notes', label: 'Notes', content: <p className="doc-tabs-text">Bread, third attempt.</p> },
  { id: 'archive', label: 'Archive', content: <p className="doc-tabs-text">Rolls from the old camera.</p> },
  { id: 'shared', label: 'Shared with me', content: <p className="doc-tabs-text">Two sets from the harbor group.</p> },
];

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Accessible name of the tablist. It is not shown on screen.',
  },
  {
    prop: 'tabs',
    type: 'TabItem[]',
    meaning:
      'The tabs, in order. Each item has an id unique within the tabs, a label, and content. Only the content of the selected tab renders.',
  },
  {
    prop: 'value',
    type: 'string',
    meaning: 'Controlled selection, the id of the selected tab. Pass it together with onChange.',
  },
  {
    prop: 'onChange',
    type: '(id: string) => void',
    meaning: 'Called with the id of the tab the user picked. It is not called for the tab already selected.',
  },
  {
    prop: 'defaultValue',
    type: 'string',
    meaning: 'Uncontrolled initial selection. Defaults to the first tab.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px track with body text. Compact is a 36 px track with small text. Defaults to standard.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Tabs serves the motion rules: one raised plane travels between tabs, and selection is exposed to assistive technology. */
export default function TabsDoc() {
  const [selected, setSelected] = useState('notes');

  return (
    <>
      <p className="rule-text">
        A set of views where one is shown at a time. The raised plane under the selected label is one object that
        travels to the next label, so switching reads as a move, not a swap.
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

      <Example hint="Click a tab, or tab into a set and press Left or Right. A tab picked mid-move starts the plane from where it is.">
        <div className="doc-tabs-stack">
          <Tabs label="Sets" tabs={THREE} defaultValue="walk" />
          <Tabs label="Library" tabs={FIVE} value={selected} onChange={setSelected} />
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow>
        caption="Props of Tabs"
        columns={PROP_COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
