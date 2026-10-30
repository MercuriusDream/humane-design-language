import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { moveFrom } from '../lib/morph';
import { morphDuration } from '../lib/motion';
import { usePreferences } from '../preferences';
import './sidebar.css';

export type SidebarItem = {
  id: string;
  label: string;
  /** Rendered as a link when present, otherwise as a button. */
  href?: string;
  /** A plain number after the label, such as unread items. Never a badge. */
  count?: number;
};

type Props = {
  title: string;
  items: SidebarItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True where the screen is too narrow to keep the panel open beside the content. */
  overlay: boolean;
  navLabel?: string;
  /** Extra content below the navigation, such as preferences. */
  children?: ReactNode;
};

/** Closed toggle chrome: label-side inset, gap, icon-side inset. Fixed horizontal geometry, not a vertical
    rhythm step. Sidebar.tsx sets these as inline custom properties so the measured closed width and the
    rendered chrome use one source. */
const CLOSED_CHROME = { start: 18, end: 14, gap: 10 } as const;
const CLOSED_CHROME_PX = CLOSED_CHROME.start + CLOSED_CHROME.gap + CLOSED_CHROME.end;

/**
 * One root surface in two forms. Open, it is the panel. Closed, it is a small surface that names where you are.
 * The panel shrinks into that closed form and grows back out of it. Nothing is swapped.
 */
export function Sidebar({ title, items, activeId, onSelect, open, onOpenChange, overlay, navLabel = 'Navigation', children }: Props) {
  const { side, reducedMotion } = usePreferences();
  const bodyId = useId();
  const surfaceRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnBodyFocus = () => {
    if (bodyRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
  };
  const changeOpen = (next: boolean) => {
    if (overlay && !next) returnBodyFocus();
    onOpenChange(next);
  };
  useLayoutEffect(() => {
    if (overlay && !open) returnBodyFocus();
    if (bodyRef.current) bodyRef.current.inert = !open;
  }, [overlay, open]);
  const measureRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const indicator = useIndicator(activeId);
  const [closedWidth, setClosedWidth] = useState(160);
  const [transitionsReady, setTransitionsReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setTransitionsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const activeLabel = items.find((item) => item.id === activeId)?.label ?? title;
  const closedLabels = [title, ...items.map((item) => item.label)];
  const closedLabelKey = closedLabels.join('\n');

  // Reserve the widest possible label once. Reading-position updates change only the words and selected item,
  // never the toggle's geometry. Hidden text remains measurable and follows font and text-size changes.
  useLayoutEffect(() => {
    const measureElement = measureRef.current;
    const icon = iconRef.current;
    if (!measureElement || !icon) return;
    const measure = () => {
      const labelWidth = Math.max(...Array.from(measureElement.children, (label) => label.getBoundingClientRect().width));
      setClosedWidth(Math.ceil(labelWidth) + Math.ceil(icon.getBoundingClientRect().width) + CLOSED_CHROME_PX);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measureElement);
    observer.observe(icon);
    return () => observer.disconnect();
  }, [closedLabelKey]);

  useSideMorph(surfaceRef, side, reducedMotion);
  useReducedCrossfade(surfaceRef, open, reducedMotion);

  // Over the content, the open panel closes on Escape or on a press outside it.
  useEffect(() => {
    if (!overlay || !open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      changeOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!surfaceRef.current?.contains(event.target as Node)) changeOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [overlay, open, onOpenChange]);

  const select = (id: string) => {
    onSelect?.(id);
    if (overlay) changeOpen(false);
  };

  return (
    <aside
      className="h-sidebar"
      data-root
      ref={surfaceRef}
      data-open={open}
      data-overlay={overlay || undefined}
      data-side={side}
      data-ready={transitionsReady || undefined}
      aria-label={title}
      style={
        {
          '--closed-width': `${closedWidth}px`,
          '--h-sidebar-closed-start': `${CLOSED_CHROME.start}px`,
          '--h-sidebar-closed-end': `${CLOSED_CHROME.end}px`,
          '--h-sidebar-icon-gap': `${CLOSED_CHROME.gap}px`,
        } as CSSProperties
      }
    >
      <button
        ref={toggleRef}
        type="button"
        className="h-sidebar-toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label={open ? `${title}, collapse sidebar` : `${activeLabel}, open sidebar`}
        onClick={() => changeOpen(!open)}
      >
        {/* Words first, the icon at the row's end: open, the title starts on the nav text's edge;
            closed, the current label starts where the title did, and the icon stays at the end as the surface morphs. */}
        <span className="h-sidebar-toggle-text" aria-hidden="true">
          <span className="h-sidebar-title">{title}</span>
          <span className="h-sidebar-current">{activeLabel}</span>
        </span>
        <SidebarIcon ref={iconRef} />
      </button>

      <span className="h-sidebar-measure" ref={measureRef} aria-hidden="true">
        {closedLabels.map((label, index) => <span key={`${index}:${label}`}>{label}</span>)}
      </span>

      <div className="h-sidebar-body" ref={bodyRef} id={bodyId}>
        <nav aria-label={navLabel}>
          <div className="h-nav" ref={indicator.navRef}>
            <span className="h-nav-indicator" style={indicator.style} aria-hidden="true" />
            <ul className="h-nav-list">
              {items.map((item) => {
                const current = item.id === activeId;
                const content = (
                  <>
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && <span className="h-nav-count">{item.count}</span>}
                  </>
                );
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <a
                        className="h-nav-link"
                        href={item.href}
                        data-id={item.id}
                        aria-current={current ? 'location' : undefined}
                        onClick={() => select(item.id)}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="h-nav-link"
                        data-id={item.id}
                        aria-current={current ? 'page' : undefined}
                        onClick={() => select(item.id)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        {children && <div className="h-sidebar-extra">{children}</div>}
      </div>
    </aside>
  );
}

function SidebarIcon({ ref }: { ref: RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={ref} className="h-sidebar-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 4v12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** One plane travels between items. Its duration follows the distance it covers. */
function useIndicator(activeId: string) {
  const navRef = useRef<HTMLDivElement>(null);
  const previousTop = useRef<number | null>(null);
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const link = navRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(activeId)}"]`);
      if (!link) return setStyle({ opacity: 0 });
      const top = link.offsetTop;
      const distance = previousTop.current === null ? 0 : top - previousTop.current;
      previousTop.current = top;
      setStyle({
        transform: `translateY(${top}px)`,
        height: link.offsetHeight,
        '--dur': `${distance === 0 ? 0 : morphDuration(distance)}ms`,
      } as CSSProperties);
    };
    measure();
    // The nav changes size whenever its rows do, as when the user enlarges text, so the plane follows its row.
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [activeId]);

  return { navRef, style };
}

/**
 * Under reduced motion the panel does not travel between its two forms, so the change is shown as a
 * short crossfade on the same surface instead of an instant jump.
 */
function useReducedCrossfade(surfaceRef: RefObject<HTMLElement | null>, open: boolean, reducedMotion: boolean) {
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reducedMotion) surfaceRef.current?.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 120, easing: 'linear' });
  }, [open, reducedMotion, surfaceRef]);
}

/** When the preferred side changes, the surface travels across the screen instead of jumping. */
function useSideMorph(surfaceRef: RefObject<HTMLElement | null>, side: string, reducedMotion: boolean) {
  const lastRect = useRef<DOMRect | null>(null);
  const lastSide = useRef(side);

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    if (lastSide.current !== side && lastRect.current) {
      el.getAnimations().forEach((animation) => animation instanceof CSSTransition || animation.cancel());
      moveFrom(el, lastRect.current, reducedMotion);
    }
    lastSide.current = side;
    lastRect.current = el.getBoundingClientRect();
  });
}
