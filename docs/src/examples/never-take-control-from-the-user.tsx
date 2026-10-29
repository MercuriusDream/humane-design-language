import { useEffect, useState } from 'react';
import { Example } from '../components/Example';
import { Button, ProgressSurface } from 'humane-system';
import './never-take-control-from-the-user.css';

const DURATION = 200;

/** Playback starts only on a press. Pause is always one press away, and the clip ends without moving the page or focus. */
export default function MediaCard() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const ended = position >= DURATION;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      setPosition((p) => Math.min(DURATION, p + elapsed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (playing && ended) setPlaying(false);
  }, [playing, ended]);

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (ended) setPosition(0);
    setPlaying(true);
  };

  // Changes only when the state changes, so the live region speaks once per change, not once per frame.
  const status = playing ? 'Playing.' : ended ? 'Finished.' : position > 0 ? `Paused at ${clock(position)}.` : '';

  return (
    <Example hint="Nothing plays until you press Play. Pause is always one press away, and the clip ends without moving the page or your focus.">
      <ProgressSurface value={position} max={DURATION} label="Clip progress">
        <div className="ex-never-take-control-from-the-user-head">
          <p className="ex-never-take-control-from-the-user-title">Morning walk</p>
          <p className="ex-never-take-control-from-the-user-meta">Audio, {clock(DURATION)}</p>
        </div>
        <div className="ex-never-take-control-from-the-user-row">
          <p className="ex-never-take-control-from-the-user-time" aria-hidden="true">
            {clock(position)} of {clock(DURATION)}
          </p>
          <Button variant="strong" depth={2} onClick={toggle}>
            {playing ? 'Pause' : 'Play'}
          </Button>
        </div>
      </ProgressSurface>
      <p className="ex-never-take-control-from-the-user-status" aria-live="polite">
        {status}
      </p>
    </Example>
  );
}

function clock(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
