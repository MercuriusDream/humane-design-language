import { useEffect, useRef, useState } from 'react';
import { Button, Placeholder, Segmented, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './placeholder.css';

type Shape = 'lines' | 'block';

const LOAD_MS = 1600;

const NOTE =
  'This content stays mounted while loading, so its known geometry reserves the space. Readiness changes visibility, not the box height.';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'ready',
    type: 'boolean',
    meaning: 'False while loading. True once the content is there. Required.',
  },
  {
    prop: 'lines',
    type: 'number',
    meaning: 'Decorative text-line bars over the reserved footprint. They do not determine its height. Defaults to 3.',
  },
  {
    prop: 'height',
    type: 'number',
    meaning: 'Authoritative viewport height in px before and after loading. Overflowing content scrolls internally. Supply this when final content geometry is not available.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'Keep final-geometry content mounted while loading. It is hidden and inert until ready but reserves its natural space. Changing its geometry may change layout unless height is supplied.',
  },
  {
    prop: 'readyAnnouncement',
    type: 'string (optional)',
    meaning: 'A polite completion announcement when ready becomes true. Omit when the surrounding task already announces completion.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '22%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Loading content that keeps its final shape. Serves the agency and continuity rules. */
export default function PlaceholderDoc() {
  const [shape, setShape] = useState<Shape>('lines');
  const [ready, setReady] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reload = () => {
    window.clearTimeout(timer.current);
    setReady(false);
    timer.current = window.setTimeout(() => setReady(true), LOAD_MS);
  };

  return (
    <>
      <p className="rule-text">
        Reserves known geometry while content loads, then crossfades in place. Keep final-geometry children mounted
        from the start, or provide an authoritative height that stays fixed in both states. Unknown content dimensions
        cannot be reserved automatically; a fixed viewport keeps overflow available by internal scrolling.
      </p>
      <Serves
        rules={[
          'reserve-space-for-what-is-loading',
          'motion-is-a-morph',
          'nothing-moves-idle',
          'never-move-what-the-user-is-about-to-touch',
          'reduced-motion-keeps-continuity',
        ]}
      />
      <Example
        hint="Choose natural content geometry or a fixed 120px viewport, then reload to watch the crossfade. Reload again while it loads to restart."
        controls={
          <div className="doc-placeholder-controls">
            <Segmented
              label="Shape"
              value={shape}
              onChange={setShape}
              options={[
                { value: 'lines', label: 'Natural height' },
                { value: 'block', label: 'Fixed height' },
              ]}
              size="compact"
            />
            <Button variant="strong" size="compact" onClick={reload}>
              Reload
            </Button>
          </div>
        }
      >
        <div className="doc-placeholder-specimen">
          {shape === 'lines' ? (
            <Placeholder ready={ready} lines={3}>
              <p className="doc-placeholder-note">{NOTE}</p>
            </Placeholder>
          ) : (
            <Placeholder ready={ready} height={120}>
              <p className="doc-placeholder-note">{NOTE}</p>
            </Placeholder>
          )}
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow> caption="Placeholder props" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
