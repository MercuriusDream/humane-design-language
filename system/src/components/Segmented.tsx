import { useId, useLayoutEffect, useRef } from 'react';
import { morphIndicator } from '../lib/morph';
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
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const placeRef = useRef<(instant: boolean) => void>(() => {});

  /** Moves the indicator over the active option. Instant placement is for layout changes the user did not cause. */
  function place(instant: boolean) {
    const indicator = indicatorRef.current;
    const option = optionRefs.current.get(value);
    if (!indicator || !option) return;
    morphIndicator(
      indicator,
      { x: option.offsetLeft, y: option.offsetTop, w: option.offsetWidth, h: option.offsetHeight },
      instant,
    );
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
        <span ref={indicatorRef} className="h-segmented-indicator" aria-hidden="true" />
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
