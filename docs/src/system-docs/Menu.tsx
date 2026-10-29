import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Menu, type MenuItem, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './menu.css';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Text of the trigger. The menu is labelled by its trigger for assistive technology.',
  },
  {
    prop: 'items',
    type: 'MenuItem[]',
    meaning: 'The actions, in order. Each one is a menuitem. Items are depth 1, so they take the 2 px corner inside the root.',
  },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'Depth of the surface the trigger sits on. The trigger takes the 2 px corner of that depth. The menu itself is a root, so it takes the 2 px corner.',
  },
  {
    prop: 'align',
    type: "'start' | 'end'",
    meaning: 'The edge of the trigger the menu lines up with. Use end when the trigger sits at the far edge of its region, so the menu opens inward.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'The trigger and the items take this size. Standard is 44 px with body text. Compact is 36 px with small text. Defaults to standard.',
  },
  {
    prop: 'items[].id',
    type: 'string',
    meaning: 'Stable key of the item in the list.',
  },
  {
    prop: 'items[].label',
    type: 'string',
    meaning: 'Text of the item. Sentence case, and a verb or a name the user can act on.',
  },
  {
    prop: 'items[].onSelect',
    type: '() => void',
    meaning: 'Runs right after the menu starts to close and focus returns to the trigger, so the action can move focus safely.',
  },
  {
    prop: 'items[].danger',
    type: 'boolean',
    meaning: 'Marks a destructive action. Its label is the only saturated text in the menu. Use it for destructive actions only.',
  },
  {
    prop: 'items[].disabled',
    type: 'boolean',
    meaning: 'Keeps the item in the list, dimmed, so the user can see it exists. It cannot be focused or chosen.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '26%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const FILE_ITEMS: MenuItem[] = [
  { id: 'rename', label: 'Rename', onSelect: () => {} },
  { id: 'duplicate', label: 'Duplicate', onSelect: () => {} },
  { id: 'share', label: 'Share', onSelect: () => {}, disabled: true },
  { id: 'delete', label: 'Delete', onSelect: () => {}, danger: true },
];

const SORT_ITEMS: MenuItem[] = [
  { id: 'newest', label: 'Newest first', onSelect: () => {} },
  { id: 'oldest', label: 'Oldest first', onSelect: () => {} },
  { id: 'name', label: 'Name', onSelect: () => {} },
];

const MORE_ITEMS: MenuItem[] = [
  { id: 'export', label: 'Export', onSelect: () => {} },
  { id: 'archive', label: 'Archive', onSelect: () => {} },
];

/** Menu serves the morph rules: the list grows out of its trigger and folds back into it. */
export default function MenuDoc() {
  const [chosen, setChosen] = useState<string | null>(null);

  // Wrap each item's action so the example reports the choice in the page, not only in the menu.
  const report = (items: MenuItem[]): MenuItem[] =>
    items.map((item) => ({ ...item, onSelect: () => setChosen(item.label) }));

  return (
    <>
      <p className="rule-text">
        A short list of actions that grows out of its trigger. Opening the list grows it from the button, and closing it
        folds it back into the same button, so the two read as one object.
      </p>
      <Serves
        rules={[
          'motion-is-a-morph',
          'new-things-grow-from-their-trigger',
          'motion-is-interruptible',
          'reduced-motion-keeps-continuity',
          'never-take-control-from-the-user',
          'focus-is-a-signal-not-a-separator',
          'show-and-expose',
        ]}
      />

      <Example hint="Open a menu by clicking its trigger or pressing Enter. Move with the arrow keys, Home, and End. Escape closes it and returns focus to the trigger. Delete is the only red item, and Share is disabled.">
        <div className="doc-menu-stage">
          <div className="doc-menu-row">
            <Menu label="File" items={report(FILE_ITEMS)} />
            <Menu label="Sort" align="end" items={report(SORT_ITEMS)} />
            <Menu label="More" items={report(MORE_ITEMS)} />
          </div>
          <p className="doc-menu-result" aria-live="polite">
            {chosen ? `Chosen: ${chosen}.` : 'Nothing chosen yet.'}
          </p>
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow>
        caption="Props of Menu"
        columns={PROP_COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
