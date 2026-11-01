import { useState } from 'react';
import { Slider, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './slider.css';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  { prop: 'label', type: 'string', meaning: 'The visible name, shown above the track. Assistive technology reads it with the value, such as Width 240 px.' },
  { prop: 'value', type: 'number', meaning: 'Current numeric value.' },
  { prop: 'min', type: 'number', meaning: 'Minimum value at the start of the track.' },
  { prop: 'max', type: 'number', meaning: 'Maximum value at the end of the track.' },
  { prop: 'onChange', type: '(value: number) => void', meaning: 'Called with the new number on every drag step or arrow key press.' },
  { prop: 'unit', type: 'string (optional)', meaning: 'Unit suffix shown after the value beside the label, such as px or %.' },
  { prop: 'size', type: "'standard' | 'compact'", meaning: 'Control tier: standard (44 px row) or compact (36 px row). Defaults to standard.' },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Rules: the track is the edge that identifies the control, the value is shown and exposed, and the thumb responds at once. */
export default function SliderDoc() {
  const [width, setWidth] = useState(240);
  const [opacity, setOpacity] = useState(100);
  const [volume, setVolume] = useState(0);

  return (
    <>
      <p className="rule-text">
        A slider picks one number between a minimum and a maximum. Its track is the only edge that identifies the
        control, so the track is drawn at the 3:1 contrast floor against the surface it sits on. The thumb is a mark, so
        it is a circle; the track is a line and has no corner.
      </p>
      <Serves
        rules={[
          'interactive-boundaries-meet-a-contrast-floor',
          'sharp-corners-round-marks',
          'show-and-expose',
          'respond-at-once',
        ]}
      />
      <Example hint="Drag a thumb, or focus a track and press the arrow keys. The number beside each label is the value the control reports.">
        <div className="doc-slider-stack">
          <Slider label="Width" value={width} min={120} max={480} unit="px" onChange={setWidth} />
          <Slider label="Opacity" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />
          <Slider label="Volume" value={volume} min={0} max={10} onChange={setVolume} />
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList
        caption="Slider props"
        columns={COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
