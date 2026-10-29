import { useState } from 'react';
import { AppShell, Segmented, usePreferences, type Side, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './app-shell.css';

type PropRow = { prop: string; type: string; meaning: string };
type Column = 'reading' | 'wide';

const PROPS: PropRow[] = [
  {
    prop: 'title',
    type: 'string',
    meaning: 'The product name. The closed sidebar shows it beside the name of the current section.',
  },
  {
    prop: 'items',
    type: 'SidebarItem[]',
    meaning: 'The navigation. Each item has an id and a label, an optional href that makes it a link, and an optional count, a plain number.',
  },
  {
    prop: 'activeId',
    type: 'string',
    meaning: 'The id of the item the user is on. That item is marked as current, and the indicator moves to it.',
  },
  {
    prop: 'onSelect?',
    type: '(id: string) => void',
    meaning: 'Called when the user picks an item. In overlay mode, picking an item also closes the sidebar. Docking begins at 62.5em, approximately 1000px with the default 16px browser font.',
  },
  {
    prop: 'navLabel?',
    type: 'string',
    meaning: 'The accessible name of the navigation. Defaults to "Navigation".',
  },
  {
    prop: 'sidebarExtra?',
    type: 'ReactNode',
    meaning: 'Content below the navigation inside the sidebar, such as preferences.',
  },
  {
    prop: 'column?',
    type: "'reading' | 'wide'",
    meaning: 'The width of the centered column. Reading is a text measure. Wide is for lists and panes. Defaults to reading.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'The page content, centered in the space beside the sidebar.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const ITEMS = [
  { id: 'today', label: 'Today', count: 3 },
  { id: 'week', label: 'This week' },
  { id: 'archive', label: 'Archive' },
];

const BODY: Record<string, string> = {
  today: 'Three items are due before noon.',
  week: 'Seven items across five days.',
  archive: 'Two hundred older items, kept in order.',
};

const SIDE_OPTIONS: { value: Side; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const COLUMN_OPTIONS: { value: Column; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'wide', label: 'Wide' },
];

/** The page frame of the language. This page uses it too, so the sidebar at its edge is this component. */
export default function AppShellDoc() {
  const { side, setSide } = usePreferences();
  const [activeId, setActiveId] = useState('today');
  const [column, setColumn] = useState<Column>('reading');

  return (
    <>
      <p className="rule-text">
        The page frame: a sidebar on the left or the right holds primary navigation, and the content sits centered in the
        space beside it. The sidebar is one root surface that collapses into a small surface naming the current section, and
        grows back out of it.
      </p>
      <Serves
        rules={[
          'navigation-is-a-sidebar-that-morphs',
          'content-is-centered',
          'never-take-control-from-the-user',
          'duration-grows-with-scale-and-the-difference-shows',
        ]}
      />
      <Example
        hint="Collapse the sidebar, then open it again: the open panel and the closed surface are one object. Side is the page setting too, so this page's sidebar moves with it."
        controls={
          <>
            <Segmented label="Side" options={SIDE_OPTIONS} value={side} onChange={setSide} size="compact" />
            <Segmented label="Column" options={COLUMN_OPTIONS} value={column} onChange={setColumn} size="compact" />
          </>
        }
      >
        <div className="doc-app-shell-stage">
          <AppShell
            title="Notes"
            items={ITEMS}
            activeId={activeId}
            onSelect={setActiveId}
            navLabel="Example sections"
            column={column}
          >
            <div className="doc-app-shell-page">
              <h4 className="doc-app-shell-heading">{ITEMS.find((item) => item.id === activeId)?.label}</h4>
              <p className="doc-app-shell-text">{BODY[activeId]}</p>
            </div>
          </AppShell>
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList caption="Props of AppShell" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
