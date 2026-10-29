import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Button, morphDuration, usePreferences } from 'humane-system';
import './one-change-one-morph.css';

/** Row height in rem, so rows grow with the user's text size: the compact control height, 2.25rem. */
const ROW_REM = 2.25;
const ITEMS = [
  { name: 'January', count: 48 },
  { name: 'February', count: 31 },
  { name: 'March', count: 77 },
  { name: 'April', count: 52 },
  { name: 'May', count: 140 },
  { name: 'June', count: 96 },
  { name: 'July', count: 213 },
  { name: 'August', count: 188 },
  { name: 'September', count: 64 },
  { name: 'October', count: 29 },
];
const LAST = ITEMS.length - 1;

type Position = { index: number; px: number };

/**
 * One highlight, one transform. The duration is sized to the whole distance, so a long jump is
 * one morph and never a chain of steps through the rows in between.
 */
export default function OneChangeOneMorph() {
  const { reducedMotion } = usePreferences();
  const [pos, setPos] = useState<Position>({ index: 0, px: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  const go = (to: number) => {
    const row = trackRef.current?.querySelectorAll<HTMLButtonElement>('button')[to];
    const from = planeRef.current?.getBoundingClientRect();
    const target = row?.getBoundingClientRect();
    setPos({ index: to, px: from && target ? Math.round(Math.abs(target.top - from.top)) : 0 });
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    const row = track?.querySelectorAll<HTMLButtonElement>('button')[pos.index];
    if (!track || !row) return;
    const place = (resize: boolean) => {
      track.style.setProperty('--y', `${row.offsetTop}px`);
      track.style.setProperty('--height', `${row.offsetHeight}px`);
      if (resize) track.style.setProperty('--dur', '0ms');
    };
    place(false);
    let width = track.offsetWidth;
    let height = track.offsetHeight;
    const observer = new ResizeObserver(() => {
      if (width === track.offsetWidth && height === track.offsetHeight) return;
      width = track.offsetWidth;
      height = track.offsetHeight;
      place(true);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [pos.index]);

  const duration = morphDuration(pos.px);

  return (
    <Example
      hint="Jump, or click a row. The highlight moves in one morph."
      controls={
        <div className="ex-one-change-one-morph-controls">
          <Button size="compact" onClick={() => go(0)}>Jump to first</Button>
          <Button size="compact" onClick={() => go(LAST)}>Jump to last</Button>
        </div>
      }
    >
      <div className="ex-one-change-one-morph-body">
        <p className="ex-one-change-one-morph-readout">
          {reducedMotion ? `${pos.px} px, travel removed` : `${pos.px} px, ${duration} ms`}
        </p>
        <div
          ref={trackRef}
          className="ex-one-change-one-morph-track"
          style={{ '--row': `${ROW_REM}rem`, '--dur': `${duration}ms` } as CSSProperties}
        >
          <div ref={planeRef} className="ex-one-change-one-morph-plane" aria-hidden="true" />
          <ul className="ex-one-change-one-morph-list">
            {ITEMS.map((item, i) => (
              <li key={item.name}>
                <button
                  type="button"
                  className="ex-one-change-one-morph-row"
                  aria-current={i === pos.index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  <span>{item.name}</span>
                  <span className="ex-one-change-one-morph-count">{item.count} photos</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="visually-hidden" aria-live="polite">
          {`Moved to ${ITEMS[pos.index].name}.`}
        </p>
      </div>
    </Example>
  );
}
