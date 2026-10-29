import { useLayoutEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch } from 'humane-system';
import './shared-demos.css';
import './sharp-corners-round-marks.css';

type Letter = { to: string; subject: string; time: string };

const LETTERS: Letter[] = [
  { to: 'Mina Park', subject: 'Harbor photos, as promised', time: '9:00' },
  { to: 'Jonas Weber', subject: 'Re: the lease', time: '9:00' },
  { to: 'Ana Ruiz', subject: 'Bread, third attempt', time: '9:15' },
  { to: 'Dev Rao', subject: 'Studio on Thursday', time: '10:30' },
];

type Measured = {
  /** Radius at depth 0, 1 and 2, as the browser resolved it. */
  radius: [number, number, number];
  /** Width of a mark, and whether it resolved to a circle. */
  mark: { size: number; circle: boolean };
  /** The switch track's height and its half-height corner. */
  track: { height: number; radius: number };
};

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * An outbox: a root, a depth 1 panel inside it, and depth 2 letters inside that. Every sharp corner is 2px.
 * Each letter carries a mark, which is a circle, and the switch is the one pill. Every number is read back
 * from the page.
 */
export default function SharpCornersRoundMarks() {
  const rootRef = useRef<HTMLElement>(null);
  const [scheduled, setScheduled] = useState(true);
  const [measured, setMeasured] = useState<Measured | null>(null);

  // The system sets the root's radius from a ResizeObserver, so the read waits a frame for it to land.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const at = (selector: string) => root.querySelector<HTMLElement>(selector) ?? root;
        const style = (el: HTMLElement) => getComputedStyle(el);
        const radiusOf = (el: HTMLElement) => round(parseFloat(style(el).borderTopLeftRadius));
        const panel = at('.ex-sharp-corners-round-marks-panel');
        const mark = at('.ex-sharp-corners-round-marks-mark');
        const track = at('.h-switch-track');
        setMeasured({
          radius: [radiusOf(root), radiusOf(panel), radiusOf(at('.ex-sharp-corners-round-marks-letter'))],
          mark: { size: mark.offsetWidth, circle: style(mark).borderTopLeftRadius === '50%' },
          track: { height: track.offsetHeight, radius: round(parseFloat(style(track).borderTopLeftRadius)) },
        });
      });
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(root);
    // The radius lands as an inline --radius-root after the size is known, so a change of style reads again.
    const radius = new MutationObserver(read);
    radius.observe(root, { attributes: true, attributeFilter: ['style'] });
    return () => {
      observer.disconnect();
      radius.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Example bare>
      <div className="ex-sharp-corners-round-marks-stage">
        <Surface depth={0} plane="raised" className="ex-sharp-corners-round-marks-root" ref={rootRef}>
          <div className="ex-sharp-corners-round-marks-intro">
            <div className="ex-sharp-corners-round-marks-text">
              <h4 className="ex-sharp-corners-round-marks-title">Outbox</h4>
              <p className="ex-sharp-corners-round-marks-lede">Letters wait here to be sent.</p>
            </div>
            <Switch label="Send on schedule" size="compact" checked={scheduled} onChange={setScheduled} />
            {measured && (
              <dl className="readout">
                <div>
                  <dt>Root</dt>
                  <dd>{measured.radius[0]} px</dd>
                </div>
                <div>
                  <dt>Depth 1</dt>
                  <dd>{measured.radius[1]} px</dd>
                </div>
                <div>
                  <dt>Depth 2</dt>
                  <dd>{measured.radius[2]} px</dd>
                </div>
                <div>
                  <dt>Marks</dt>
                  <dd>{measured.mark.circle ? `${measured.mark.size} px circle` : `${measured.mark.size} px`}</dd>
                </div>
                <div>
                  <dt>Switch</dt>
                  <dd>
                    {measured.track.height} px track, {measured.track.radius} px pill
                  </dd>
                </div>
              </dl>
            )}
          </div>
          <Surface depth={1} plane="base" className="ex-sharp-corners-round-marks-panel">
            <ul className="ex-sharp-corners-round-marks-letters" aria-label="Waiting to send">
              {LETTERS.map((letter) => (
                <li key={letter.to} className="ex-sharp-corners-round-marks-letter" data-held={!scheduled || undefined}>
                  <span className="ex-sharp-corners-round-marks-mark" aria-hidden="true" />
                  <span className="ex-sharp-corners-round-marks-main">
                    <span className="ex-sharp-corners-round-marks-to">{letter.to}</span>
                    <span className="ex-sharp-corners-round-marks-subject">{letter.subject}</span>
                  </span>
                  <span className="ex-sharp-corners-round-marks-time">{scheduled ? letter.time : 'Held'}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </Surface>
      </div>
    </Example>
  );
}
