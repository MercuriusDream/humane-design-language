import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { EASE_MORPH, morphIndicator } from '../lib/morph';
import { morphChannel, morphDuration } from '../lib/motion';
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
  const textRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const indicator = useIndicator(activeId, open);
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

  useSidebarMorph(surfaceRef, textRef, iconRef, open, side, overlay, reducedMotion);

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
        <span className="h-sidebar-toggle-text" ref={textRef} aria-hidden="true">
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
            <span className="h-nav-indicator" ref={indicator.indicatorRef} aria-hidden="true" />
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
function useIndicator(activeId: string, open: boolean) {
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useLayoutEffect(() => {
    const update = (instant: boolean) => {
      const nav = navRef.current;
      const indicator = indicatorRef.current;
      if (!indicator) return;
      const link = nav?.querySelector<HTMLElement>(`[data-id="${CSS.escape(activeId)}"]`);
      if (!link) {
        indicator.style.opacity = '0';
        return;
      }
      indicator.style.opacity = '1';
      morphIndicator(
        indicator,
        { x: 0, y: link.offsetTop, w: link.offsetWidth, h: link.offsetHeight },
        instant || !openRef.current,
      );
    };
    update(false);
    // The nav changes size whenever its rows do, as when the user enlarges text, so the plane follows its row.
    const observer = new ResizeObserver(() => update(true));
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [activeId]);

  return { navRef, indicatorRef };
}

const HERMITE_STEPS = 16;

type BoxRect = { left: number; top: number; width: number; height: number };
type Point = { left: number; top: number };

function toBox(r: DOMRect): BoxRect {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function toPoint(r: DOMRect): Point {
  return { left: r.left, top: r.top };
}

function isActive(anim: Animation | null): anim is Animation {
  return anim !== null && (anim.playState === 'running' || anim.playState === 'paused');
}

/**
 * Morphs the sidebar between its open and closed forms and across screen sides using transform and clip-path.
 * Layout properties never animate; interrupting a transition mid-flight preserves both position and velocity.
 */
function useSidebarMorph(
  surfaceRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  iconRef: RefObject<SVGSVGElement | null>,
  open: boolean,
  side: string,
  overlay: boolean,
  reducedMotion: boolean,
) {
  const stateRef = useRef<{
    rect: BoxRect | null;
    textPos: Point | null;
    iconPos: Point | null;
    radius: number;
    open: boolean;
    side: string;
    overlay: boolean;
    anim: Animation | null;
    textAnim: Animation | null;
    iconAnim: Animation | null;
    duration: number;
    atRect?: (u: number) => BoxRect;
    velRect?: (u: number) => { vL: number; vT: number; vW: number; vH: number };
  }>({
    rect: null,
    textPos: null,
    iconPos: null,
    radius: 2,
    open,
    side,
    overlay,
    anim: null,
    textAnim: null,
    iconAnim: null,
    duration: 0,
  });

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const state = stateRef.current;
    const snapshot = () => {
      if (isActive(state.anim)) return;
      state.rect = toBox(el.getBoundingClientRect());
      state.textPos = textRef.current ? toPoint(textRef.current.getBoundingClientRect()) : null;
      state.iconPos = iconRef.current ? toPoint(iconRef.current.getBoundingClientRect()) : null;
      state.radius = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    };
    const observer = new ResizeObserver(snapshot);
    observer.observe(el);
    return () => observer.disconnect();
  }, [surfaceRef, textRef, iconRef]);

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    const text = textRef.current;
    const icon = iconRef.current;
    if (!el) return;
    const state = stateRef.current;

    if (state.rect === null) {
      state.rect = toBox(el.getBoundingClientRect());
      state.textPos = text ? toPoint(text.getBoundingClientRect()) : null;
      state.iconPos = icon ? toPoint(icon.getBoundingClientRect()) : null;
      state.radius = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      state.open = open;
      state.side = side;
      state.overlay = overlay;
      return;
    }

    if (state.open === open && state.side === side && state.overlay === overlay) {
      if (!isActive(state.anim)) {
        state.rect = toBox(el.getBoundingClientRect());
        state.textPos = text ? toPoint(text.getBoundingClientRect()) : null;
        state.iconPos = icon ? toPoint(icon.getBoundingClientRect()) : null;
        state.radius = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      }
      return;
    }

    const active = isActive(state.anim) && state.duration > 0 && state.atRect && state.velRect;
    const time = active ? Number(state.anim!.currentTime ?? 0) : 0;
    const u = active ? Math.min(1, Math.max(0, time / state.duration)) : 0;
    const from = active ? state.atRect!(u) : state.rect;
    const vel = active && time > 0 && time < state.duration ? state.velRect!(u) : { vL: 0, vT: 0, vW: 0, vH: 0 };
    const fromText = active && text ? toPoint(text.getBoundingClientRect()) : state.textPos;
    const fromIcon = active && icon ? toPoint(icon.getBoundingClientRect()) : state.iconPos;
    const fromRadius = state.radius;

    state.anim?.cancel();
    state.textAnim?.cancel();
    state.iconAnim?.cancel();
    state.anim = null;
    state.textAnim = null;
    state.iconAnim = null;
    delete el.dataset.closing;

    const to = toBox(el.getBoundingClientRect());
    const toText = text ? toPoint(text.getBoundingClientRect()) : null;
    const toIcon = icon ? toPoint(icon.getBoundingClientRect()) : null;
    const toRadius = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

    state.rect = to;
    state.textPos = toText;
    state.iconPos = toIcon;
    state.radius = toRadius;
    state.open = open;
    state.side = side;
    state.overlay = overlay;

    const change = Math.max(
      Math.hypot(from.left - to.left, from.top - to.top),
      Math.abs(to.width - from.width),
      Math.abs(to.height - from.height),
    );
    const duration = morphDuration(change);
    el.style.setProperty('--dur', `${duration}ms`);

    if (reducedMotion) {
      const anim = el.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 120, easing: 'linear' });
      state.anim = anim;
      state.duration = 120;
      state.atRect = undefined;
      state.velRect = undefined;
      return;
    }

    const hasVelocity = vel.vL !== 0 || vel.vT !== 0 || vel.vW !== 0 || vel.vH !== 0;
    if (change < 0.5 && !hasVelocity) return;

    const needsOpenBox = !open && (from.width > to.width + 0.5 || from.height > to.height + 0.5);
    if (needsOpenBox) el.dataset.closing = 'true';

    const box = toBox(el.getBoundingClientRect());
    const domText = text ? toPoint(text.getBoundingClientRect()) : null;
    const domIcon = icon ? toPoint(icon.getBoundingClientRect()) : null;

    const lCh = morphChannel(from.left - to.left, vel.vL, duration);
    const tCh = morphChannel(from.top - to.top, vel.vT, duration);
    const wCh = morphChannel(from.width - to.width, vel.vW, duration);
    const hCh = morphChannel(from.height - to.height, vel.vH, duration);

    const atRect = (progress: number): BoxRect => ({
      left: to.left + lCh.at(progress),
      top: to.top + tCh.at(progress),
      width: to.width + wCh.at(progress),
      height: to.height + hCh.at(progress),
    });
    const velRect = (progress: number) => ({
      vL: lCh.velocity(progress),
      vT: tCh.velocity(progress),
      vW: wCh.velocity(progress),
      vH: hCh.velocity(progress),
    });

    const frameAt = (progress: number): Keyframe => {
      const r = atRect(progress);
      const tx = side === 'right' ? r.left + r.width - (box.left + box.width) : r.left - box.left;
      const ty = r.top - box.top;
      const hClip = Math.max(0, box.width - r.width);
      const bClip = Math.max(0, box.height - r.height);
      const radius = fromRadius + (toRadius - fromRadius) * progress;
      const clipPath =
        side === 'right'
          ? `inset(0px 0px ${bClip}px ${hClip}px round ${radius}px)`
          : `inset(0px ${hClip}px ${bClip}px 0px round ${radius}px)`;
      return { transform: `translate(${tx}px, ${ty}px)`, clipPath };
    };

    const steps = hasVelocity ? HERMITE_STEPS : 1;
    const keyframes = Array.from({ length: steps + 1 }, (_, i) => frameAt(i / steps));
    const easing = hasVelocity ? 'linear' : EASE_MORPH;
    const anim = el.animate(keyframes, { duration, easing });

    const tx0 = side === 'right' ? from.left + from.width - (box.left + box.width) : from.left - box.left;
    const ty0 = from.top - box.top;
    const animateChild = (child: Element | null, beforePos: Point | null, domPos: Point | null) => {
      if (!child || !beforePos || !domPos) return null;
      const dx0 = beforePos.left - (domPos.left + tx0);
      const dy0 = beforePos.top - (domPos.top + ty0);
      if (Math.hypot(dx0, dy0) < 0.5) return null;
      return child.animate([{ translate: `${dx0}px ${dy0}px` }, { translate: '0px 0px' }], {
        duration,
        easing: EASE_MORPH,
      });
    };

    state.anim = anim;
    state.textAnim = animateChild(text, fromText, domText);
    state.iconAnim = animateChild(icon, fromIcon, domIcon);
    state.duration = duration;
    state.atRect = atRect;
    state.velRect = velRect;

    anim.finished
      .then(() => {
        if (state.anim === anim) {
          delete el.dataset.closing;
          state.anim = null;
          state.textAnim = null;
          state.iconAnim = null;
        }
      })
      .catch(() => {});
  });
}
