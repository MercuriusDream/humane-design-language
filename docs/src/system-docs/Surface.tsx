import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Name, TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Segmented, Surface, Switch, type Plane, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './surface.css';

type InnerPlane = Extract<Plane, 'sunken' | 'base' | 'fill'>;

const INNER_PLANES: { value: InnerPlane; label: string }[] = [
  { value: 'sunken', label: 'Sunken' },
  { value: 'base', label: 'Base' },
  { value: 'fill', label: 'Fill' },
];

type PropRow = { prop: string; type: string; meaning: ReactNode };

const PROPS: PropRow[] = [
  {
    prop: 'depth',
    type: '0 | 1 | 2',
    meaning: 'Nesting depth, default 0. Depth 0 is a root and takes the 2 px corner. Depth 1 and 2 take the same 2 px corner, and the padding for their depth.',
  },
  {
    prop: 'plane',
    type: "'sunken' | 'base' | 'raised' | 'fill' | 'none'",
    meaning: "Lightness of the plane, default 'raised'. 'none' sets no background, so the element only groups its content.",
  },
  {
    prop: 'padded',
    type: 'boolean',
    meaning: 'Pads with the step for this depth: 16 px at depth 0, 12 px at depth 1, 8 px at depth 2, measured to the ink. Default true. Turn it off when the content sets its own spacing.',
  },
  {
    prop: 'as',
    type: 'ElementType',
    meaning: 'Element to render, default div. Use a semantic element such as section when the plane has a role.',
  },
  {
    prop: 'className',
    type: 'string',
    meaning: (
      <>
        Added to the <Name>h-surface</Name> class. The component never replaces its own class.
      </>
    ),
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'Content of the plane. Pass the next depth explicitly to nested surfaces; depth is not inherited and defaults to 0.',
  },
  {
    prop: 'Other HTML attributes',
    type: 'HTMLAttributes<HTMLElement>',
    meaning: (
      <>
        Passed to the element, such as id, role, and <Name>aria-*</Name> attributes.
      </>
    ),
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '22%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

type Readout = { pad: string; radius: string };

const EMPTY: Readout[] = [
  { pad: '', radius: '' },
  { pad: '', radius: '' },
  { pad: '', radius: '' },
];

/**
 * Reads each level's padding token and its rendered radius, so the labels state what the system gives, never a
 * copy of it. The root's radius is the 2px cap, so the readout stays 2 as the root resizes.
 */
function useReadouts(padded: boolean) {
  const refs = [useRef<HTMLElement>(null), useRef<HTMLElement>(null), useRef<HTMLElement>(null)];
  const [readouts, setReadouts] = useState<Readout[]>(EMPTY);

  useEffect(() => {
    const root = refs[0].current;
    if (!root) return;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      // A frame later, so the root's radius has been set from its new size.
      frame = requestAnimationFrame(() => {
        setReadouts(
          refs.map((ref, depth) => {
            const el = ref.current;
            if (!el) return { pad: '', radius: '' };
            const style = getComputedStyle(el);
            const pad = padded ? parseFloat(style.getPropertyValue(`--pad-${depth}`)) : 0;
            return { pad: `${Math.round(pad)}`, radius: `${Math.round(parseFloat(style.borderTopLeftRadius))}` };
          }),
        );
      });
    };
    const sizes = new ResizeObserver(read);
    sizes.observe(root);
    read();
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
    };
    // The refs are stable; padding is the only input that changes what is read.
  }, [padded]);

  return { refs, readouts };
}

function LevelLabel({ name, readout }: { name: string; readout: Readout }) {
  return (
    <p className="doc-surface-label">
      <span className="doc-surface-name">{name}</span>
      {readout.radius && (
        <span className="doc-surface-values">
          Padding {readout.pad} px, radius {readout.radius} px
        </span>
      )}
    </p>
  );
}

/** Serves the layout of every floating or nested region: one plane, with radius and padding from depth. */
export default function SurfaceDoc() {
  const [plane, setPlane] = useState<InnerPlane>('base');
  const [padded, setPadded] = useState(true);
  const { refs, readouts } = useReadouts(padded);

  return (
    <>
      <p className="rule-text">
        A plane of one lightness. Each boundary comes from a difference in lightness, not from a line, and every
        depth takes the same 2 px corner. Padding uses explicit depth.
      </p>
      <Serves
        rules={[
          'divide-with-planes',
          'sharp-corners-round-marks',
          'corners-are-small-never-chosen',
          'padding-follows-depth-not-size',
          'padding-is-small-text-is-large',
        ]}
      />
      <Example
        bare
        hint="Change the plane of depth 1. Every depth takes the same 2 px corner; padding is what changes with depth. Turning padding off removes the inset space."
        controls={
          <>
            <Segmented label="Depth 1 plane" options={INNER_PLANES} value={plane} onChange={setPlane} size="compact" />
            <Switch label="Padded" checked={padded} onChange={setPadded} size="compact" />
          </>
        }
      >
        <Surface ref={refs[0]} depth={0} plane="raised" padded={padded} className="doc-surface-level">
          <LevelLabel name="Depth 0, root" readout={readouts[0]} />
          <Surface ref={refs[1]} depth={1} plane={plane} padded={padded} className="doc-surface-level">
            <LevelLabel name="Depth 1" readout={readouts[1]} />
            <Surface ref={refs[2]} depth={2} plane="raised" padded={padded} className="doc-surface-level">
              <LevelLabel name="Depth 2" readout={readouts[2]} />
            </Surface>
          </Surface>
        </Surface>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <div className="doc-surface-props">
        <PropList caption="Surface props" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
      </div>
    </>
  );
}
