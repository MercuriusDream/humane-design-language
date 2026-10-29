import { Button, Surface, UndoableList, useUndoableList, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './undoable-list.css';

type Place = { id: string; title: string; meta: string };

type PropRow = { prop: string; type: string; meaning: string };

const PLACES: Place[] = [
  { id: 'bakery', title: 'Bakery on Fifth', meta: '4 saved' },
  { id: 'ferry', title: 'Ferry terminal', meta: '2 saved' },
  { id: 'library', title: 'River library', meta: '9 saved' },
  { id: 'garden', title: 'Market garden', meta: '1 saved' },
];

const PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'The accessible name of the list. Assistive technology reads it when the user enters the list.',
  },
  {
    prop: 'entries',
    type: 'UndoEntry<T>[]',
    meaning: 'Each item with its status: present, removed, or leaving. Comes from useUndoableList.',
  },
  {
    prop: 'remove',
    type: '(id: string) => void',
    meaning: 'Marks a present row removed. The row keeps its place and shows Undo. The list announces the removal.',
  },
  {
    prop: 'undo',
    type: '(id: string) => void',
    meaning: 'Restores a removed or leaving row. A collapsing row reverses from where it is.',
  },
  {
    prop: 'settle',
    type: '(heights?: Map<string, number>) => void',
    meaning: 'Moves removed rows to leaving. The list supplies measured row heights and calls it only after pointer and focus have both left.',
  },
  {
    prop: 'hold',
    type: '() => void',
    meaning: 'Required handler from useUndoableList. Cancels removal timers and returns leaving rows to removed when pointer or focus re-enters.',
  },
  {
    prop: 'renderLabel',
    type: '(item: T) => string',
    meaning: 'The plain name of an item, used in removal and restoration announcements.',
  },
  {
    prop: 'renderRow',
    type: '(item: T) => ReactNode (optional)',
    meaning: 'The content of a row in place of its name. It remains mounted during removal so its geometry is retained while the action changes to Undo.',
  },
  {
    prop: 'empty',
    type: 'string (optional)',
    meaning: 'Shown in tertiary ink when no entries remain. Without it, the list shows nothing.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact' (optional)",
    meaning: 'The tier of every row. The label takes its text and the Remove and Undo action its button size, so one row never mixes tiers. Standard by default.',
  },
  {
    prop: 'useUndoableList(initial)',
    type: 'T[], where T has an id',
    meaning: 'Starts the list with every item present. Its timers clear when the list unmounts.',
  },
  {
    prop: 'restoreAll(next?)',
    type: '(next?: T[]) => void',
    meaning: 'Returned by useUndoableList. Clears every timer and resets the list to its initial items, or to next.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '26%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** A removal that stays undoable in place. Serves the rules on undo, continuity, and exposing change. */
export default function UndoableListDoc() {
  const { entries, remove, undo, settle, hold, restoreAll } = useUndoableList(PLACES);

  return (
    <>
      <p className="rule-text">
        A list where removing a row needs no confirmation. The removed row keeps its place with an Undo control, and it
        collapses only after the pointer and focus leave the list, so nothing moves under the user.
      </p>
      <Serves
        rules={[
          'prefer-undo-to-confirmation',
          'removed-things-go-somewhere',
          'motion-is-interruptible',
          'never-move-what-the-user-is-about-to-touch',
          'show-and-expose',
        ]}
      />
      <Example
        hint="Remove a row, then press Undo. A removed row keeps its place until the pointer and focus leave the list."
        controls={
          <div className="doc-undoable-list-controls">
            <Button size="compact" onClick={() => restoreAll()}>
              Restore all
            </Button>
          </div>
        }
      >
        {/* The list sits on a base panel, as in a pane, so a removed row reads as a sunken step in its place. */}
        <Surface depth={1} plane="base" className="doc-undoable-list-specimen">
          <UndoableList<Place>
            label="Saved places"
            entries={entries}
            remove={remove}
            undo={undo}
            settle={settle}
            hold={hold}
            renderLabel={(item) => item.title}
            renderRow={(item) => (
              <>
                {item.title} <span className="doc-undoable-list-meta">{item.meta}</span>
              </>
            )}
            empty="No saved places. Restore all to bring them back."
          />
        </Surface>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow> caption="UndoableList props and useUndoableList" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
