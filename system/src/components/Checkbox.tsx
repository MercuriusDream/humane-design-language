import { useId, type CSSProperties } from 'react';
import { morphDuration } from '../lib/motion';
import type { ControlSize } from './Button';
import './checkbox.css';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** A short hint set under the label, next to the control it explains. */
  hint?: string;
  disabled?: boolean;
  /** Radius follows the containing surface's nesting depth. */
  depth?: 1 | 2;
  /** standard: a --control-height row with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/**
 * A native checkbox, visually replaced. The whole row is the target, and the check draws in
 * instead of appearing, so the box stays the same object in both states.
 */
export function Checkbox({ label, checked, onChange, hint, disabled = false, depth = 1, size = 'standard' }: CheckboxProps) {
  const labelId = useId();
  const hintId = useId();
  const style = { '--dur': `${morphDuration(20)}ms` } as CSSProperties;

  return (
    <label className="h-checkbox" data-depth={depth} data-size={size} data-disabled={disabled || undefined} style={style}>
      <input
        type="checkbox"
        className="h-checkbox-input"
        checked={checked}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span className="h-checkbox-box" aria-hidden="true">
        <svg className="h-checkbox-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M5 10.5 L8.5 14 L15 6.5" pathLength={1} />
        </svg>
      </span>
      <span className="h-checkbox-text">
        <span className="h-checkbox-label" id={labelId}>{label}</span>
        {hint && (
          <span className="h-checkbox-hint" id={hintId}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
