import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AppShell, Button, PreferencesProvider, useMedia } from 'humane-system';
import { ComposeProvider, useCompose } from './compose';
import { ME } from './data';
import { Compose } from './features/Compose';
import { Outbox } from './features/Outbox';
import { announcementCount } from './mail-storage';
import { MessageList } from './features/MessageList';
import { Reader } from './features/Reader';
import { SearchField } from './features/SearchField';
import { SettingsView } from './features/SettingsView';
import { MAILBOX_LABELS, MailProvider, unreadCount, useMail, type MailboxId } from './store';
import './app.css';

const MAILBOXES: MailboxId[] = ['inbox', 'starred', 'sent', 'drafts', 'archive', 'settings'];

// In em, so both follow the user's text size, as AppShell's dock point does: at 200% the panes split only from 2360px.
/** Wide enough for the list and the letter side by side. */
const TWO_PANES = '(min-width: 73.75em)';
/** A phone: the header folds into two rows, and Write and the arrivals button take their short names. */
const PHONE = '(max-width: 40em)';

const arrivalsLabel = (count: number) => (count === 1 ? '1 new letter' : `${count} new letters`);

export function App() {
  return (
    <PreferencesProvider>
      <MailProvider>
        <ComposeProvider>
          <Letters />
        </ComposeProvider>
      </MailProvider>
    </PreferencesProvider>
  );
}

function Letters() {
  const { state, dispatch } = useMail();
  const { open: composing } = useCompose();
  const [arrivalNotice, setArrivalNotice] = useState('');
  const [outcomeNotice, setOutcomeNotice] = useState('');
  const queued = useRef<string[]>([]);
  const lastOutcome = useRef('');
  useEffect(() => {
    if (state.announcement && state.announcement !== lastOutcome.current) {
      queued.current.push(state.announcement);
      lastOutcome.current = state.announcement;
    }
    if (!composing && queued.current.length) {
      setOutcomeNotice(queued.current.join(' '));
      queued.current = [];
    }
  }, [state.announcement, composing]);
  const eligible = announcementCount(state.waiting, state.letters, state.settings.notify);
  useEffect(() => {
    const timer = setTimeout(() => setArrivalNotice(eligible > 0 ? arrivalsLabel(eligible) : ''), 200);
    return () => clearTimeout(timer);
  }, [eligible]);
  // Wide enough for the list and the letter side by side: the mailbox fills the window as sections.
  const sections = useMedia(TWO_PANES) && state.mailbox !== 'settings';
  const items = MAILBOXES.map((id) => ({
    id,
    label: MAILBOX_LABELS[id],
    count:
      id === 'inbox'
        ? unreadCount(state, 'inbox')
        : id === 'drafts'
          ? state.letters.filter((l) => l.mailbox === 'drafts').length
          : undefined,
  }));

  return (
    <AppShell
      title="Letters"
      items={items}
      activeId={state.mailbox}
      onSelect={(id) => dispatch({ type: 'selectMailbox', mailbox: id as MailboxId })}
      navLabel="Mailboxes"
      column={sections ? 'full' : 'wide'}
      sidebarExtra={
        <p className="sidebar-account">
          Signed in as{' '}
          {/* A narrow panel or large text breaks the address after the @, not inside a word. */}
          <span className="sidebar-account-address">
            {ME.address.split('@')[0]}@<wbr />
            {ME.address.split('@')[1]}
          </span>
        </p>
      }
    >
      {state.mailbox === 'settings' ? <SettingsView /> : <MailboxView outbox={sections ? <Outbox reserved={false} /> : null} />}
      {!sections && <Outbox />}
      <p className="mailbox-announce" aria-live="polite">{outcomeNotice}</p>
      <p className="mailbox-announce" aria-live="polite">{composing ? '' : arrivalNotice}</p>
      <Compose />
    </AppShell>
  );
}

function MailboxView({ outbox }: { outbox: ReactNode }) {
  const { state, dispatch } = useMail();
  const { openCompose } = useCompose();
  const writeRef = useRef<HTMLButtonElement>(null);
  const twoPanes = useMedia(TWO_PANES);
  const phone = useMedia(PHONE);
  const reading = state.selectedId !== null;
  // On one pane the open letter is the whole view, with its own way back, so the header steps aside.
  const readingAlone = !twoPanes && reading;
  const focusReader = useRef(false);
  useLayoutEffect(() => {
    if (!focusReader.current) return;
    focusReader.current = false;
    if (readingAlone) document.querySelector<HTMLElement>('.reader-subject')?.focus();
  }, [state.selectedId, readingAlone]);
  const onRead = () => { focusReader.current = !twoPanes; };
  const back = () => {
    const id = state.selectedId;
    dispatch({ type: 'select', id: null });
    requestAnimationFrame(() => {
      const row = id ? document.querySelector<HTMLElement>(`[data-letter-id="${CSS.escape(id)}"] .message-row`) : null;
      (row ?? document.querySelector<HTMLElement>('.mailbox-title'))?.focus();
    });
  };
  const showWaiting = () => {
    const ids = new Set(state.waiting.map(l => l.id));
    dispatch({ type: 'showWaiting' });
    requestAnimationFrame(() => {
      const first = Array.from(document.querySelectorAll<HTMLElement>('[data-letter-id]')).find(row => ids.has(row.dataset.letterId ?? ''));
      (first?.querySelector<HTMLElement>('.message-row') ?? document.querySelector<HTMLElement>('.mailbox-title'))?.focus();
    });
  };

  const header = !readingAlone && (
    <header className="mailbox-header">
      <h1 className="mailbox-title" tabIndex={-1}>{MAILBOX_LABELS[state.mailbox]}</h1>
      {/* New letters wait here, beside the title, so they never move the list. */}
      <div className="mailbox-arrivals">
        {state.mailbox === 'inbox' && (
          // Standard, as Write and search beside it: one tier per panel.
          <Button variant="quiet" onClick={showWaiting} disabled={!state.waiting.length}
            aria-hidden={!state.waiting.length} style={{ visibility: state.waiting.length ? 'visible' : 'hidden' }}>
            {twoPanes || phone ? `Show ${state.waiting.length || 2} new` : `Show ${arrivalsLabel(state.waiting.length || 2)}`}
          </Button>
        )}
      </div>
      <div className="mailbox-tools">
        <SearchField />
        <Button
          ref={writeRef}
          className="mailbox-write"
          variant="strong"
          onClick={() => openCompose({}, writeRef.current)}
        >
          {phone ? 'Write' : 'Write a letter'}
        </Button>
      </div>
    </header>
  );

  // Side by side, the list and the letter are two sections of the window, each scrolling on its own,
  // set apart by their planes: the list on the page's plane, the letter raised beside it.
  if (twoPanes) {
    return (
      <div className="mailbox" data-layout="sections">
        <section className="mailbox-list-pane" aria-label={MAILBOX_LABELS[state.mailbox]}>
          {header}
          <div className="mailbox-list-scroll">
            <MessageList onRead={onRead} />
          </div>
        </section>
        <div className="mailbox-reader-pane">
          <div className="mailbox-reader-scroll">
            <Reader />
          </div>
          {outbox}
        </div>
      </div>
    );
  }

  return (
    <div className="mailbox">
      {header}
      {reading ? <Reader onBack={back} /> : <MessageList onRead={onRead} />}
    </div>
  );
}
