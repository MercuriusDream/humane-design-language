import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import { Button, type ControlSize } from './Button';
import { morphDuration } from '../lib/motion';
import { usePreferences } from '../preferences';
import './undoable-list.css';

/** present: in the list. removed: kept in place with Undo. leaving: collapsing, then dropped. */
export type UndoStatus = 'present' | 'removed' | 'leaving';
/** One list entry and its status. */
export type UndoEntry<T> = { item: T; status: UndoStatus };

/** Compatibility fallback for unmeasured rows. The component measures actual row heights before settling. */
export const UNDO_ROW_HEIGHT = 68;

/**
 * Removal without confirmation (Prefer undo to confirmation). A removed entry keeps its place until
 * the list settles; a leaving entry collapses, then is dropped. Each entry has its own timer.
 */
export function useUndoableList<T extends { id: string }>(initial: T[]) {
  const { reducedMotion } = usePreferences();
  const initialRef = useRef(initial);
  const [entries, setEntries] = useState<UndoEntry<T>[]>(() => initial.map((item) => ({ item, status: 'present' })));
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const heights = useRef(new Map<string, number>());
  const held = useRef(false);
  const hold = () => {
    held.current = true;
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setEntries(all => all.some(e => e.status === 'leaving')
      ? all.map(e => e.status === 'leaving' ? { ...e, status: 'removed' } : e)
      : all);
  };

  // Returns the same array when nothing matches, so no re-render or timer pass runs.
  const setStatus = (id: string, from: UndoStatus[], to: UndoStatus) =>
    setEntries((all) =>
      all.some((e) => e.item.id === id && from.includes(e.status))
        ? all.map((e) => (e.item.id === id && from.includes(e.status) ? { ...e, status: to } : e))
        : all,
    );

  // Removing an entry keeps it in place as its own undo control.
  const remove = (id: string) => setStatus(id, ['present'], 'removed');

  // Undo restores a removed entry, and a leaving entry too: the collapse reverses from where it is.
  const undo = (id: string) => setStatus(id, ['removed', 'leaving'], 'present');

  // Called by the list when the pointer and focus have both left it. Rows never shift under the user.
  const settle = (measured?: Map<string, number>) => {
    held.current = false;
    if (measured) heights.current = measured;
    setEntries((all) =>
      all.some((e) => e.status === 'removed')
        ? all.map((e) => (e.status === 'removed' ? { ...e, status: 'leaving' } : e))
        : all,
    );
  };

  const restoreAll = (next?: T[]) => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setEntries((next ?? initialRef.current).map((item) => ({ item, status: 'present' })));
  };

  // One timer per leaving entry, so each row waits its own full collapse before it is dropped.
  useEffect(() => {
    const pending = timers.current;
    if (held.current) return;
    const leavingIds = new Set(entries.filter((e) => e.status === 'leaving').map((e) => e.item.id));

    for (const id of leavingIds) {
      if (pending.has(id)) continue;
      const timer = setTimeout(
        () => {
          pending.delete(id);
          setEntries((all) => all.filter((e) => !(e.status === 'leaving' && e.item.id === id)));
        },
        reducedMotion ? 120 : Math.max(120, morphDuration(heights.current.get(id) ?? UNDO_ROW_HEIGHT)),
      );
      pending.set(id, timer);
    }

    for (const [id, timer] of pending) {
      if (!leavingIds.has(id)) {
        clearTimeout(timer);
        pending.delete(id);
      }
    }
  }, [entries, reducedMotion]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  return { entries, remove, undo, settle, hold, restoreAll };
}

/** Props of UndoableList. The entries and handlers come from useUndoableList. */
export type UndoableListProps<T extends { id: string }> = {
  /** Accessible name of the list. */
  label: string;
  entries: UndoEntry<T>[];
  remove: (id: string) => void;
  undo: (id: string) => void;
  settle: (heights?: Map<string, number>) => void;
  /** Pauses settlement and reverses leaving rows when interaction returns. */
  hold: () => void;
  /** The name of an item, used in announcements. */
  renderLabel: (item: T) => string;
  /** Content kept in place in both present and removed states, preserving the row's geometry. */
  renderRow?: (item: T) => ReactNode;
  /** Shown when the list has no entries left. */
  empty?: string;
  /** The tier of the row: its label's text and its action share it. */
  size?: ControlSize;
};

/** A list whose removals are undone in place. The live region announces each change the user made. */
export function UndoableList<T extends { id: string }>({
  label,
  entries,
  remove,
  undo,
  settle,
  hold,
  renderLabel,
  renderRow,
  empty,
  size = 'standard',
}: UndoableListProps<T>) {
  const { reducedMotion } = usePreferences();
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const settleMeasured = () => {
    const measured = new Map<string, number>();
    for (const [id, row] of rowRefs.current) {
      const height = row.getBoundingClientRect().height;
      measured.set(id, height);
      row.style.setProperty('--dur', `${morphDuration(height)}ms`);
    }
    settle(measured);
  };
  const pointerInside = useRef(false);
  const [announcement, setAnnouncement] = useState('');

  // Settle only when the pointer has left and focus is outside, so rows never shift under the user.
  const onPointerEnter = () => { pointerInside.current = true; hold(); };
  const onPointerLeave = () => {
    pointerInside.current = false;
    if (!listRef.current?.contains(document.activeElement)) settleMeasured();
  };
  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!pointerInside.current && !listRef.current?.contains(next)) settleMeasured();
  };

  const onRemove = (item: T) => {
    remove(item.id);
    setAnnouncement(`Removed ${renderLabel(item)}. Undo is available.`);
  };
  const onUndo = (item: T) => {
    undo(item.id);
    setAnnouncement(`Restored ${renderLabel(item)}.`);
  };

  return (
    <div className="h-undoable-list-field">
      <ul
        className="h-undoable-list"
        ref={listRef}
        aria-label={label}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        onFocus={hold}
        data-reduced-motion={reducedMotion || undefined}
        data-size={size}
        style={{ '--dur': `${morphDuration(UNDO_ROW_HEIGHT)}ms` } as CSSProperties}
      >
        {entries.map(({ item, status }) => {
          const name = renderLabel(item);
          const removed = status !== 'present';
          return (
            <li key={item.id} ref={el => { if (el) rowRefs.current.set(item.id, el); else rowRefs.current.delete(item.id); }} className="h-undoable-list-item" data-status={status}>
              <div className="h-undoable-list-clip">
                <div className="h-undoable-list-row">
                  <span className="h-undoable-list-label">{renderRow?.(item) ?? name}</span>
                  {/* One button that changes meaning, so focus stays where the user left it. */}
                  <Button depth={2} size={size} className="h-undoable-list-action" onClick={() => (removed ? onUndo(item) : onRemove(item))}>
                    <span className="h-undoable-list-action-label">
                      <span aria-hidden={removed} data-hidden={removed}>Remove</span>
                      <span aria-hidden={!removed} data-hidden={!removed}>Undo</span>
                    </span>
                    <span className="h-undoable-list-sr">{removed ? ` removal of ${name}` : ` ${name}`}</span>
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {entries.length === 0 && empty && <p className="h-undoable-list-empty">{empty}</p>}
      <p className="h-undoable-list-sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
