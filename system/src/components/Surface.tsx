import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import './surface.css';

export type Depth = 0 | 1 | 2;
export type Plane = 'sunken' | 'base' | 'raised' | 'fill' | 'none';

type Props = HTMLAttributes<HTMLElement> & {
  /** 0 is a root: it takes the 2px corner. Deeper surfaces take the same 2px corner. */
  depth?: Depth;
  plane?: Plane;
  /** Pad with the step for this depth. */
  padded?: boolean;
  as?: ElementType;
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
};

/**
 * A plane of one lightness. Every depth takes the same 2px corner, and only a root is measured for its size.
 */
export function Surface({ depth = 0, plane = 'raised', padded = true, as: Tag = 'div', className, ...rest }: Props) {
  return (
    <Tag
      className={['h-surface', className].filter(Boolean).join(' ')}
      data-depth={depth}
      data-root={depth === 0 || undefined}
      data-plane={plane}
      data-padded={padded || undefined}
      {...rest}
    />
  );
}
