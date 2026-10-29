import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { morphDuration, usePreferences } from 'humane-system';
import './motion-is-a-morph.css';

/** One card that is its own compact and detailed state. Its height and thumbnail change in place. */
export default function MorphCard() {
  const [open, setOpen] = useState(false);
  const [detailHeight, setDetailHeight] = useState(0);
  const { reducedMotion } = usePreferences();
  const innerRef = useRef<HTMLDivElement>(null);
  const detailId = useId();

  // The card's height changes by exactly the detail block's height, so that height sets the duration.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => setDetailHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const duration = reducedMotion ? 0 : morphDuration(detailHeight);

  return (
    <Example hint="Show the details. Click again during the change to reverse it.">
      <article className="ex-motion-is-a-morph-card" data-open={open} style={{ '--dur': `${duration}ms` } as CSSProperties}>
        <div className="ex-motion-is-a-morph-head">
          <div className="ex-motion-is-a-morph-slot" aria-hidden="true">
            <div className="ex-motion-is-a-morph-cover">
              <svg viewBox="0 0 48 48" width="100%" height="100%" focusable="false">
                <circle cx="34" cy="16" r="5" fill="currentColor" />
                <path d="M0 48 L16 24 L26 36 L32 28 L48 48 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="ex-motion-is-a-morph-text">
            <h4 className="ex-motion-is-a-morph-title">Harbor at dusk</h4>
            <p className="ex-motion-is-a-morph-meta">9 photos</p>
          </div>
          <button
            type="button"
            className="h-button"
            data-depth="2"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Hide details' : 'Show details'}
          </button>
        </div>

        <div className="ex-motion-is-a-morph-detail" id={detailId} inert={!open}>
          <div className="ex-motion-is-a-morph-clip">
            <div className="ex-motion-is-a-morph-inner" ref={innerRef}>
              <p className="ex-motion-is-a-morph-note">
                Long exposures from the breakwater. The ferry crossed twice and left two lines of light on the water.
              </p>
              <dl className="ex-motion-is-a-morph-facts">
                <div>
                  <dt>Lens</dt>
                  <dd>35 mm</dd>
                </div>
                <div>
                  <dt>Longest exposure</dt>
                  <dd>30 seconds</dd>
                </div>
                <div>
                  <dt>Kept</dt>
                  <dd>4 of 9</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </article>
    </Example>
  );
}
