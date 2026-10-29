import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch, morphDuration } from 'humane-system';
import './attention-is-finite.css';

type Mode = 'plain' | 'decorated';

const format = (ms: number | null) => (ms === null ? 'Not yet' : `${(ms / 1000).toFixed(1)} s`);

/** One number carries the information. Decoration is optional, and each find is timed so the cost is measurable. */
export default function AttentionIsFinite() {
  const [decorated, setDecorated] = useState(false);
  const [times, setTimes] = useState<Record<Mode, number | null>>({ plain: null, decorated: null });
  const [announce, setAnnounce] = useState('');
  const since = useRef(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    since.current = performance.now();
  }, []);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setInnerHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mode: Mode = decorated ? 'decorated' : 'plain';

  const toggle = (on: boolean) => {
    setDecorated(on);
    since.current = performance.now();
  };

  const found = () => {
    const now = performance.now();
    const ms = now - since.current;
    since.current = now;
    setTimes((t) => ({ ...t, [mode]: ms }));
    setAnnounce(`Found in ${(ms / 1000).toFixed(1)} seconds.`);
  };

  return (
    <Example
      hint="Click the number of photos waiting. Then turn decoration on and click it again. Each click times the search from the last click or switch."
      controls={
        <>
          <Switch size="compact" label="Show decoration" checked={decorated} onChange={toggle} />
          <dl className="ex-attention-is-finite-results">
            <div>
              <dt>Without decoration</dt>
              <dd>{format(times.plain)}</dd>
            </div>
            <div>
              <dt>With decoration</dt>
              <dd>{format(times.decorated)}</dd>
            </div>
          </dl>
        </>
      }
    >
      <Surface depth={1} plane="raised" className="ex-attention-is-finite-card">
        <h4 className="ex-attention-is-finite-title">Photo backup</h4>

        <div
          className="ex-attention-is-finite-decor"
          data-on={decorated || undefined}
          inert={!decorated}
          style={{ '--dur': `${morphDuration(innerHeight)}ms` } as CSSProperties}
        >
          <div className="ex-attention-is-finite-clip">
            <div className="ex-attention-is-finite-decor-inner" ref={innerRef}>
              <p className="ex-attention-is-finite-tagline">Your memories, safe and sorted.</p>
              <div className="ex-attention-is-finite-icons" aria-hidden="true">
                <SparkleIcon />
                <HeartIcon />
                <SmileIcon />
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="ex-attention-is-finite-number" onClick={found}>
          <span className="ex-attention-is-finite-value">1,284</span>
          <span className="ex-attention-is-finite-caption">photos waiting to back up</span>
        </button>

        <p className="ex-attention-is-finite-meta">Last backup 2 hours ago</p>
      </Surface>

      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </Example>
  );
}

function SparkleIcon() {
  return (
    <svg className="ex-attention-is-finite-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="ex-attention-is-finite-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M8 13s-5-3.1-5-6.6C3 4.6 4.1 3.5 5.5 3.5c1 0 1.9.6 2.5 1.5.6-.9 1.5-1.5 2.5-1.5C11.9 3.5 13 4.6 13 6.4 13 9.9 8 13 8 13z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg className="ex-attention-is-finite-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9.5c.7.9 1.5 1.3 2.5 1.3s1.8-.4 2.5-1.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
