import { useState, type CSSProperties } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { PropList } from '../components/PropList';
import { Serves } from '../components/Serves';
import { morphDuration, Segmented, Switch, Table, type TableColumn } from 'humane-system';
import './table.css';

type PropRow = { prop: string; type: string; meaning: string };

type FileRow = { id: string; name: string; kind: string; size: string; changed: string };

const FILES: FileRow[] = [
  { id: 'harbor', name: 'Harbor_0412.dng', kind: 'Raw image', size: '48.2', changed: 'Oct 12' },
  { id: 'studio', name: 'Studio_0930.dng', kind: 'Raw image', size: '51.7', changed: 'Sep 30' },
  { id: 'walk', name: 'Morning_walk.jpg', kind: 'JPEG', size: '6.4', changed: 'Sep 28' },
  { id: 'bread', name: 'Bread_notes.md', kind: 'Text', size: '0.01', changed: 'Sep 14' },
  { id: 'river', name: 'River_fog.tif', kind: 'TIFF', size: '112.9', changed: 'Aug 3' },
];

const PROPS: PropRow[] = [
  {
    prop: 'caption',
    type: 'string',
    meaning:
      'Names the table. It is visually hidden, read by assistive technology, and used as the name of the scrolling region.',
  },
  {
    prop: 'columns',
    type: 'TableColumn<T>[]',
    meaning:
      'One entry per column, in order. Each entry has a key that is unique, a header for the header cell, and a render function that returns the cell for a row. Optional align is start or end, and end suits numbers. Optional width takes any CSS width.',
  },
  {
    prop: 'rows',
    type: 'T[]',
    meaning:
      'The data, one entry per row. Rows repeat, so each row after the first is separated from the one above by a line. An empty array renders the header with no rows.',
  },
  {
    prop: 'rowKey',
    type: '(row: T) => string',
    meaning:
      'Returns a unique, stable key for each row, so React keeps each row’s identity when the data changes.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const FILE_COLUMNS: TableColumn<FileRow>[] = [
  { key: 'name', header: 'File', width: '40%', render: (row) => row.name },
  { key: 'kind', header: 'Type', render: (row) => row.kind },
  { key: 'size', header: 'Size (MB)', align: 'end', render: (row) => row.size },
  { key: 'changed', header: 'Changed', render: (row) => row.changed },
];

/** The frame narrows by about this many pixels in the example. The morph lasts as long as that change. */
const NARROW_CHANGE_PX = 400;

const COUNTS = [
  { value: '3', label: 'Three' },
  { value: '5', label: 'Five' },
];

/** A table holds repeated records. Its rows are separated by lines because they repeat too densely for whitespace alone. */
export default function TableDoc() {
  const [count, setCount] = useState('3');
  const [narrow, setNarrow] = useState(false);
  const rows = FILES.slice(0, Number(count));

  return (
    <>
      <p className="rule-text">
        A table shows the same kind of record in rows and columns, so the user can compare values down a column. It
        separates rows with lines, and it scrolls inside its own frame when there is not enough width.
      </p>
      <Serves
        rules={[
          'lines-are-for-dense-repetition-only',
          'structure-strengthens-with-contrast',
          'labels-are-set-like-text',
          'text-size-belongs-to-the-user',
        ]}
      />
      <Example
        hint="Change the number of rows, or narrow the frame. The frame narrows in place, and the table scrolls inside it while the page stays still. Tab to the table and use the arrow keys to scroll it. With high contrast on in your system, the row lines get thicker."
        controls={
          <>
            <Segmented label="Rows" options={COUNTS} value={count} onChange={setCount} size="compact" />
            <Switch label="Narrow frame" checked={narrow} onChange={setNarrow} size="compact" />
          </>
        }
      >
        <div
          className="doc-table-frame"
          data-narrow={narrow || undefined}
          style={{ '--dur': `${morphDuration(NARROW_CHANGE_PX)}ms` } as CSSProperties}
        >
          <Table caption="Exported files" columns={FILE_COLUMNS} rows={rows} rowKey={(row) => row.id} />
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow> caption="Props of Table" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
