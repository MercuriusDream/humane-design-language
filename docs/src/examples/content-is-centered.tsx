import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Segmented, moveFrom, morphDuration, usePreferences, type Side } from 'humane-system';
import { Example } from '../components/Example';
import './content-is-centered.css';

const NAV = ['Library', 'Recent', 'Albums', 'Shared'];

const OPTIONS: { value: Side; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

/** The reading column is centered in the space beside the sidebar. Its text stays at the start of each line. */
export default function ContentIsCentered() {
  const { reducedMotion } = usePreferences();
  const [side, setSide] = useState<Side>('left');
  const [dur, setDur] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  // Where the sidebar is on screen when the user asks for a change, including any morph still running.
  const fromRect = useRef<DOMRect | null>(null);

  const choose = (next: Side) => {
    const frame = frameRef.current;
    const sidebar = sidebarRef.current;
    if (next === side || !frame || !sidebar) return;
    fromRect.current = sidebar.getBoundingClientRect();
    setDur(morphDuration(frame.offsetWidth - sidebar.offsetWidth));
    setSide(next);
  };

  // One object travels from where it was to where it is now. A new change started mid-flight
  // continues from the current position instead of jumping back.
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const from = fromRect.current;
    if (!sidebar || !from) return;
    fromRect.current = null;
    sidebar.getAnimations().forEach((animation) => animation.cancel());
    moveFrom(sidebar, from, reducedMotion);
    // Under reduced motion the sidebar does not travel. It jumps to its new side and fades in place.
    if (reducedMotion) sidebar.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 120, easing: 'linear' });
  }, [side, reducedMotion]);

  return (
    <Example
      hint="Move the sidebar to see the column recenter beside it."
      controls={<Segmented size="compact" label="Sidebar" options={OPTIONS} value={side} onChange={choose} />}
    >
      <div
        className="ex-content-is-centered-frame"
        ref={frameRef}
        data-side={side}
        style={{ '--dur': `${dur}ms` } as CSSProperties}
      >
        <aside className="ex-content-is-centered-sidebar" ref={sidebarRef} data-root aria-label="Example sidebar">
          <p className="ex-content-is-centered-title">Photos</p>
          <ul className="ex-content-is-centered-nav">
            {NAV.map((item, index) => (
              <li
                key={item}
                className="ex-content-is-centered-item"
                data-current={index === 0 || undefined}
                aria-current={index === 0 ? 'page' : undefined}
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
        <div className="ex-content-is-centered-page">
          <article className="ex-content-is-centered-column">
            <h4 className="ex-content-is-centered-heading">Morning walk</h4>
            <p className="ex-content-is-centered-text">
              Fog over the river until nine. The bridge lights were still on when the first rowers went out.
            </p>
            <p className="ex-content-is-centered-text">Fourteen photos, all taken before the tide turned.</p>
          </article>
        </div>
      </div>
    </Example>
  );
}
