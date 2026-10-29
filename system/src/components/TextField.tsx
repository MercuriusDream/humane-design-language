import { useId, useRef } from 'react';
import type { ControlSize } from './Button';
import './text-field.css';

export type TextFieldType = 'text' | 'email' | 'search' | 'password';

export type TextFieldProps = {
  /** The visible label, and the accessible name of the control. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Short hint under the label, above the control. Serves "explain at the point of action". */
  hint?: string;
  /** Shown under the input in the danger signal. Sets aria-invalid and aria-describedby. */
  error?: string;
  /** Renders a textarea instead of an input. */
  multiline?: boolean;
  /** Visible rows of a multiline field. */
  rows?: number;
  type?: TextFieldType;
  placeholder?: string;
  /** Depth of the surface the field sits on. Depth 2 takes the radius of depth 2. */
  depth?: 1 | 2;
  /** standard: --control-height with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
  id?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
};

/**
 * A control plane, identified by its fill and its words: the label, the placeholder, and for a search field a
 * search mark that stays when the words are gone. No outline in either contrast.
 */
export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  multiline = false,
  rows = 4,
  type = 'text',
  placeholder,
  depth = 1,
  size = 'standard',
  id,
  name,
  required,
  autoComplete,
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const showClear = type === 'search' && !multiline && value.length > 0;
  const invalid = error ? true : undefined;

  return (
    <div className="h-text-field" data-size={size}>
      <label className="h-field-label" htmlFor={fieldId}>
        {label}
      </label>
      {hint && (
        <span className="h-text-field-hint" id={hintId}>
          {hint}
        </span>
      )}

      <div className="h-text-field-control" data-depth={depth} data-invalid={invalid}>
        {type === 'search' && !multiline && (
          <svg className="h-text-field-glyph" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <circle cx="7.75" cy="7.75" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path d="M11.75 11.75 15.5 15.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
        {multiline ? (
          <textarea
            id={fieldId}
            name={name}
            className="h-text-field-textarea"
            rows={rows}
            value={value}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            ref={inputRef}
            id={fieldId}
            name={name}
            type={type}
            className="h-text-field-input"
            value={value}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {showClear && (
          <button
            type="button"
            className="h-text-field-clear"
            aria-label="Clear"
            onClick={() => {
              onChange('');
              // The clear control disappears on the next render, so focus returns to the input the user was editing.
              inputRef.current?.focus();
            }}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Always mounted so the error is announced when it appears. Empty, it takes no space. */}
      <p className="h-text-field-error" id={errorId} aria-live="polite">
        {error ?? ''}
      </p>
    </div>
  );
}
