import { useId, useLayoutEffect, useRef } from 'react';
import { morphDuration } from '../lib/motion';
import type { ControlSize } from './Button';
import './segmented.css';

type Props<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** standard: --control-height with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/**
 * One indicator morphs between options. The track takes the 2px corner; the indicator and options take 0, so the
 * inside is sharper than its holder. Options share the width equally unless a label needs more, and wrap when they
 * cannot fit, so the track never scrolls.
 */
export function Segmented<T extends string>({ label, options, value, onChange, size = 'standard' }: Props<T>) {
  const labelId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const measured = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const placeRef = useRef<(instant: boolean) => void>(() => {});

  /** Moves the indicator over the active option. Instant placement is for layout changes the user did not cause. */
  function place(instant: boolean) {
    const track = trackRef.current;
    const option = optionRefs.current.get(value);
    if (!track || !option) return;
    const next = { x: option.offsetLeft, y: option.offsetTop, w: option.offsetWidth, h: option.offsetHeight };
    const prev = measured.current;
    const distance = prev
      ? Math.max(Math.hypot(next.x - prev.x, next.y - prev.y), Math.abs(next.w - prev.w), Math.abs(next.h - prev.h))
      : 0;
    track.style.setProperty('--dur', instant || !prev ? '0ms' : `${morphDuration(distance)}ms`);
    track.style.setProperty('--indicator-x', `${next.x}px`);
    track.style.setProperty('--indicator-y', `${next.y}px`);
    track.style.setProperty('--indicator-w', `${next.w}px`);
    track.style.setProperty('--indicator-h', `${next.h}px`);
    measured.current = next;
  }

  useLayoutEffect(() => {
    placeRef.current = place;
  });

  useLayoutEffect(() => {
    place(false);
  }, [value, options]);

  // Font loading, text size, and wrapping change option sizes without a selection change. Re-place without travel.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => placeRef.current(true));
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-segmented-field">
      <span className="h-field-label" id={labelId}>
        {label}
      </span>
      <div ref={trackRef} className="h-segmented" data-size={size} role="group" aria-labelledby={labelId}>
        <span className="h-segmented-indicator" aria-hidden="true" />
        {options.map((option) => (
          <button
            key={option.value}
            ref={(el) => {
              if (el) optionRefs.current.set(option.value, el);
              else optionRefs.current.delete(option.value);
            }}
            type="button"
            className="h-segmented-option"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
