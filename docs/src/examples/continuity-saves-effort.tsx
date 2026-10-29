import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Button, Segmented, morphDuration, usePreferences } from 'humane-system';
import './continuity-saves-effort.css';

type Mode = 'swap' | 'morph';

const MODES: { value: Mode; label: string }[] = [
  { value: 'swap', label: 'Swap' },
  { value: 'morph', label: 'Morph' },
];

const TITLE = 'Harbor at dusk';
const META = '9 photos';
const BODY = 'Long exposures from the breakwater. The ferry crossed twice and left two lines of light on the water.';

/**
 * Swap: the compact card is removed and a different expanded card appears in another slot.
 * Morph: one card changes size in place, so it is the same object at both ends.
 */
export default function ContinuitySavesEffort() {
  const { reducedMotion } = usePreferences();
  const [mode, setMode] = useState<Mode>('morph');
  const [expanded, setExpanded] = useState(false);
  const [announce, setAnnounce] = useState('');
  const stageId = useId();

  const change = () => {
    const next = !expanded;
    setExpanded(next);
    setAnnounce(next ? 'Card expanded.' : 'Card collapsed.');
  };

  const pickMode = (next: Mode) => {
    setMode(next);
    setExpanded(false);
    setAnnounce('');
  };

  return (
    <Example
      hint="Press Change. Swap replaces the card with a different one in another place. Morph changes this same card in place."
      controls={
        <>
          <Segmented size="compact" label="Change style" options={MODES} value={mode} onChange={pickMode} />
          <Button size="compact" variant="strong" onClick={change} aria-expanded={expanded} aria-controls={stageId}>
            Change
          </Button>
        </>
      }
    >
      <div className="ex-continuity-saves-effort-stage" data-mode={mode} id={stageId}>
        {mode === 'morph' ? (
          <div className="ex-continuity-saves-effort-slot-a">
            <MorphCard expanded={expanded} reducedMotion={reducedMotion} />
          </div>
        ) : (
          <>
            <div className="ex-continuity-saves-effort-slot-a">
              <CompactCard gone={expanded} />
            </div>
            <div className="ex-continuity-saves-effort-slot-b">
              <ExpandedCard gone={!expanded} />
            </div>
          </>
        )}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </Example>
  );
}

/** Three frames from the album. They are the card's picture, so the card reads as an album and not a bare title. */
function Cover() {
  return (
    <div className="ex-continuity-saves-effort-cover" aria-hidden="true">
      <span className="ex-continuity-saves-effort-photo" />
      <span className="ex-continuity-saves-effort-photo" />
      <span className="ex-continuity-saves-effort-photo" />
    </div>
  );
}

/**
 * Swap, compact state. A separate element from the expanded card. Once it is gone it is hidden, not removed,
 * so its slot keeps the card's exact height and the replacement visibly lands somewhere else.
 */
function CompactCard({ gone }: { gone: boolean }) {
  return (
    <article className="ex-continuity-saves-effort-card" data-gone={gone || undefined} inert={gone}>
      <Cover />
      <div className="ex-continuity-saves-effort-head">
        <h4 className="ex-continuity-saves-effort-title">{TITLE}</h4>
        <span className="ex-continuity-saves-effort-meta">{META}</span>
      </div>
    </article>
  );
}

/**
 * Swap, expanded state. Appears in its own slot with no transition. Until then it is hidden, not absent,
 * so the stage keeps one height and the page below does not jump on each press.
 */
function ExpandedCard({ gone }: { gone: boolean }) {
  return (
    <article className="ex-continuity-saves-effort-card" data-gone={gone || undefined} inert={gone}>
      <Cover />
      <div className="ex-continuity-saves-effort-head">
        <h4 className="ex-continuity-saves-effort-title">{TITLE}</h4>
        <span className="ex-continuity-saves-effort-meta">{META}</span>
      </div>
      <p className="ex-continuity-saves-effort-text">{BODY}</p>
    </article>
  );
}

/** Morph. One element. Its body opens in place, so its size changes with a transition. */
function MorphCard({ expanded, reducedMotion }: { expanded: boolean; reducedMotion: boolean }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState(0);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight));
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  // Reduced motion removes the travel of the size change. The text still fades on the same card.
  const duration = reducedMotion ? 0 : morphDuration(bodyHeight);

  return (
    <article
      className="ex-continuity-saves-effort-card"
      data-expanded={expanded}
      style={{ '--dur': `${duration}ms` } as CSSProperties}
    >
      <Cover />
      <div className="ex-continuity-saves-effort-head">
        <h4 className="ex-continuity-saves-effort-title">{TITLE}</h4>
        <span className="ex-continuity-saves-effort-meta">{META}</span>
      </div>
      <div className="ex-continuity-saves-effort-reveal" inert={!expanded}>
        <div className="ex-continuity-saves-effort-clip">
          <div className="ex-continuity-saves-effort-body" ref={bodyRef}>
            <p className="ex-continuity-saves-effort-text">{BODY}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
