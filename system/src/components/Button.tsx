import { forwardRef, type ButtonHTMLAttributes } from 'react';
import './button.css';

export type ButtonVariant = 'default' | 'strong' | 'quiet' | 'danger';
/** standard: --control-height with body text. compact: --control-height-compact with small text. */
export type ControlSize = 'standard' | 'compact';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * default: a control plane. strong: the one main action of a region, set in ink, not in color.
   * quiet: no plane until hovered. danger: a destructive action, the only saturated variant.
   */
  variant?: ButtonVariant;
  /** Depth of the surface the button sits on. Depth 2 takes the radius of depth 2. */
  depth?: 1 | 2;
  size?: ControlSize;
};

/** A plane identified by its label. */
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'default', depth = 1, size = 'standard', type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={['h-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-depth={depth}
      data-size={size}
      {...rest}
    />
  );
});
