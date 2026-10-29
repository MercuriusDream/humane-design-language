import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Example } from '../components/Example';
import './respond-at-once.css';

/** Feedback starts on the first frame after input. The readout measures input to that frame. */
export default function RespondAtOnce() {
  const [last, setLast] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // The input's own timestamp is the start. The next animation frame is when the pressed color is drawn.
  const measure = (inputTime: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      setLast(performance.now() - inputTime);
      setCount((c) => c + 1);
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    measure(event.timeStamp);
  };

  // Space only: browsers show the pressed color for Space, but not for Enter, so Enter would be measured with nothing shown.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' && !event.repeat) measure(event.timeStamp);
  };

  return (
    <Example
      hint="Press and hold the plane, or press Space while it has focus. The readout counts milliseconds from input to the next frame, when the change is drawn."
      controls={
        <dl className="ex-respond-at-once-readout" aria-live="polite">
          <div>
            <dt>Last press</dt>
            <dd>{last === null ? 'None yet' : `${Math.round(last)} ms`}</dd>
          </div>
          <div>
            <dt>Presses</dt>
            <dd>{count}</dd>
          </div>
        </dl>
      }
    >
      <button type="button" className="ex-respond-at-once-plane" onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        Press and hold
      </button>
    </Example>
  );
}
