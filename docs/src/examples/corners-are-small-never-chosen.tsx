import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, Slider, Surface } from 'humane-system';
import { Example } from '../components/Example';
import './shared-demos.css';
import './corners-are-small-never-chosen.css';

const MIN_WIDTH = 240;
const MAX_WIDTH = 520;

type Measured = {
  /** Radius of the large and small roots, then of their depth 1 panels, then of the button. */
  radius: [number, number, number, number, number];
  floor: number;
};

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * A root's corner is capped at 2px, and every surface and control inside it takes the same cap.
 * Resizing the large root reads the same corner at every depth, so size never chooses it.
 */
export default function CornersAreSmallNeverChosen() {
  const [width, setWidth] = useState(420);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const read = () => {
      const radiusOf = (selector: string, index = 0) => {
        const el = root.querySelectorAll<HTMLElement>(selector)[index];
        return el ? round(parseFloat(getComputedStyle(el).borderTopLeftRadius)) : 0;
      };
      setMeasured({
        radius: [
          radiusOf('.ex-corners-are-small-never-chosen-root', 0),
          radiusOf('.ex-corners-are-small-never-chosen-root', 1),
          radiusOf('.ex-corners-are-small-never-chosen-panel', 0),
          radiusOf('.ex-corners-are-small-never-chosen-panel', 1),
          radiusOf('.h-button'),
        ],
        floor: parseFloat(getComputedStyle(root).getPropertyValue('--radius-floor')),
      });
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(root);
    return () => observer.disconnect();
  }, [width]);

  return (
    <Example
      hint="Resize the large root. Its corner stays 2px, and the surface and button inside it keep the same 2px corner."
      controls={
        <Slider
          size="compact"
          label="Large root width"
          value={width}
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          onChange={setWidth}
          unit="px"
        />
      }
    >
      <div className="ex-corners-are-small-never-chosen-stage" ref={stage}>
        <Surface
          depth={0}
          plane="raised"
          className="ex-corners-are-small-never-chosen-root"
          style={{ width, '--dur': '160ms' } as CSSProperties}
        >
          <p className="ex-corners-are-small-never-chosen-label">Large root</p>
          <Surface depth={1} plane="base" className="ex-corners-are-small-never-chosen-panel">
            <p className="ex-corners-are-small-never-chosen-text">The corner is the same at every depth.</p>
            <Button size="compact">Open</Button>
          </Surface>
        </Surface>

        <Surface depth={0} plane="raised" className="ex-corners-are-small-never-chosen-root">
          <p className="ex-corners-are-small-never-chosen-label">Small root</p>
          <Surface depth={1} plane="base" className="ex-corners-are-small-never-chosen-panel">
            <p className="ex-corners-are-small-never-chosen-text">Size does not change it.</p>
          </Surface>
        </Surface>

        {measured && (
          <dl className="readout">
            <div>
              <dt>Large root</dt>
              <dd>{measured.radius[0]} px</dd>
            </div>
            <div>
              <dt>Small root</dt>
              <dd>{measured.radius[1]} px</dd>
            </div>
            <div>
              <dt>Depth 1</dt>
              <dd>
                {measured.radius[2]} px and {measured.radius[3]} px
              </dd>
            </div>
            <div>
              <dt>Button</dt>
              <dd>{measured.radius[4]} px</dd>
            </div>
            <div>
              <dt>Floor</dt>
              <dd>{measured.floor} px</dd>
            </div>
          </dl>
        )}
      </div>
    </Example>
  );
}
