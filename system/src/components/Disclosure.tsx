import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { morphDuration } from '../lib/motion';
import type { ControlSize } from './Button';
import './disclosure.css';

export type DisclosureProps = {
  title: ReactNode;
  /** Right-aligned, tertiary ink. A plain value such as a count. Never a badge. */
  meta?: ReactNode;
  /** Controlled open state. Pair with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Depth of the surface the row sits on. Depth 2 takes the radius of depth 2. */
  depth?: 1 | 2;
  /** standard: a --control-height header with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
  children?: ReactNode;
};

/**
 * A row that morphs open in place. The same row grows to reveal its content, so the open and closed
 * states are one object, not two. Duration follows the height that changes.
 */
export function Disclosure({ title, meta, open, onOpenChange, defaultOpen = false, depth = 1, size = 'standard', children }: DisclosureProps) {
  const bodyId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // The grid row animates between 0fr and 1fr. Its duration comes from the content height it covers.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className="h-disclosure"
      data-depth={depth}
      data-size={size}
      data-open={isOpen}
      style={{ '--dur': `${morphDuration(height)}ms` } as CSSProperties}
    >
      <button
        type="button"
        className="h-disclosure-header"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={toggle}
      >
        <span className="h-disclosure-title">{title}</span>
        {meta != null && <span className="h-disclosure-meta">{meta}</span>}
        <svg className="h-disclosure-chevron" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="h-disclosure-body" id={bodyId} inert={!isOpen}>
        <div className="h-disclosure-clip">
          <div className="h-disclosure-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
