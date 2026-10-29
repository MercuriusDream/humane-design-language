import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { morphDuration } from '../lib/motion';
import type { ControlSize } from './Button';
import './tabs.css';

export type TabItem = {
  /** A plain token, unique within the tabs. */
  id: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  /** The accessible name of the tablist. */
  label: string;
  tabs: TabItem[];
  /** Controlled selection. Pass it together with onChange. */
  value?: string;
  onChange?: (id: string) => void;
  /** Uncontrolled initial selection. Defaults to the first tab. */
  defaultValue?: string;
  /** standard: --control-height with body text. compact: --control-height-compact with small text. */
  size?: ControlSize;
};

/** Continuity: one raised plane morphs between tabs, and only the active panel renders. */
export function Tabs({ label, tabs, value, onChange, defaultValue, size = 'standard' }: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const current = value ?? internal;
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === current));
  const active = tabs[activeIndex];
  const activeId = active?.id;

  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const measured = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const placeRef = useRef<(instant: boolean) => void>(() => {});

  /** Moves the indicator over the active tab. Instant placement is used for layout changes the user did not cause. */
  function place(instant: boolean) {
    const track = trackRef.current;
    const tab = activeId === undefined ? undefined : tabRefs.current.get(activeId);
    if (!track || !tab) return;
    const next = { x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight };
    const prev = measured.current;
    const distance = prev
      ? Math.max(Math.hypot(next.x - prev.x, next.y - prev.y), Math.abs(next.w - prev.w), Math.abs(next.h - prev.h))
      : 0;
    track.style.setProperty('--dur', instant || !prev ? '0ms' : `${morphDuration(distance)}ms`);
    track.style.setProperty('--indicator-x', `${next.x}px`);
    track.style.setProperty('--indicator-y', `${next.y}px`);
    track.style.setProperty('--indicator-w', `${next.w}px`);
    track.style.setProperty('--indicator-h', `${next.h}px`);
    measured.current = next;
  }

  useLayoutEffect(() => {
    placeRef.current = place;
  });

  useLayoutEffect(() => {
    place(false);
  }, [activeId, tabs]);

  // Font loading and zoom change tab widths without a selection change. Re-place without travel.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => placeRef.current(true));
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function choose(id: string) {
    if (value === undefined) setInternal(id);
    if (id !== activeId) onChange?.(id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = tabs[next];
    choose(target.id);
    tabRefs.current.get(target.id)?.focus();
  }

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;

  return (
    <div className="h-tabs" data-size={size}>
      <div ref={trackRef} className="h-tabs-track" role="tablist" aria-label={label}>
        <span className="h-tabs-indicator" aria-hidden="true" />
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              className="h-tabs-tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(activeIndex)}
          tabIndex={0}
          className="h-tabs-panel"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
