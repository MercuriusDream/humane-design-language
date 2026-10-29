import { useState } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { ProgressSurface, Segmented, Slider, Surface, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './progress-surface.css';

const MAX = 40;

type Depth = '1' | '2';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'value',
    type: 'number',
    meaning: 'How much of the work is done, in the same unit as max. Finite values below 0 are shown as 0 and values above max as max. Non-finite inputs show no fill.',
  },
  {
    prop: 'max',
    type: 'number',
    meaning: 'The amount that counts as complete. Must be finite and greater than 0. Otherwise the surface shows no fill.',
  },
  {
    prop: 'label',
    type: 'string',
    meaning: 'The accessible name of the progress. Assistive technology reads it with the value and max.',
  },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'Depth of the surface. Its radius and padding come from that depth. Defaults to 1.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'The content of the surface. It draws above the fill, so the text stays readable as the fill grows.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const DEPTH_OPTIONS: { value: Depth; label: string }[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
];

function Row({ value, depth = 1, label }: { value: number; depth?: 1 | 2; label: string }) {
  return (
    <ProgressSurface value={value} max={MAX} label={label} depth={depth}>
      <div className="doc-progress-surface-row">
        <p className="doc-progress-surface-title">Photos</p>
        <p className="doc-progress-surface-count">
          {Math.round(value)} of {MAX}
        </p>
      </div>
    </ProgressSurface>
  );
}

/** The surface fills with its own plane, so the fill is the progress and no bar or badge sits beside the content. */
export default function ProgressSurfaceDoc() {
  const [value, setValue] = useState(16);
  const [depth, setDepth] = useState<Depth>('1');

  const live = (
    <Row value={value} depth={depth === '2' ? 2 : 1} label={`Photos exported, ${value} of ${MAX}`} />
  );

  return (
    <>
      <p className="rule-text">
        A surface whose own plane fills from the start edge as work completes. The fill is the progress, so the surface
        needs no bar or badge beside its content. Duration follows the changed fraction of the measured track width
        in pixels. Reduced motion updates the fill without travel and adds a brief opacity change in place.
      </p>
      <Serves
        rules={[
          'divide-with-planes',
          'state-lives-on-the-object',
          'show-and-expose',
          'one-change-one-morph',
          'reduced-motion-keeps-continuity',
          'nothing-moves-idle',
        ]}
      />

      <Example
        hint="Move the slider to fill the live surface. Set depth to 2 to see the surface sit inside a panel, with the padding and radius of depth 2."
        controls={
          <div className="doc-progress-surface-controls">
            <Slider size="compact" label="Photos exported" value={value} min={0} max={MAX} onChange={setValue} />
            <Segmented label="Depth" options={DEPTH_OPTIONS} value={depth} onChange={setDepth} size="compact" />
          </div>
        }
      >
        <div className="doc-progress-surface-stack">
          <Row value={0} label={`Photos exported, 0 of ${MAX}`} />
          {depth === '2' ? (
            <Surface depth={1} plane="base" className="doc-progress-surface-panel">
              {live}
            </Surface>
          ) : (
            live
          )}
          <Row value={MAX} label={`Photos exported, ${MAX} of ${MAX}`} />
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow> caption="ProgressSurface props" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
