import { useState, type ReactNode } from 'react';
import { Button, List, ListRow, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { Name, TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './doc-list.css';

type Album = { id: string; title: string; description: string; count: number; unread: boolean };

const INITIAL: Album[] = [
  { id: 'walk', title: 'Morning walk', description: 'Fog over the river until nine.', count: 14, unread: true },
  {
    id: 'studio',
    title: 'Studio session',
    description: 'Window light only. The north wall works best after three.',
    count: 36,
    unread: false,
  },
  { id: 'harbor', title: 'Harbor at dusk', description: 'Long exposures from the breakwater.', count: 9, unread: true },
];

type PropRow = { prop: string; type: string; meaning: ReactNode };

const LIST_PROPS: PropRow[] = [
  {
    prop: 'label',
    type: 'string',
    meaning: 'Names the list for assistive technology. It is the accessible name of the group.',
  },
  {
    prop: 'dense',
    type: 'boolean',
    meaning: 'Rows touch and separate with a line. Otherwise rows are separated by a 2px gap of plane.',
  },
  { prop: 'children', type: 'ReactNode', meaning: 'The rows, in order. Use ListRow for each one.' },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard rows are 44 px with body text. Compact rows are 36 px with small text. Defaults to standard.',
  },
];

const ROW_PROPS: PropRow[] = [
  { prop: 'title', type: 'ReactNode', meaning: 'The name of the row. Wraps as needed, including when text is enlarged.' },
  { prop: 'meta', type: 'ReactNode', meaning: 'A count or value, aligned at the end in tertiary ink.' },
  {
    prop: 'description',
    type: 'ReactNode',
    meaning: 'Supporting text under the title. Wraps as needed rather than truncating.',
  },
  {
    prop: 'selected',
    type: 'boolean',
    meaning: (
      <>
        Whether the row is the current selection. It takes the fill plane and sets <Name>aria-current</Name>.
      </>
    ),
  },
  {
    prop: 'unread',
    type: 'boolean',
    meaning: 'Unread titles are heavier and stronger. Read titles recede so the unread ones stand out.',
  },
  {
    prop: 'onSelect',
    type: '() => void',
    meaning: 'Makes the row a button that calls this when activated. Without it, the row is plain content.',
  },
  {
    prop: 'end',
    type: 'ReactNode',
    meaning: 'Trailing actions, such as a button. A row with onSelect is already a button, so its actions cannot go inside it. Leave onSelect off that row.',
  },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'The depth of the surface the list sits on. It sets the 2 px corner of the first and last rows.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** A list separates its rows with planes of lightness. Lines appear only when the list is dense. */
export default function ListDoc() {
  const [albums, setAlbums] = useState<Album[]>(INITIAL);
  const [selected, setSelected] = useState<string | null>('studio');
  const [dense, setDense] = useState(false);
  const [pinned, setPinned] = useState(false);

  const select = (id: string) => {
    setSelected(id);
    setAlbums((current) => current.map((album) => (album.id === id ? { ...album, unread: false } : album)));
  };

  return (
    <>
      <p className="rule-text">
        A list holds repeated rows of the same kind. Its rows separate with planes of lightness and with whitespace, so
        they need no lines unless the list is dense.
      </p>
      <Serves
        rules={[
          'divide-with-planes',
          'lines-are-for-dense-repetition-only',
          'whitespace-is-syntax',
          'padding-is-small-text-is-large',
          'hierarchy-comes-from-lightness-then-hue-then-saturation',
          'corners-are-small-never-chosen',
          'sharp-corners-round-marks',
          'respond-at-once',
          'show-and-expose',
        ]}
      />

      <Example
        hint="Select a row. The selection moves there, and an unread title loses its weight. Turn on dense rows to see lines replace the gaps."
        controls={<Switch label="Dense rows" checked={dense} onChange={setDense} size="compact" />}
      >
        <div className="doc-list-stack">
          <List label="Albums" dense={dense}>
            {albums.map((album) => (
              <ListRow
                key={album.id}
                title={album.title}
                description={album.description}
                meta={album.count}
                unread={album.unread}
                selected={selected === album.id}
                onSelect={() => select(album.id)}
                depth={2}
              />
            ))}
            <ListRow
              title="Kitchen notes"
              description="Bread, third attempt."
              meta={5}
              depth={2}
              end={
                <Button variant="quiet" depth={2} onClick={() => setPinned(!pinned)}>
                  {pinned ? 'Unpin' : 'Pin'}
                </Button>
              }
            />
          </List>
        </div>
      </Example>

      <div className="doc-list-props">
        <div className="doc-list-props-group">
          <h4 className="doc-heading">List props</h4>
          <PropList caption="List props" columns={COLUMNS} rows={LIST_PROPS} rowKey={(row) => row.prop} />
        </div>
        <div className="doc-list-props-group">
          <h4 className="doc-heading">ListRow props</h4>
          <PropList caption="ListRow props" columns={COLUMNS} rows={ROW_PROPS} rowKey={(row) => row.prop} />
        </div>
      </div>
    </>
  );
}
