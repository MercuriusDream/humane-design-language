import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Example } from '../components/Example';
import { Button, morphDuration, usePreferences } from 'humane-system';
import './removed-things-go-somewhere.css';

type Status = 'present' | 'leaving' | 'archived';
type Item = { id: string; title: string; meta: string; status: Status };

const SOURCE = [
  { id: 'walk', title: 'Morning walk', meta: '14 photos' },
  { id: 'studio', title: 'Studio session', meta: '36 photos' },
  { id: 'harbor', title: 'Harbor at dusk', meta: '9 photos' },
  { id: 'kitchen', title: 'Kitchen notes', meta: '5 photos' },
];

const fresh = (): Item[] => SOURCE.map((item) => ({ ...item, status: 'present' }));

/**
 * Removed things go somewhere. An archived row collapses in place, and the rows below it close
 * the gap by morphing, so nothing leaves a hole. Archiving is not confirmed: Restore undoes it.
 */
export default function ArchiveRows() {
  const { reducedMotion } = usePreferences();
  const [items, setItems] = useState<Item[]>(fresh);
  const [announcement, setAnnouncement] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const archivedCount = items.filter((item) => item.status !== 'present').length;

  const archive = (event: MouseEvent<HTMLButtonElement>, item: Item) => {
    if (item.status !== 'present') return;

    // The focused button is about to leave, so focus moves to the nearest row that stays.
    const row = event.currentTarget.closest('li');
    const list = listRef.current;
    if (row && list) {
      const others = Array.from(list.querySelectorAll<HTMLLIElement>('li[data-status="present"]')).filter(
        (el) => el !== row,
      );
      const next =
        others.find((el) => row.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) ??
        others[others.length - 1];
      (next?.querySelector('button') ?? restoreRef.current)?.focus();
    }

    const duration = reducedMotion ? 120 : morphDuration(row?.getBoundingClientRect().height ?? 0);
    row?.style.setProperty('--dur', `${duration}ms`);
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, status: 'leaving' } : i)));
    setAnnouncement(`Archived ${item.title}. ${archivedCount + 1} archived.`);

    timers.current.set(
      item.id,
      setTimeout(
        () => {
          timers.current.delete(item.id);
          setItems((all) =>
            all.map((i) => (i.id === item.id && i.status === 'leaving' ? { ...i, status: 'archived' } : i)),
          );
        },
        duration,
      ),
    );
  };

  const restore = () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setItems(fresh());
    setAnnouncement(`Restored all ${SOURCE.length} items.`);
  };

  return (
    <Example
      hint="Archive a row. Restore brings every row back."
      controls={
        <div className="ex-removed-things-go-somewhere-controls">
          <p className="ex-removed-things-go-somewhere-count">
            Archived {archivedCount} of {SOURCE.length}
          </p>
          <Button size="compact" ref={restoreRef} onClick={restore}>
            Restore
          </Button>
        </div>
      }
    >
      <ul
        ref={listRef}
        role="list"
        className="ex-removed-things-go-somewhere-list"
        aria-label="Photo sets"
        data-reduced={reducedMotion || undefined}
      >
        {items.map((item) => (
          <li key={item.id} className="ex-removed-things-go-somewhere-item" data-status={item.status} inert={item.status !== 'present'}>
            <div className="ex-removed-things-go-somewhere-clip">
              <div className="ex-removed-things-go-somewhere-row">
                <div className="ex-removed-things-go-somewhere-text">
                  <span className="ex-removed-things-go-somewhere-title">{item.title}</span>
                  <span className="ex-removed-things-go-somewhere-meta">{item.meta}</span>
                </div>
                <Button depth={2} disabled={item.status !== 'present'} onClick={(event) => archive(event, item)}>
                  Archive
                  <span className="visually-hidden"> {item.title}</span>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </Example>
  );
}
