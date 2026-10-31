import { useEffect, useLayoutEffect, useRef, type CSSProperties, type FocusEvent } from 'react';
import { Button, List, Placeholder, morphDuration, usePreferences } from 'humane-system';
import { useCompose } from '../compose';
import type { Letter } from '../data';
import { MAILBOX_LABELS, formatWhen, rowsIn, useMail } from '../store';
import './message-list.css';

/** The body as one line of preview. Paragraph breaks become spaces; the row's CSS ends it in an ellipsis. */
const preview = (body: string) => body.replace(/\s+/g, ' ').trim();

/**
 * Rule: prefer undo to confirmation. Archive at once, from the open letter; the archived row keeps its place
 * with Undo until the pointer and focus leave the list. Ghosts live in the store, so archiving from the open
 * letter leaves one too.
 */
export function MessageList({ onRead }: { onRead?: () => void }) {
  const { state, dispatch } = useMail();
  const { openCompose } = useCompose();
  const { reducedMotion } = usePreferences();
  const bodyRef = useRef<HTMLDivElement>(null);
  const pointerInside = useRef(false);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  // The last height of each present row, so its ghost holds exactly that place and nothing below it moves.
  const heights = useRef(new Map<string, number>());

  const mailbox = state.mailbox;
  const isDrafts = mailbox === 'drafts';
  const rows = rowsIn(state);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    for (const row of body.querySelectorAll<HTMLElement>('.message-list-item:not([data-status="leaving"])')) {
      const plane = row.querySelector<HTMLElement>('.message-list-row');
      if (row.dataset.letterId && plane) heights.current.set(row.dataset.letterId, plane.offsetHeight);
    }
  });

  // One timer per leaving ghost, so each row waits its own full collapse before it is dropped.
  useEffect(() => {
    const pending = timers.current;
    const leaving = new Set(state.ghosts.filter((g) => g.status === 'leaving').map((g) => g.id));
    for (const id of leaving) {
      if (pending.has(id)) continue;
      pending.set(
        id,
        setTimeout(
          () => {
            pending.delete(id);
            if (pointerInside.current || bodyRef.current?.contains(document.activeElement)) {
              dispatch({ type: 'resumeGhosts' });
            } else dispatch({ type: 'dropGhost', id });
          },
          reducedMotion ? 120 : morphDuration(heights.current.get(id) ?? 0),
        ),
      );
    }
    for (const [id, timer] of pending) {
      if (!leaving.has(id)) {
        clearTimeout(timer);
        pending.delete(id);
      }
    }
  }, [state.ghosts, reducedMotion, dispatch]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  // Collapse only when the pointer has left the list and focus is outside it, so rows never shift under the user.
  const settle = () => {
    if (pointerInside.current || bodyRef.current?.contains(document.activeElement)) return;
    dispatch({ type: 'settleGhosts' });
  };

  const resume = () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    if (state.ghosts.some(g => g.status === 'leaving')) dispatch({ type: 'resumeGhosts' });
  };
  const onPointerEnter = () => {
    pointerInside.current = true;
    resume();
  };
  const onPointerLeave = () => {
    pointerInside.current = false;
    settle();
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!pointerInside.current && !bodyRef.current?.contains(event.relatedTarget as Node | null)) dispatch({ type: 'settleGhosts' });
  };

  const choose = (letter: Letter) => {
    if (!isDrafts) {
      onRead?.();
      dispatch({ type: 'select', id: letter.id });
      return;
    }
    const row = bodyRef.current?.querySelector<HTMLElement>(`[data-letter-id="${CSS.escape(letter.id)}"]`) ?? null;
    openCompose(
      {
        id: letter.id,
        to: letter.to.map((p) => `${p.name} <${p.address}>`).join(', '),
        subject: letter.subject,
        body: letter.body,
      },
      row,
    );
  };

  const clearSearch = () => {
    dispatch({ type: 'setQuery', query: '' });
    // The pressed button leaves with the empty state, so focus returns to the search the user was refining.
    document.querySelector<HTMLInputElement>('.search-field input')?.focus();
  };

  const list = (
    <List label={MAILBOX_LABELS[mailbox]}>
      {rows.map(({ letter, ghost }) => {
        const status = ghost?.status ?? 'present';
        const selected = !ghost && state.selectedId === letter.id;
        const outgoing = letter.mailbox === 'sent' || letter.mailbox === 'drafts' || letter.archivedFrom === 'sent';
        const name = outgoing ? `To ${letter.to.map((p) => p.name).join(', ') || 'no one yet'}` : letter.from.name;
        const held = ghost ? heights.current.get(letter.id) : undefined;
        return (
          <div
            key={letter.id}
            className="message-list-item"
            data-letter-id={letter.id}
            data-status={status}
            data-selected={selected || undefined}
            style={{ '--dur': `${reducedMotion ? 120 : morphDuration(heights.current.get(letter.id) ?? 0)}ms` } as CSSProperties}
            data-reduced={reducedMotion || undefined}
            // The list's focus handler reverses collapse when focus returns elsewhere in it.
            inert={status === 'leaving'}
          >
            <div className="message-list-clip">
              <div className="message-list-row" style={held ? { minHeight: held } : undefined}>
                <button
                    type="button"
                    className="message-row"
                    data-unread={!letter.read || undefined}
                    aria-current={selected || undefined}
                    disabled={!!ghost}
                    onClick={() => choose(letter)}
                  >
                    <span className="message-row-top">
                      <span className="message-row-name">
                        {!letter.read && <span className="message-list-sr">Unread: </span>}
                        {name}
                      </span>
                      <time className="message-row-time" dateTime={letter.sentAt}>
                        {formatWhen(letter.sentAt)}
                      </time>
                    </span>
                    <span className="message-row-subject">{letter.subject || '(No subject)'}</span>
                    {letter.body.trim() && <span className="message-row-preview">{preview(letter.body)}</span>}
                  </button>
                {/* A ghost row's one control: always visible, so the way back is never hidden. */}
                {ghost && (
                  <Button className="message-list-action" onClick={() => dispatch({ type: 'unarchive', id: letter.id })}>
                    Undo
                    <span className="message-list-sr"> archive of {letter.subject}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </List>
  );

  const query = state.query.trim();

  return (
    <Placeholder ready={state.loaded}>
      <div
        ref={bodyRef}
        className="message-list-body"
        data-root
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        onFocusCapture={resume}
      >
        {list}
        {rows.length === 0 && (
          <div className="message-list-empty">
            <p className="message-list-empty-text">{query ? `No letters match ${query}.` : 'No letters here.'}</p>
            {query && <Button onClick={clearSearch}>Clear search</Button>}
          </div>
        )}
      </div>
    </Placeholder>
  );
}
