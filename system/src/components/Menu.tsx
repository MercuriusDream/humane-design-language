import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button, type ControlSize } from './Button';
import { growFrom } from '../lib/morph';
import { usePreferences } from '../preferences';
import './menu.css';

/** One action on the menu's plane. */
export type MenuItem = { id: string; label: string; onSelect(): void; danger?: boolean; disabled?: boolean };
/** The trigger follows its containing surface; the popup is an independent root. The items take the trigger's size. */
export type MenuProps = { label: string; items: MenuItem[]; depth?: 1 | 2; align?: 'start' | 'end'; size?: ControlSize };

/** A reversible top-layer menu, constrained to the visible viewport. */
export function Menu({ label, items, depth = 1, align = 'start', size = 'standard' }: MenuProps) {
  const { reducedMotion } = usePreferences();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const desiredOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const firstFocus = useRef<'first' | 'last'>('first');
  const enabled = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
  const close = () => {
    desiredOpen.current = false;
    if (menuRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setOpen(false);
  };
  const show = (focus: 'first' | 'last' = 'first') => {
    firstFocus.current = focus;
    desiredOpen.current = true;
    setOpen(true);
  };
  const position = () => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger || !menu.matches(':popover-open')) return;
    const viewport = window.visualViewport;
    const left = (viewport?.offsetLeft ?? 0) + 8;
    const top = (viewport?.offsetTop ?? 0) + 8;
    const width = Math.max(0, (viewport?.width ?? window.innerWidth) - 16);
    const height = Math.max(0, (viewport?.height ?? window.innerHeight) - 16);
    const right = left + width;
    const bottom = top + height;
    menu.style.maxWidth = `${width}px`;
    menu.style.minWidth = `min(12rem, ${width}px)`;
    menu.style.maxHeight = `${height}px`;
    const anchor = trigger.getBoundingClientRect();
    const naturalHeight = menu.scrollHeight;
    const below = Math.max(0, bottom - anchor.bottom - 4);
    const above = Math.max(0, anchor.top - 4 - top);
    const useAbove = naturalHeight > below && above > below;
    const available = Math.min(height, useAbove ? above : below);
    menu.style.maxHeight = `${Math.max(0, available)}px`;
    const w = menu.offsetWidth;
    const h = menu.offsetHeight;
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const end = (align === 'end') !== rtl;
    menu.style.left = `${Math.max(left, Math.min(end ? anchor.right - w : anchor.left, right - w))}px`;
    menu.style.top = `${Math.max(top, Math.min(useAbove ? anchor.top - 4 - h : anchor.bottom + 4, bottom - h))}px`;
  };

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (open) {
      if (!menu.matches(':popover-open')) menu.showPopover();
      position();
      if (animation.current) {
        animation.current.onfinish = null;
        if (animation.current.playbackRate < 0) animation.current.reverse();
      } else {
        animation.current = growFrom(menu, triggerRef.current, reducedMotion);
        (animation.current?.effect as KeyframeEffect | null)?.updateTiming({ fill: 'both' });
      }
      const options = enabled();
      (firstFocus.current === 'last' ? options.at(-1) : options[0])?.focus();
      if (!options.length) menu.focus();
    } else if (menu.matches(':popover-open')) {
      const finish = () => {
        if (desiredOpen.current) return;
        menu.hidePopover();
        animation.current?.cancel();
        animation.current = null;
      };
      if (animation.current) {
        animation.current.onfinish = finish;
        if (animation.current.playbackRate > 0) animation.current.reverse();
      } else finish();
    }
  }, [open]);

  useLayoutEffect(() => { if (open) position(); }, [items, align]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('keydown', onEscape, true);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('keydown', onEscape, true);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      window.visualViewport?.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('scroll', position);
    };
  }, [open, align]);
  useEffect(() => () => {
    if (animation.current) { animation.current.onfinish = null; animation.current.cancel(); animation.current = null; }
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); show(event.key === 'ArrowUp' ? 'last' : 'first');
      }
      return;
    }
    if (event.key === 'Tab') {
      // Restore the trigger as the sequential-navigation starting point before the browser advances.
      close();
      if (event.shiftKey) event.preventDefault();
      return;
    }
    const list = enabled();
    const index = list.indexOf(event.target as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case 'ArrowDown': next = (index + 1) % list.length; break;
      case 'ArrowUp': next = index <= 0 ? list.length - 1 : index - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = list.length - 1; break;
      default: return;
    }
    event.preventDefault();
    list[next]?.focus();
  };
  return (
    <div className="h-menu-field" onKeyDown={onKeyDown}>
      <Button ref={triggerRef} id={`${id}-trigger`} depth={depth} size={size} aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`} onClick={() => open ? close() : show()}>{label}</Button>
      <div ref={menuRef} id={`${id}-menu`} popover="manual" className="h-menu" data-root data-size={size} role="menu" aria-labelledby={`${id}-trigger`} tabIndex={-1} inert={!open}>
        {items.map(item => <button key={item.id} type="button" role="menuitem" tabIndex={-1} className="h-menu-item" data-danger={item.danger || undefined} disabled={item.disabled} onClick={() => { close(); item.onSelect(); }}>{item.label}</button>)}
      </div>
    </div>
  );
}
