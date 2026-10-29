import { useEffect, useRef, useState } from 'react';
import { Button, Placeholder } from 'humane-system';
import { Example } from '../components/Example';
import './reserve-space-for-what-is-loading.css';

const LOAD_MS = 900;

type Phase = 'idle' | 'loading' | 'ready' | 'cancelled' | 'removed';

// Every visible change of state is announced, so each phase that the user causes has a message.
const ANNOUNCE: Record<Phase, string> = {
  idle: '',
  loading: 'Loading.',
  ready: 'Content loaded.',
  cancelled: 'Loading cancelled.',
  removed: 'Content removed.',
};

/** The placeholder has the shape of the lines it stands for. The line below it never moves. */
export default function ReserveSpaceForLoading() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [anchorTop, setAnchorTop] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The stage is positioned, so the anchor's offsetTop is its distance from the stage's top edge.
  // The stage resizes whenever the placeholder box changes height, so this reads every change.
  useEffect(() => {
    const stage = stageRef.current;
    const anchor = anchorRef.current;
    if (!stage || !anchor) return;
    const observer = new ResizeObserver(() => setAnchorTop(anchor.offsetTop));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const press = () => {
    if (phase === 'loading') {
      window.clearTimeout(timer.current);
      setPhase('cancelled');
    } else if (phase === 'ready') {
      setPhase('removed');
    } else {
      setPhase('loading');
      timer.current = window.setTimeout(() => setPhase('ready'), LOAD_MS);
    }
  };

  const ready = phase === 'ready';
  const label = ready ? 'Unload' : phase === 'loading' ? 'Cancel' : 'Load';

  return (
    <Example
      hint="Press Load. The placeholder has the shape of the text and fills in place. The line below does not move."
      controls={<Button size="compact" onClick={press}>{label}</Button>}
    >
      <div className="ex-reserve-space-for-what-is-loading-stage" ref={stageRef}>
        <Placeholder ready={ready} lines={3}>
          <div className="ex-reserve-space-for-what-is-loading-text">
            <p className="ex-reserve-space-for-what-is-loading-line">Harbor at dusk. Nine photos.</p>
            <p className="ex-reserve-space-for-what-is-loading-line">Long exposures, one breakwater.</p>
            <p className="ex-reserve-space-for-what-is-loading-line">The ferry crossed twice.</p>
          </div>
        </Placeholder>
        <div className="ex-reserve-space-for-what-is-loading-below">
          <p className="ex-reserve-space-for-what-is-loading-anchor" ref={anchorRef}>
            Read the harbor notes next.
          </p>
          <p className="ex-reserve-space-for-what-is-loading-readout">Anchor at {anchorTop} px</p>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {ANNOUNCE[phase]}
      </p>
    </Example>
  );
}
