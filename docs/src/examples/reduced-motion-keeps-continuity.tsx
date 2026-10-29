import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import { Switch, morphDuration, usePreferences } from 'humane-system';
import './reduced-motion-keeps-continuity.css';

type Lane = 'todo' | 'done';

/** Reads a CSS time token such as "120ms" or "0.12s" as milliseconds. */
function toMs(value: string): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return value.trim().endsWith('ms') ? n : n * 1000;
}

/**
 * The card changes lanes as one object. Its travel is multiplied by --travel, which the stage sets to 0
 * under reduced motion. With no travel, the same card fades in place, so the change is still shown.
 */
export default function ReducedMotionKeepsContinuity() {
  const { reducedMotion: systemReduced } = usePreferences();
  const [local, setLocal] = useState(false);
  const [lane, setLane] = useState<Lane>('todo');
  const [announce, setAnnounce] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<DOMRect | null>(null);
  const animRef = useRef<Animation | null>(null);
  const reduced = local || systemReduced;

  useLayoutEffect(() => {
    const card = cardRef.current;
    const before = beforeRef.current;
    beforeRef.current = null;
    if (!card || !before) return;
    animRef.current?.cancel();

    // Measure the new layout position after the cancel, so the move starts from the card's current on-screen spot.
    const style = getComputedStyle(card);
    const travel = parseFloat(style.getPropertyValue('--travel')) || 0;
    const after = card.getBoundingClientRect();
    const dx = (before.left - after.left) * travel;
    const dy = (before.top - after.top) * travel;

    animRef.current =
      travel > 0 && (dx !== 0 || dy !== 0)
        ? card.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
            duration: morphDuration(Math.hypot(dx, dy)),
            easing: style.getPropertyValue('--ease-morph').trim(),
          })
        : card.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: toMs(style.getPropertyValue('--dur-fade')),
            easing: 'linear',
          });
  }, [lane]);

  useEffect(() => () => animRef.current?.cancel(), []);

  const move = () => {
    beforeRef.current = cardRef.current?.getBoundingClientRect() ?? null;
    const next: Lane = lane === 'todo' ? 'done' : 'todo';
    setLane(next);
    setAnnounce(`Release notes moved to ${next === 'done' ? 'done' : 'to do'}.`);
  };

  return (
    <Example
      hint="Move the card. Reduced motion removes the travel, and the card changes in place. The system setting turns it on too."
      controls={
        <>
          <Switch size="compact" label="Reduced motion" checked={local} onChange={setLocal} />
          <button type="button" className="h-button" data-size="compact" data-depth="1" onClick={move}>
            {lane === 'todo' ? 'Mark done' : 'Mark to do'}
          </button>
        </>
      }
    >
      <div className="ex-reduced-motion-keeps-continuity-stage" data-reduced={reduced || undefined}>
        <span className="ex-reduced-motion-keeps-continuity-lane" data-lane="todo">
          To do
        </span>
        <span className="ex-reduced-motion-keeps-continuity-lane" data-lane="done">
          Done
        </span>
        <div ref={cardRef} className="ex-reduced-motion-keeps-continuity-card" data-lane={lane}>
          <h4 className="ex-reduced-motion-keeps-continuity-title">Release notes</h4>
          <p className="ex-reduced-motion-keeps-continuity-meta">Owner: Mina</p>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </Example>
  );
}
