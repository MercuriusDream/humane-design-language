import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Button, type ControlSize } from './Button';
import './arrivals.css';

export type ArrivalsProps = {
  /** New items the user did not request. Zero leaves the reserved slot empty. */
  count: number;
  /** Called when the user presses the label. The insertion it causes may move content. */
  onShow: () => void;
  /** Label for the pending count. Defaults to defaultArrivalsLabel. */
  label?: (count: number) => string;
  /** The list. It sits below the reserved slot. */
  children?: ReactNode;
  /** The tier of the slot and its button: standard --control-height, compact --control-height-compact. */
  size?: ControlSize;
};

/** "{count} new". The adjective takes no plural, so one is "1 new", the same form as many. */
export function defaultArrivalsLabel(count: number): string {
  return `${count} new`;
}

/** New items wait in a reserved control-height slot and are announced without interrupting input. */
export function Arrivals({ count, onShow, label = defaultArrivalsLabel, children, size = 'standard' }: ArrivalsProps) {
  const pending = count > 0;
  const destination = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusPending = useRef(false);
  const [announcement, setAnnouncement] = useState('');

  // Coalesce bursts while keeping the eventual announcement current.
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(count > 0 ? label(count) : ''), 200);
    return () => clearTimeout(timer);
  }, [count, label]);
  useLayoutEffect(() => {
    if (!pending && focusPending.current) {
      if (document.activeElement === document.body || document.activeElement === trigger.current) destination.current?.focus();
      focusPending.current = false;
    }
  }, [pending]);
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      if (event.target !== trigger.current && event.target !== document.body) focusPending.current = false;
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  return (
    <div className="h-arrivals" data-size={size}>
      <div className="h-arrivals-slot">
        {pending && (
          <Button ref={trigger} variant="quiet" depth={1} size={size} className="h-arrivals-button" onClick={() => {
            focusPending.current = document.activeElement === trigger.current;
            onShow();
            if (document.activeElement !== trigger.current && document.activeElement !== document.body) focusPending.current = false;
          }}>
            {label(count)}
          </Button>
        )}
      </div>
      <div className="h-arrivals-announce" role="status" aria-live="polite">
        {announcement}
      </div>
      <div ref={destination} className="h-arrivals-content" tabIndex={-1} role="region" aria-label="Items">{children}</div>
    </div>
  );
}
