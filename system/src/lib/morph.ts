import { morphDuration } from './motion';

export const EASE_MORPH = 'cubic-bezier(0.2, 0, 0, 1)';

type Origin = Element | DOMRect | null | undefined;
const running = new WeakMap<HTMLElement, Animation>();

function remember(el: HTMLElement, animation: Animation): Animation {
  running.set(el, animation);
  return animation;
}

/**
 * Grow an element out of its origin: the element starts at the origin's position and size and
 * morphs to its own. Use it for anything that appears because something was pressed: a dialog
 * from its button, a menu from its trigger, a detail view from its row.
 *
 * Returns the running Animation. Call `.reverse()` on it to send the element back into its origin
 * from wherever it is, which keeps the morph interruptible. Returns null when there is nothing to
 * animate.
 *
 * Under reduced motion the element only fades in place.
 */
export function growFrom(el: HTMLElement, origin: Origin, reducedMotion: boolean): Animation | null {
  const previous = running.get(el);
  const interrupted = previous && (previous.playState === 'running' || previous.playState === 'paused');
  const from = interrupted ? el.getBoundingClientRect() : origin instanceof Element ? origin.getBoundingClientRect() : origin;
  const opacity = interrupted ? getComputedStyle(el).opacity : 0.4;
  previous?.cancel();
  const to = el.getBoundingClientRect();

  if (reducedMotion || !from || to.width === 0 || to.height === 0) {
    return remember(el, el.animate([{ opacity: interrupted ? opacity : 0 }, { opacity: 1 }], { duration: 120, easing: 'linear' }));
  }

  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const sx = Math.max(from.width / to.width, 0.01);
  const sy = Math.max(from.height / to.height, 0.01);
  const change = Math.max(Math.hypot(dx, dy), Math.abs(to.width - from.width), Math.abs(to.height - from.height));

  return remember(el, el.animate(
    [
      { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity },
      { transformOrigin: 'top left', transform: 'none', opacity: 1 },
    ],
    { duration: morphDuration(change), easing: EASE_MORPH },
  ));
}

/**
 * Move an element from where it was to where it is now (FLIP). Measure `before` with
 * getBoundingClientRect() before the layout change, then call this after it.
 * Measuring during a previous move includes that move's transform, so a new move starts from
 * wherever the element is on screen.
 */
export function moveFrom(el: HTMLElement, before: DOMRect, reducedMotion: boolean): Animation | null {
  // Measure the resting destination without the old transform. `before` already contains the
  // interrupted animation's on-screen position; leaving that transform applied would subtract it twice.
  running.get(el)?.cancel();
  const after = el.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  if (dx === 0 && dy === 0) return null;
  if (reducedMotion) return remember(el, el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 120, easing: 'linear' }));
  return remember(el, el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
    duration: morphDuration(Math.hypot(dx, dy)),
    easing: EASE_MORPH,
  }));
}
