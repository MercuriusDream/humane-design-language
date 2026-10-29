import type { ReactNode } from 'react';
import type { ControlSize } from './Button';
import './list.css';

type ListProps = {
  /** Read by assistive technology as the name of the list. */
  label: string;
  /** Dense rows touch and separate with a line. Otherwise rows are separated by a 2px gap of plane. */
  dense?: boolean;
  /** standard: --control-height rows with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
  children?: ReactNode;
};

type ListRowProps = {
  title: ReactNode;
  /** A count or value, end-aligned in tertiary ink. */
  meta?: ReactNode;
  /** Supporting text wraps without truncation. */
  description?: ReactNode;
  selected?: boolean;
  /** Unread titles are heavier and stronger. Read titles recede. */
  unread?: boolean;
  /** Makes the primary content a button; trailing actions remain independent siblings. */
  onSelect?: () => void;
  /** Trailing actions. */
  end?: ReactNode;
  /** The depth of the surface the list sits on. Sets the corner radius of the first and last rows. */
  depth?: 1 | 2;
};

/** Rule: divide with planes. Dense lists separate rows with a line, for dense repetition only. */
export function List({ label, dense = false, size = 'standard', children }: ListProps) {
  return (
    <div className="h-list" role="group" aria-label={label} data-dense={dense || undefined} data-size={size}>
      {children}
    </div>
  );
}

/** Divide with planes. Selection uses the fill plane; independent actions keep the 2px control corner. */
export function ListRow({
  title,
  meta,
  description,
  selected = false,
  unread = false,
  onSelect,
  end,
  depth = 1,
}: ListRowProps) {
  const content = (
    <>
      <span className="h-list-main">
        <span className="h-list-title">{title}</span>
        {description != null && <span className="h-list-description">{description}</span>}
      </span>
      {meta != null && <span className="h-list-meta">{meta}</span>}
    </>
  );

  const attributes = {
    className: 'h-list-row',
    'data-depth': depth,
    'data-selected': selected,
    'data-unread': unread,
    'aria-current': selected ? ('true' as const) : undefined,
  };

  return (
    <div {...attributes}>
      {onSelect ? (
        <button type="button" className="h-list-primary" aria-current={selected ? 'true' : undefined} onClick={onSelect}>{content}</button>
      ) : <div className="h-list-primary">{content}</div>}
      {end != null && <span className="h-list-end">{end}</span>}
    </div>
  );
}
