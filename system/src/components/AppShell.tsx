import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { morphDuration } from '../lib/motion';
import { useMedia, usePreferences } from '../preferences';
import { Sidebar, type SidebarItem } from './Sidebar';
import './app-shell.css';

/** Below this width the open sidebar would crowd the content, so it opens over the content instead. */
// In em, so the dock point follows the user's text size: at 200% the sidebar docks only from 2000px.
const DOCK_QUERY = '(min-width: 62.5em)';

type Props = {
  title: string;
  items: SidebarItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  navLabel?: string;
  /** Content under the navigation inside the sidebar. */
  sidebarExtra?: ReactNode;
  /** reading: a centered text column. wide: a centered column for lists and panes.
   * full: sections that fill the window beside the sidebar and scroll on their own. */
  column?: 'reading' | 'wide' | 'full';
  children: ReactNode;
};

/**
 * The page frame of the language: a morphing sidebar on the left or right, and content centered
 * in the space beside it.
 */
export function AppShell({ title, items, activeId, onSelect, navLabel, sidebarExtra, column = 'reading', children }: Props) {
  const { side } = usePreferences();
  const docks = useMedia(DOCK_QUERY);
  const [open, setOpen] = useState(docks);

  // Crossing the breakpoint resets the sidebar to the form that fits the screen.
  useEffect(() => setOpen(docks), [docks]);

  // Opening and closing changes the sidebar's height by nearly the whole viewport.
  const style = { '--dur': `${morphDuration(window.innerHeight)}ms` } as CSSProperties;

  return (
    <div className="h-app" data-side={side} data-docked={(docks && open) || undefined} data-column={column} style={style}>
      <Sidebar
        title={title}
        items={items}
        activeId={activeId}
        onSelect={onSelect}
        open={open}
        onOpenChange={setOpen}
        overlay={!docks}
        navLabel={navLabel}
      >
        {sidebarExtra}
      </Sidebar>
      <main className="h-page">
        <div className="h-column" data-column={column}>
          {children}
        </div>
      </main>
    </div>
  );
}
