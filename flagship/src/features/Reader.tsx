import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { Button, Notice, Surface, growFrom, usePreferences } from 'humane-system';
import { useCompose } from '../compose';
import { MAILBOX_LABELS, formatWhen, selectedLetter, useMail } from '../store';
import './reader.css';

/** The open letter. Serves: Continuity saves effort (it opens from its row) and Say who is behind it (verified senders and the notice). */
export function Reader({ onBack }: { onBack?: () => void }) {
  const { state, dispatch } = useMail();
  const { openCompose } = useCompose();
  const { reducedMotion } = usePreferences();
  const letter = selectedLetter(state);
  const letterId = letter?.id ?? null;
  const frameRef = useRef<HTMLDivElement>(null);
  const openLetterId = useRef<string | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const wasOpen = openLetterId.current !== null;
    openLetterId.current = letterId;
    if (!frame || !letterId) return;
    // The reader grows from its row only when it opens. Changing letters keeps the established frame in place.
    const origin = wasOpen ? frame : document.querySelector<HTMLElement>(`[data-letter-id="${CSS.escape(letterId)}"]`);
    const morph = growFrom(frame, origin, reducedMotion);
    return () => morph?.cancel();
    // reducedMotion is read on selection only; changing it does not replay the morph.
  }, [letterId]);

  const archive = (id: string) => {
    // Archiving closes the letter and leaves its place in the list with Undo. The pressed button is gone,
    // so focus goes to that Undo, the one thing the user may want next.
    dispatch({ type: 'archive', id });
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`.message-list-item[data-letter-id="${CSS.escape(id)}"] .message-list-action`)
        ?.focus();
    });
  };

  if (!letter) {
    return (
      <div ref={frameRef} className="reader">
        <Surface depth={0} plane="sunken" className="reader-empty">
          <p className="reader-empty-text">
            {state.mailbox === 'drafts' ? 'Choose a draft to keep writing it.' : 'Choose a letter to read it.'}
          </p>
        </Surface>
      </div>
    );
  }

  const { from } = letter;
  const canArchive = letter.mailbox !== 'archive' && letter.mailbox !== 'drafts';

  // One tier for the letter: Star, Archive, Back, and Reply are all standard buttons on a control plane, so the
  // letter's controls share one height and their boxes, not their labels, meet the letter's edges.
  const tools = (
    <div className="reader-tools">
      <Button aria-pressed={letter.starred} onClick={() => dispatch({ type: 'toggleStar', id: letter.id })}>
        {letter.starred ? 'Unstar' : 'Star'}
      </Button>
      {letter.mailbox === 'archive' && <Button onClick={() => {
        dispatch({ type: 'unarchive', id: letter.id });
        requestAnimationFrame(() => document.querySelector<HTMLElement>('.reader-subject')?.focus());
      }}>Restore</Button>}
      {canArchive && (
        <Button onClick={() => archive(letter.id)}>
          Archive
        </Button>
      )}
    </div>
  );

  return (
    <div ref={frameRef} className="reader">
      <Surface depth={0} plane="raised" className="reader-letter">
        <header className="reader-head">
          {/* Alone on a narrow screen, the way back and the actions on this letter share one row above the subject,
              so the subject keeps the full width. */}
          {onBack && (
            <div className="reader-bar">
              <Button className="reader-back" onClick={onBack}>
                Back to {MAILBOX_LABELS[state.mailbox]}
              </Button>
              {tools}
            </div>
          )}

          <div className="reader-subject-row">
            <h2 className="reader-subject" tabIndex={-1}>{letter.subject}</h2>
            {!onBack && tools}
          </div>

          <div className="reader-sender">
            <p className="reader-sender-top">
              <span className="reader-name">{from.name}</span>
              <time className="reader-when" dateTime={letter.sentAt}>
                {formatWhen(letter.sentAt)}
              </time>
            </p>
            <p className="reader-address">{from.address}</p>
            {from.verifiedAs && (
              <p className="reader-verified">
                {from.verifiedAs === from.name ? 'Verified sender.' : `Verified sender: ${from.verifiedAs}.`}
              </p>
            )}
            <p className="reader-to">
              {letter.to.length ? `To: ${letter.to.map((p) => p.name).join(', ')}` : 'No recipients yet'}
            </p>
          </div>

          {from.organization && !from.verifiedAs && (
            <Notice tone="danger" title="This sender is not verified">
              Letters like this one sometimes ask for account details. Do not follow its links. Contact the organization
              through its own website instead.
            </Notice>
          )}
        </header>

        <div className="reader-body">
          {letter.body
            .split(/\n\s*\n/)
            .filter((paragraph) => paragraph.trim() !== '')
            .map((paragraph, index) => (
              <p key={index} className="reader-paragraph">
                {paragraph}
              </p>
            ))}
        </div>

        <div className="reader-actions">
          <Button
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              openCompose(
                {
                  to: (letter.mailbox === 'sent' || letter.archivedFrom === 'sent')
                    ? letter.to.map(p => `${p.name} <${p.address}>`).join(', ')
                    : `${from.name} <${from.address}>`,
                  subject: letter.subject.startsWith('Re:') ? letter.subject : `Re: ${letter.subject}`,
                  body: '',
                },
                event.currentTarget,
              )
            }
          >
            Reply
          </Button>
        </div>
      </Surface>
    </div>
  );
}
