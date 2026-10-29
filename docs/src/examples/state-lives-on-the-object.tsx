import { useEffect, useState } from 'react';
import { Example } from '../components/Example';
import { Switch } from 'humane-system';
import './shared-demos.css';
import './state-lives-on-the-object.css';

type Phase = 'idle' | 'running' | 'done' | 'failed';

const TOTAL = 40;
const FAIL_AT = 24;
const TICK_MS = 90;

const META: Record<Phase, (count: number) => string> = {
  idle: () => `${TOTAL} photos, 212 MB`,
  running: (count) => `${count} of ${TOTAL} exported`,
  done: () => `${TOTAL} photos exported`,
  failed: (count) => `Stopped at ${count} of ${TOTAL}`,
};

const ACTION: Record<Phase, string> = {
  idle: 'Export',
  running: 'Cancel',
  done: 'Export again',
  failed: 'Try again',
};

const ANNOUNCE: Partial<Record<Phase, string>> = {
  running: 'Export started.',
  done: `All ${TOTAL} photos exported.`,
  failed: `Export stopped at ${FAIL_AT} of ${TOTAL}. The disk is full.`,
};

/** The card is its own progress indicator. No badge says what the card already shows. */
export default function ExportTask() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(0);
  const [failPartway, setFailPartway] = useState(false);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = setInterval(() => setCount((c) => Math.min(c + 1, TOTAL)), TICK_MS);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (failPartway && count >= FAIL_AT) setPhase('failed');
    else if (count >= TOTAL) setPhase('done');
  }, [phase, count, failPartway]);

  const act = () => {
    if (phase === 'running') {
      setPhase('idle');
      setCount(0);
    } else {
      setCount(0);
      setPhase('running');
    }
  };

  return (
    <Example
      hint="Start the export. Turn on failure to see an error stated in words."
      controls={<Switch size="compact" label="Fail partway" checked={failPartway} onChange={setFailPartway} />}
    >
      <div className="task ex-state-lives-on-the-object-task" data-phase={phase}>
        <div className="task-track" aria-hidden="true">
          <div className="task-fill" style={{ transform: `scaleX(${count / TOTAL})` }} />
        </div>
        <div className="task-main">
          <div className="task-text">
            <h4 className="task-title">
              <CheckIcon />
              Export photos
            </h4>
            <p className="task-meta">{META[phase](count)}</p>
          </div>
          <button type="button" className="h-button" data-depth="2" onClick={act}>
            {ACTION[phase]}
          </button>
        </div>
        {phase === 'failed' && (
          <p className="task-error">The disk is full. Free at least 90 MB, then try again.</p>
        )}
        <progress className="visually-hidden" value={count} max={TOTAL} aria-label="Export progress" />
      </div>
      <p className="visually-hidden" aria-live="polite">
        {ANNOUNCE[phase] ?? ''}
      </p>
    </Example>
  );
}

function CheckIcon() {
  return (
    <svg className="task-check" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
