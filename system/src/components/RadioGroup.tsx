import type { CSSProperties } from 'react';
import { morphDuration } from '../lib/motion';
import type { ControlSize } from './Button';
import './radio-group.css';

/** One option: a value, its label, and an optional hint beside it (Symmetry: options carry no built-in weight). */
export type RadioOption<T extends string> = { value: T; label: string; hint?: string };

/** Controlled props. Native radios keep group semantics and arrow-key movement (Agency and access). */
export type RadioGroupProps<T extends string> = {
  label: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** standard: --control-height rows with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/** Equal consequence, equal weight (Symmetry): every option shares one style, and the selected inner dot grows in place (Continuity). */
export function RadioGroup<T extends string>({ label, name, options, value, onChange, size = 'standard' }: RadioGroupProps<T>) {
  const style = { '--dur': `${morphDuration(10)}ms` } as CSSProperties;

  return (
    <fieldset className="h-radio-group" data-size={size} style={style}>
      <legend className="h-field-label h-radio-group-legend">{label}</legend>
      <div className="h-radio-group-options">
        {options.map((option) => (
          <label key={option.value} className="h-radio-row">
            <input
              type="radio"
              className="h-radio-input"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="h-radio-dot" aria-hidden="true">
              <span className="h-radio-dot-inner" />
            </span>
            <span className="h-radio-text">
              <span className="h-radio-option-label">{option.label}</span>
              {option.hint && <span className="h-radio-hint">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
