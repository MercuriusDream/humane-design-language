import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Segmented, morphDuration, usePreferences, type Side } from 'humane-system';
import { Example } from '../components/Example';
import './navigation-is-a-sidebar-that-morphs.css';

type SectionId = 'library' | 'albums' | 'shared' | 'trash';

const SECTIONS: { id: SectionId; label: string; body: string }[] = [
  {
    id: 'library',
    label: 'Library',
    body: 'Fog over the river until nine. The bridge lights were still on when the first rowers went out.',
  },
  { id: 'albums', label: 'Albums', body: 'Two rolls on the old camera, one on the new. Window light only.' },
  { id: 'shared', label: 'Shared', body: 'Three albums are open to anyone with the link.' },
  { id: 'trash', label: 'Trash', body: 'Nothing here. Deleted albums stay for thirty days.' },
];

const SIDES: { value: Side; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// The open width follows text size and is capped to the actual example container.
const OPEN_REM = 11.5;

/**
 * The sidebar is one root surface. Opening and closing resize it in place, and moving it to the
 * other side travels it across the frame. Its toggle heads it at its start edge in both forms.
 */
export default function NavigationIsASidebarThatMorphs() {
  const { reducedMotion } = usePreferences();
  const [narrow, setNarrow] = useState(true);
  const [openWidth, setOpenWidth] = useState(184);
  const navId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [side, setSide] = useState<Side>('left');
  // null means follow the screen: open on wide screens, closed on narrow ones, until the user acts.
  const [open, setOpen] = useState<boolean | null>(null);
  const [section, setSection] = useState<SectionId>('library');
  const [closedWidth, setClosedWidth] = useState(136);
  // Duration of the latest change the user made, sized to the distance that change covers.
  const [dur, setDur] = useState(0);

  const isOpen = open ?? !narrow;
  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
  const sidebarWidth = isOpen ? openWidth : Math.min(openWidth, closedWidth);

  /** The stage and the sidebar as laid out now: the sidebar's inset and padding come from the system's steps. */
  const geometry = () => {
    const stage = stageRef.current;
    const aside = asideRef.current;
    const toggle = toggleRef.current;
    if (!stage || !aside || !toggle) return null;
    const style = getComputedStyle(aside);
    const inset = parseFloat(style.top);
    const pad = parseFloat(style.paddingTop);
    return {
      stageWidth: stage.offsetWidth,
      inset,
      openHeight: stage.offsetHeight - 2 * inset,
      closedHeight: toggle.offsetHeight + 2 * pad,
    };
  };

  // Opening and closing resize the same surface, so the duration follows the larger of width and height change.
  const changeOpen = (next: boolean) => {
    const g = geometry();
    if (g) setDur(morphDuration(Math.max(Math.abs(openWidth - closedWidth), g.openHeight - g.closedHeight)));
    if (!next && asideRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
    setOpen(next);
  };

  // Switching sides moves the same surface across the frame, the whole free width of the frame.
  const changeSide = (next: Side) => {
    const g = geometry();
    if (g) setDur(morphDuration(Math.max(0, g.stageWidth - sidebarWidth - 2 * g.inset)));
    setSide(next);
  };

  // On narrow screens the open sidebar is an overlay, so Escape closes it. Focus returns to the toggle
  // when it was inside the sidebar, because the sidebar becomes inert.
  const onStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !narrow || !isOpen) return;
    const focusWasInside = asideRef.current?.contains(document.activeElement) ?? false;
    changeOpen(false);
    if (focusWasInside) toggleRef.current?.focus();
  };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const inset = parseFloat(getComputedStyle(stage).getPropertyValue('--pad-1'));
      setOpenWidth(Math.min(OPEN_REM * rem, Math.max(0, stage.clientWidth - 2 * inset)));
      setNarrow(stage.clientWidth < (OPEN_REM + 14) * rem);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!reducedMotion) return;
    const animation = asideRef.current?.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 120 });
    return () => animation?.cancel();
  }, [isOpen, side, reducedMotion]);

  // The closed form is exactly as wide as its toggle plus its own padding, so it measures both.
  useLayoutEffect(() => {
    const toggle = toggleRef.current;
    const aside = asideRef.current;
    if (!toggle || !aside) return;
    const measure = () =>
      setClosedWidth(Math.ceil(toggle.offsetWidth) + 2 * parseFloat(getComputedStyle(aside).paddingLeft));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toggle);
    return () => observer.disconnect();
  }, []);

  return (
    <Example
      hint="Collapse the sidebar into its toggle and grow it back. Switch sides and it travels across the frame."
      controls={<Segmented size="compact" label="Sidebar side" options={SIDES} value={side} onChange={changeSide} />}
    >
      <div
        ref={stageRef}
        className="ex-navigation-is-a-sidebar-that-morphs-stage"
        data-side={side}
        data-overlay={narrow || undefined}
        onKeyDown={onStageKeyDown}
        style={{ '--sb-w': `${sidebarWidth}px`, '--dur': `${reducedMotion ? 0 : dur}ms` } as CSSProperties}
      >
        <aside ref={asideRef} className="ex-navigation-is-a-sidebar-that-morphs-sidebar" data-root data-open={isOpen}>
          <button
            ref={toggleRef}
            type="button"
            className="ex-navigation-is-a-sidebar-that-morphs-toggle"
            aria-expanded={isOpen}
            aria-controls={navId}
            onClick={() => changeOpen(!isOpen)}
          >
            {/* The app's name in both forms: the heading beside it already names the section. It comes first and the
                icon last, as in the system sidebar, so the name starts on the items' text edge. */}
            <span className="ex-navigation-is-a-sidebar-that-morphs-toggle-text">Studio</span>
            <SidebarIcon />
          </button>
          <nav
            id={navId}
            className="ex-navigation-is-a-sidebar-that-morphs-nav"
            aria-label="Sections"
            inert={!isOpen}
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="ex-navigation-is-a-sidebar-that-morphs-nav-item"
                aria-current={s.id === section ? 'page' : undefined}
                onClick={() => { setSection(s.id); if (narrow) changeOpen(false); }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="ex-navigation-is-a-sidebar-that-morphs-content">
          <div className="ex-navigation-is-a-sidebar-that-morphs-column">
            <h4 className="ex-navigation-is-a-sidebar-that-morphs-heading">{current.label}</h4>
            <p className="ex-navigation-is-a-sidebar-that-morphs-body">{current.body}</p>
          </div>
        </div>
      </div>
    </Example>
  );
}

function SidebarIcon() {
  return (
    <svg className="ex-navigation-is-a-sidebar-that-morphs-icon" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3v10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
