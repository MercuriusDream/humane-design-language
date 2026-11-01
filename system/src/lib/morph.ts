import { morphChannel, morphDuration } from './motion';

export const EASE_MORPH = 'cubic-bezier(0.2, 0, 0, 1)';

const HERMITE_STEPS = 16;

type Origin = Element | DOMRect | null | undefined;
type RunningMorph = {
  animation: Animation;
  duration: number;
  vx: (u: number) => number;
  vy: (u: number) => number;
  vsx?: (u: number) => number;
  vsy?: (u: number) => number;
};

const running = new WeakMap<HTMLElement, RunningMorph>();

function remember(el: HTMLElement, entry: RunningMorph): Animation {
  running.set(el, entry);
  return entry.animation;
}

function readVelocity(el: HTMLElement) {
  const prev = running.get(el);
  const active = prev && (prev.animation.playState === 'running' || prev.animation.playState === 'paused');
  if (!active || prev.duration <= 0) {
    return { interrupted: false, vx: 0, vy: 0, vsx: 0, vsy: 0 };
  }
  const time = Number(prev.animation.currentTime ?? 0);
  if (time <= 0 || time >= prev.duration) {
    return { interrupted: true, vx: 0, vy: 0, vsx: 0, vsy: 0 };
  }
  const u = time / prev.duration;
  const rate = prev.animation.playbackRate;
  return {
    interrupted: true,
    vx: prev.vx(u) * rate,
    vy: prev.vy(u) * rate,
    vsx: (prev.vsx?.(u) ?? 0) * rate,
    vsy: (prev.vsy?.(u) ?? 0) * rate,
  };
}

/**
 * Grow an element out of its origin: the element starts at the origin's position and size and
 * morphs to its own. Use it for anything that appears because something was pressed: a dialog
 * from its button, a menu from its trigger, a detail view from its row.
 *
 * Returns the running Animation. Call `.reverse()` on it to send the element back into its origin
 * from wherever it is, or call `growFrom` again to redirect it while preserving position and velocity.
 *
 * Under reduced motion the element only fades in place.
 */
export function growFrom(el: HTMLElement, origin: Origin, reducedMotion: boolean): Animation | null {
  const state = readVelocity(el);
  const from = state.interrupted ? el.getBoundingClientRect() : origin instanceof Element ? origin.getBoundingClientRect() : origin;
  const opacity = state.interrupted ? Number.parseFloat(getComputedStyle(el).opacity) || 1 : 0.4;
  running.get(el)?.animation.cancel();
  const to = el.getBoundingClientRect();

  if (reducedMotion || !from || to.width === 0 || to.height === 0) {
    const animation = el.animate([{ opacity: state.interrupted ? opacity : 0 }, { opacity: 1 }], {
      duration: 120,
      easing: 'linear',
    });
    return remember(el, { animation, duration: 120, vx: () => 0, vy: () => 0 });
  }

  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const sx = Math.max(from.width / to.width, 0.01);
  const sy = Math.max(from.height / to.height, 0.01);
  const change = Math.max(Math.hypot(dx, dy), Math.abs(to.width - from.width), Math.abs(to.height - from.height));
  const duration = morphDuration(change);
  const xCh = morphChannel(dx, state.vx, duration);
  const yCh = morphChannel(dy, state.vy, duration);
  const sxCh = morphChannel(sx - 1, state.vsx, duration);
  const syCh = morphChannel(sy - 1, state.vsy, duration);
  const hasVelocity = state.vx !== 0 || state.vy !== 0 || state.vsx !== 0 || state.vsy !== 0;

  const keyframes: Keyframe[] = hasVelocity
    ? Array.from({ length: HERMITE_STEPS + 1 }, (_, i) => {
        if (i === HERMITE_STEPS) return { transformOrigin: 'top left', transform: 'none', opacity: 1 };
        const u = i / HERMITE_STEPS;
        const x = xCh.at(u);
        const y = yCh.at(u);
        const scaleX = Math.max(0.01, 1 + sxCh.at(u));
        const scaleY = Math.max(0.01, 1 + syCh.at(u));
        return {
          transformOrigin: 'top left',
          transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`,
          opacity: opacity + (1 - opacity) * u,
        };
      })
    : [
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity },
        { transformOrigin: 'top left', transform: 'none', opacity: 1 },
      ];

  const animation = el.animate(keyframes, {
    duration,
    easing: hasVelocity ? 'linear' : EASE_MORPH,
  });
  return remember(el, {
    animation,
    duration,
    vx: xCh.velocity,
    vy: yCh.velocity,
    vsx: sxCh.velocity,
    vsy: syCh.velocity,
  });
}

/**
 * Move an element from where it was to where it is now (FLIP). Measure `before` with
 * getBoundingClientRect() before the layout change, then call this after it.
 * Interrupting an active move preserves both its on-screen position and its instantaneous velocity.
 */
export function moveFrom(el: HTMLElement, before: DOMRect, reducedMotion: boolean): Animation | null {
  const state = readVelocity(el);
  // Measure the resting destination without the old transform. `before` already contains the
  // interrupted animation's on-screen position; leaving that transform applied would subtract it twice.
  running.get(el)?.animation.cancel();
  const after = el.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  if (dx === 0 && dy === 0 && state.vx === 0 && state.vy === 0) return null;
  if (reducedMotion) {
    const animation = el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 120, easing: 'linear' });
    return remember(el, { animation, duration: 120, vx: () => 0, vy: () => 0 });
  }
  const duration = morphDuration(Math.hypot(dx, dy));
  const xCh = morphChannel(dx, state.vx, duration);
  const yCh = morphChannel(dy, state.vy, duration);
  const hasVelocity = state.vx !== 0 || state.vy !== 0;

  const keyframes: Keyframe[] = hasVelocity
    ? Array.from({ length: HERMITE_STEPS + 1 }, (_, i) => {
        if (i === HERMITE_STEPS) return { transform: 'none' };
        const u = i / HERMITE_STEPS;
        return { transform: `translate(${xCh.at(u)}px, ${yCh.at(u)}px)` };
      })
    : [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }];

  const animation = el.animate(keyframes, {
    duration,
    easing: hasVelocity ? 'linear' : EASE_MORPH,
  });
  return remember(el, { animation, duration, vx: xCh.velocity, vy: yCh.velocity });
}

type IndicatorRect = { x: number; y: number; w: number; h: number };
const placedIndicators = new WeakMap<HTMLElement, IndicatorRect>();

/**
 * Moves a selection indicator to `target` without layout transitions.
 * Preserves position and velocity when retargeted mid-flight.
 */
export function morphIndicator(el: HTMLElement, target: IndicatorRect, instant = false): Animation | null {
  const hadPrevious = placedIndicators.has(el);
  const state = readVelocity(el);
  const before = hadPrevious && !instant ? el.getBoundingClientRect() : null;
  running.get(el)?.animation.cancel();
  placedIndicators.set(el, target);

  const restTransform = `translate(${target.x}px, ${target.y}px)`;
  el.style.width = `${target.w}px`;
  el.style.height = `${target.h}px`;
  el.style.transform = restTransform;

  const reduced = instant || document.documentElement.dataset.motion === 'reduced';
  if (reduced || !before || target.w === 0 || target.h === 0) return null;

  const after = el.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  const sx = Math.max(0.01, before.width / target.w);
  const sy = Math.max(0.01, before.height / target.h);
  const change = Math.max(Math.hypot(dx, dy), Math.abs(target.w - before.width), Math.abs(target.h - before.height));
  const hasVelocity = state.vx !== 0 || state.vy !== 0 || state.vsx !== 0 || state.vsy !== 0;
  if (change < 0.5 && !hasVelocity) return null;

  const duration = morphDuration(change);
  const xCh = morphChannel(dx, state.vx, duration);
  const yCh = morphChannel(dy, state.vy, duration);
  const sxCh = morphChannel(sx - 1, state.vsx, duration);
  const syCh = morphChannel(sy - 1, state.vsy, duration);

  const keyframes: Keyframe[] = hasVelocity
    ? Array.from({ length: HERMITE_STEPS + 1 }, (_, i) => {
        if (i === HERMITE_STEPS) return { transformOrigin: 'top left', transform: restTransform };
        const u = i / HERMITE_STEPS;
        const x = target.x + xCh.at(u);
        const y = target.y + yCh.at(u);
        const scaleX = Math.max(0.01, 1 + sxCh.at(u));
        const scaleY = Math.max(0.01, 1 + syCh.at(u));
        return {
          transformOrigin: 'top left',
          transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`,
        };
      })
    : [
        {
          transformOrigin: 'top left',
          transform: `translate(${target.x + dx}px, ${target.y + dy}px) scale(${sx}, ${sy})`,
        },
        { transformOrigin: 'top left', transform: restTransform },
      ];

  const animation = el.animate(keyframes, {
    duration,
    easing: hasVelocity ? 'linear' : EASE_MORPH,
  });
  return remember(el, {
    animation,
    duration,
    vx: xCh.velocity,
    vy: yCh.velocity,
    vsx: sxCh.velocity,
    vsy: syCh.velocity,
  });
}
