import { useId } from 'react';
import type { ControlSize } from './Button';
import './select.css';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  /** Short help text under the label, above the control it explains. */
  hint?: string;
  /** What went wrong and what to do next. Shown under the control in the danger signal. */
  error?: string;
  /** Depth of the surface the select sits on. Depth 2 takes the radius of depth 2. */
  depth?: 1 | 2;
  /** standard: --control-height with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/** A native select as a raised plane. Its label and value identify it, so it draws no edge. */
export function Select<T extends string>({ label, value, onChange, options, hint, error, depth = 1, size = 'standard' }: Props<T>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="h-select-field" data-size={size}>
      <label className="h-field-label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <span className="h-select-hint" id={hintId}>
          {hint}
        </span>
      )}
      <div className="h-select-control" data-depth={depth}>
        <select
          id={id}
          className="h-select"
          data-invalid={error ? 'true' : undefined}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            // Resolve the chosen string back to its typed option, so T is preserved without a cast.
            const next = options.find((o) => o.value === e.target.value);
            if (next) onChange(next.value);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg className="h-select-chevron" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Always mounted so the error is announced when it appears. Empty, it takes no space. */}
      <p className="h-select-error" id={errorId} aria-live="polite">
        {error ?? ''}
      </p>
    </div>
  );
}
