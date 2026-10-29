import { useId } from 'react';
import type { ControlSize } from './Button';
import './slider.css';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Shown after the value, such as px. */
  unit?: string;
  /** standard: a --control-height input. compact: --control-height-compact. */
  size?: ControlSize;
};

/** A value along a range. The track alone identifies the control. */
export function Slider({ label, value, min, max, onChange, unit = '', size = 'standard' }: Props) {
  const id = useId();
  return (
    <div className="h-slider" data-size={size}>
      <label className="h-slider-head" htmlFor={id}>
        <span className="h-field-label">{label}</span>
        <span className="h-slider-value">{unit ? `${value} ${unit}` : value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
