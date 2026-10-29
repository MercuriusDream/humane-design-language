import { useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Button, ProgressSurface, morphDuration, usePreferences } from 'humane-system';
import './nothing-moves-idle.css';

const TOTAL = 5;

/** Motion here only reports a part the user asked for. Nothing on the page loops or moves on its own. */
export default function NothingMovesIdle() {
  const { reducedMotion } = usePreferences();
  const boxRef = useRef<HTMLDivElement>(null);
  const [received, setReceived] = useState(0);
  const [dur, setDur] = useState(0);
  const [announce, setAnnounce] = useState('');

  const done = received >= TOTAL;

  const press = () => {
    const width = boxRef.current?.offsetWidth ?? 0;
    if (done) {
      // Resetting changes the whole fill, so it takes the duration of the full width.
      setDur(reducedMotion ? 0 : morphDuration(width));
      setReceived(0);
      setAnnounce(`Shipment reset. 0 of ${TOTAL} parts received.`);
      return;
    }
    const next = received + 1;
    setDur(reducedMotion ? 0 : morphDuration(width / TOTAL));
    setReceived(next);
    setAnnounce(next === TOTAL ? `All ${TOTAL} parts received.` : `Part ${next} of ${TOTAL} received.`);
  };

  return (
    <Example hint="Each press receives one part. After the last part, the same button starts over. The fill moves only for a part you asked for. Nothing else on the page moves.">
      <div className="ex-nothing-moves-idle-grid">
        <div
          ref={boxRef}
          className="ex-nothing-moves-idle-box"
          style={{ '--dur': `${dur}ms` } as CSSProperties}
        >
          <ProgressSurface value={received} max={TOTAL} label="Parts received" depth={1}>
            <div className="ex-nothing-moves-idle-card">
              <p className="ex-nothing-moves-idle-title">Pump housing parts</p>
              <p className="ex-nothing-moves-idle-count">
                {received} of {TOTAL}
              </p>
              <Button variant="strong" depth={2} onClick={press}>
                {done ? 'Start over' : 'Receive a part'}
              </Button>
            </div>
          </ProgressSurface>
        </div>

        <dl className="ex-nothing-moves-idle-order">
          <div>
            <dt>Order</dt>
            <dd>2281</dd>
          </div>
          <div>
            <dt>From</dt>
            <dd>North depot</dd>
          </div>
          <div>
            <dt>Expected</dt>
            <dd>Thursday</dd>
          </div>
        </dl>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </Example>
  );
}
