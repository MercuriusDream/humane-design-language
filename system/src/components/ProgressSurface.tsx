import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { morphDuration } from '../lib/motion';
import { usePreferences } from '../preferences';
import './progress-surface.css';

export type ProgressSurfaceProps = {
  value: number;
  max: number;
  /** The accessible name of the progress. */
  label: string;
  /** Depth of this surface. Its radius and padding come from that depth. */
  depth?: 1 | 2;
  /** Drawn above the fill. */
  children?: ReactNode;
};

/** The surface's own plane fills to show progress, so no bar or badge is needed (State lives on the object). */
export function ProgressSurface({ value, max, label, depth = 1, children }: ProgressSurfaceProps) {
  const valid = Number.isFinite(max) && max > 0 && Number.isFinite(value);
  const nativeMax = valid ? max : 1;
  const clamped = valid ? Math.min(nativeMax, Math.max(0, value)) : 0;
  const ratio = clamped / nativeMax;
  const { reducedMotion } = usePreferences();
  const fillRef = useRef<HTMLDivElement>(null);
  const feedback = useRef<Animation | null>(null);
  const shownRatio = useRef(ratio);

  // Duration follows the physical width changed; reduced motion reports it with opacity in place.
  // Set before paint, so the transition that starts with this commit uses this duration.
  useLayoutEffect(() => {
    const from = shownRatio.current;
    shownRatio.current = ratio;
    if (fillRef.current && from !== ratio) {
      const width = fillRef.current.parentElement?.getBoundingClientRect().width ?? 0;
      fillRef.current.style.setProperty('--dur', `${morphDuration(Math.abs(ratio - from) * width)}ms`);
      const opacity = getComputedStyle(fillRef.current).opacity;
      feedback.current?.cancel();
      feedback.current = reducedMotion
        ? fillRef.current.animate([{ opacity: opacity === '1' ? 0.3 : Number(opacity) }, { opacity: 1 }], { duration: 120, easing: 'linear' })
        : null;
    }
  }, [ratio, reducedMotion]);
  useLayoutEffect(() => () => feedback.current?.cancel(), []);

  return (
    <div className="h-progress-surface" data-depth={depth}>
      <div className="h-progress-surface-track" aria-hidden="true">
        <div ref={fillRef} className="h-progress-surface-fill" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <div className="h-progress-surface-content">{children}</div>
      <progress className="h-progress-surface-native" value={clamped} max={nativeMax} aria-label={label} />
    </div>
  );
}
