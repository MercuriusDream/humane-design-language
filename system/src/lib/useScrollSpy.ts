import { useCallback, useEffect, useRef, useState } from 'react';

/** How far down the viewport a section's top must pass to become current. */
const READING_LINE = 0.3;

/**
 * The section being read: the last one whose top has passed the reading line, or the last section
 * once the page is scrolled to its end. Computed from positions on every scroll frame, so it always
 * follows the user's own scrolling.
 *
 * A jump from a link sets the target at once and holds it until that scroll ends, so an indicator
 * makes one move instead of visiting every section the scroll passes.
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '');
  const holding = useRef(false);
  const releaseJump = useRef<(() => void) | null>(null);
  const measureNow = useRef<() => void>(() => {});

  useEffect(() => () => releaseJump.current?.(), []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (holding.current) return;
      const line = window.innerHeight * READING_LINE;
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (atEnd) current = ids[ids.length - 1] ?? '';
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measureNow.current = measure;
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      measureNow.current = () => {};
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  const jumpTo = useCallback((id: string) => {
    releaseJump.current?.();
    setActive(id);
    holding.current = true;
    let timer = 0;
    const events = ['scrollend', 'wheel', 'touchstart', 'keydown'] as const;
    const cleanup = () => {
      holding.current = false;
      for (const event of events) window.removeEventListener(event, release);
      clearTimeout(timer);
      releaseJump.current = null;
    };
    const release = () => {
      cleanup();
      measureNow.current();
    };
    releaseJump.current = cleanup;
    for (const event of events) window.addEventListener(event, release, { passive: true });
    // A later jump cancels this fallback; an old timer must never release a new jump.
    timer = window.setTimeout(release, 1500);
  }, []);

  return { active, jumpTo };
}
