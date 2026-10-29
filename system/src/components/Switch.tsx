import type { ControlSize } from './Button';
import './switch.css';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** standard: --control-height with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/** The thumb is the same object in both states; it travels instead of being replaced. */
export function Switch({ label, checked, onChange, size = 'standard' }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="h-switch"
      data-size={size}
      onClick={() => onChange(!checked)}
    >
      <span className="h-switch-label">{label}</span>
      <span className="h-switch-track" aria-hidden="true">
        <span className="h-switch-thumb" />
      </span>
    </button>
  );
}
