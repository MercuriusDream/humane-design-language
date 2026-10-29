import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from 'react';
import { LATER, LETTERS, ME, type Letter, type Person, type StoredMailbox } from './data';
import { decodeMail, encodeMail, MAIL_STORAGE_KEY, type MailSettings } from './mail-storage';

export type MailboxId = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'settings';

export type Draft = {
  /** Present when the draft continues a saved letter in Drafts. */
  id?: string;
  to: string;
  subject: string;
  body: string;
};

export type Outgoing = {
  id: string;
  to: Person[];
  subject: string;
  body: string;
  /** 0 to 1. */
  progress: number;
  status: 'sending' | 'sent' | 'failed';
  /** Words for the user: what happened and what to do. */
  error?: string;
};

/**
 * An archived letter that keeps its place in the list, with Undo, until the pointer and focus leave the list.
 * Serves: Prefer undo to confirmation.
 */
export type Ghost = {
  /** The archived letter. It stays in letters, in the archive mailbox. */
  id: string;
  /** Its position in the displayed list when it was archived, ghosts included. */
  index: number;
  /** The mailbox view it was archived from. */
  from: MailboxId;
  /** The stored mailbox it returns to on undo. */
  to: StoredMailbox;
  /** removed: holding its place. leaving: collapsing, then dropped. */
  status: 'removed' | 'leaving';
};

export type MailState = {
  letters: Letter[];
  ghosts: Ghost[];
  /** New letters waiting in the arrivals slot. They join the inbox only when the user asks. */
  waiting: Letter[];
  outgoing: Outgoing[];
  mailbox: MailboxId;
  selectedId: string | null;
  query: string;
  /** False until the first load finishes, so lists show their reserved shape first. */
  loaded: boolean;
  /** When on, the next sent letter fails partway, to show an error stated in words. */
  failNextSend: boolean;
  /** The last change to announce politely: archive and undo, from the list or from the open letter. */
  announcement: string;
  settings: MailSettings;
  laterReceived: boolean;
  storageError: string;
  storageBlocked: boolean;
  storageSaved: boolean;
  /** Last snapshot explicitly loaded or accepted. Never included in persisted mail. */
  storageSnapshot: string | null;
  storageRevision: number;
};

export type MailAction =
  | { type: 'loaded' }
  | { type: 'resumeGhosts' }
  | { type: 'setSettings'; settings: Partial<MailSettings> }
  | { type: 'storageResult'; error: string }
  | { type: 'replaceStorage'; snapshot: string | null }
  | { type: 'storageConflict' }
  | { type: 'retryStorage' }
  | { type: 'keepOutgoing'; id: string }
  | { type: 'sendTick' }
  | { type: 'selectMailbox'; mailbox: MailboxId }
  | { type: 'select'; id: string | null }
  | { type: 'archive'; id: string }
  | { type: 'unarchive'; id: string }
  /** The pointer and focus have left the list: holding ghosts start to collapse. */
  | { type: 'settleGhosts' }
  /** A collapsing ghost has finished its morph. */
  | { type: 'dropGhost'; id: string }
  | { type: 'toggleStar'; id: string }
  | { type: 'setQuery'; query: string }
  | { type: 'receive'; letters: Letter[] }
  | { type: 'showWaiting' }
  | { type: 'saveDraft'; draft: Draft }
  | { type: 'discardDraft'; id: string }
  | { type: 'send'; draft: Draft }
  | { type: 'sendProgress'; id: string; progress: number }
  | { type: 'sendFailed'; id: string; error: string }
  | { type: 'sendDone'; id: string }
  | { type: 'retry'; id: string }
  | { type: 'dismissOutgoing'; id: string }
  | { type: 'setFailNextSend'; on: boolean };

export const initial: MailState = {
  letters: LETTERS,
  ghosts: [],
  waiting: [],
  outgoing: [],
  mailbox: 'inbox',
  selectedId: null,
  query: '',
  loaded: false,
  failNextSend: false,
  announcement: '',
  settings: { notify: 'every', signature: '' },
  laterReceived: false,
  storageError: '',
  storageBlocked: false,
  storageSaved: false,
  storageSnapshot: null,
  storageRevision: 0,
};

/** A repeated announcement alternates a no-break space, so the live region changes and is heard again. */
const say = (previous: string, text: string) => (previous === text ? `${text}\u00a0` : text);

let counter = 0;
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Turn "Mina Park <mina@x.example>, joon@y.example" into people. */
export function parseRecipients(text: string): Person[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*)<([^>]+)>$/);
      if (match) return { name: match[1].trim() || match[2].trim(), address: match[2].trim() };
      return { name: part, address: part };
    });
}

export function reducer(state: MailState, action: MailAction): MailState {
  const next = reduceMail(state, action);
  const changed = next.letters !== state.letters || next.waiting !== state.waiting || next.outgoing !== state.outgoing
    || next.settings !== state.settings || next.laterReceived !== state.laterReceived;
  return changed ? { ...next, storageSaved: false } : next;
}

function reduceMail(state: MailState, action: MailAction): MailState {
  switch (action.type) {
    case 'setSettings': return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'storageResult': return { ...state, storageError: action.error, storageSaved: !action.error };
    case 'retryStorage': return { ...state, settings: { ...state.settings }, storageSaved: false };
    case 'replaceStorage': return { ...state, settings: { ...state.settings }, storageBlocked: false, storageSaved: false, storageSnapshot: action.snapshot, storageRevision: state.storageRevision + 1 };
    case 'storageConflict': return { ...state, storageBlocked: true, storageSaved: false, storageError: 'Mail changed in another tab. This session has stopped saving to avoid overwriting those changes. Keep a copy of your unsaved edits, then reload, or export stored mail before explicitly replacing it with this session.' };
    case 'resumeGhosts': return { ...state, ghosts: state.ghosts.map(g => ({ ...g, status: 'removed' })) };
    case 'sendTick': {
      let nextState = state;
      let fail = state.failNextSend;
      for (const item of state.outgoing) {
        if (item.status !== 'sending') continue;
        const progress = Math.min(1, item.progress + SEND_STEP);
        if (fail && progress >= FAIL_AT) {
          nextState = reducer(nextState, { type: 'sendFailed', id: item.id, error: 'The connection dropped before delivery. Try again or keep this letter as a draft.' });
          fail = false;
        } else nextState = reducer(nextState, progress >= 1 ? { type: 'sendDone', id: item.id } : { type: 'sendProgress', id: item.id, progress });
      }
      return nextState;
    }
    case 'keepOutgoing': {
      const item = state.outgoing.find(o => o.id === action.id);
      if (!item || item.status === 'sent') return state;
      const saved = reducer(state, { type: 'saveDraft', draft: { id: item.id, to: item.to.map(p => `${p.name} <${p.address}>`).join(', '), subject: item.subject, body: item.body } });
      return { ...saved, outgoing: saved.outgoing.filter(o => o.id !== item.id), announcement: say(state.announcement, 'Letter kept in Drafts.') };
    }
    case 'loaded':
      return { ...state, loaded: true };
    case 'selectMailbox':
      // Ghosts belong to the mailbox they were archived from. Leaving it drops them.
      return {
        ...state,
        mailbox: action.mailbox,
        selectedId: null,
        query: '',
        ghosts: state.ghosts.filter((g) => g.from === action.mailbox),
      };
    case 'select':
      return {
        ...state,
        selectedId: action.id,
        letters: action.id ? state.letters.map((l) => (l.id === action.id ? { ...l, read: true } : l)) : state.letters,
      };
    case 'archive': {
      const letter = state.letters.find((l) => l.id === action.id);
      if (!letter || letter.mailbox === 'archive') return state;
      // The ghost keeps the place the letter had in the list the user sees, whether it was archived there or from the open letter.
      const index = rowsIn(state).findIndex((row) => !row.ghost && row.letter.id === action.id);
      const ghosts = state.ghosts.filter((g) => g.id !== action.id);
      if (index >= 0) ghosts.push({ id: action.id, index, from: state.mailbox, to: letter.mailbox, status: 'removed' });
      return {
        ...state,
        letters: state.letters.map((l) => (l.id === action.id ? { ...l, mailbox: 'archive', archivedFrom: letter.mailbox as Exclude<StoredMailbox, 'archive'> } : l)),
        ghosts,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        announcement: say(state.announcement, `Archived ${letter.subject}. Undo is available.`),
      };
    }
    case 'unarchive': {
      const ghost = state.ghosts.find((g) => g.id === action.id);
      const letter = state.letters.find((l) => l.id === action.id);
      if (!letter) return state;
      const to = letter.archivedFrom ?? ghost?.to ?? 'inbox';
      return {
        ...state,
        letters: state.letters.map((l) => (l.id === action.id ? { ...l, mailbox: to, archivedFrom: undefined } : l)),
        ghosts: state.ghosts.filter((g) => g.id !== action.id),
        announcement: say(state.announcement, `Restored ${letter.subject}.`),
      };
    }
    case 'settleGhosts':
      return state.ghosts.some((g) => g.status === 'removed')
        ? { ...state, ghosts: state.ghosts.map((g) => (g.status === 'removed' ? { ...g, status: 'leaving' } : g)) }
        : state;
    case 'dropGhost':
      return { ...state, ghosts: state.ghosts.filter((g) => !(g.id === action.id && g.status === 'leaving')) };
    case 'toggleStar':
      return { ...state, letters: state.letters.map((l) => (l.id === action.id ? { ...l, starred: !l.starred } : l)) };
    case 'setQuery':
      return { ...state, query: action.query };
    case 'receive': {
      const known = new Set([...state.letters, ...state.waiting].map(l => l.id));
      return { ...state, laterReceived: true, waiting: [...state.waiting, ...action.letters.filter(l => !known.has(l.id))] };
    }
    case 'showWaiting': {
      // New letters join the top of the inbox, so inbox ghosts keep their place below them.
      const added = state.waiting.length;
      return {
        ...state,
        letters: [...state.waiting, ...state.letters],
        waiting: [],
        ghosts: state.ghosts.map((g) => (g.from === 'inbox' ? { ...g, index: g.index + added } : g)),
      };
    }
    case 'saveDraft': {
      const { draft } = action;
      const letter: Letter = {
        id: draft.id ?? newId('d'),
        mailbox: 'drafts',
        from: ME,
        to: parseRecipients(draft.to),
        subject: draft.subject,
        body: draft.body,
        sentAt: new Date().toISOString(),
        read: true,
        starred: false,
      };
      const exists = state.letters.some((l) => l.id === letter.id);
      return {
        ...state,
        letters: exists ? state.letters.map((l) => (l.id === letter.id ? letter : l)) : [letter, ...state.letters],
      };
    }
    case 'discardDraft':
      return { ...state, letters: state.letters.filter((l) => l.id !== action.id) };
    case 'send': {
      const { draft } = action;
      const outgoing: Outgoing = {
        id: newId('o'),
        to: parseRecipients(draft.to),
        subject: draft.subject,
        body: draft.body,
        progress: 0,
        status: 'sending',
      };
      return {
        ...state,
        outgoing: [outgoing, ...state.outgoing],
        announcement: say(state.announcement, `Sending to ${outgoing.to.map(p => p.name).join(', ')}. Cancel send is available in Outgoing letters.`),
        letters: draft.id ? state.letters.filter((l) => l.id !== draft.id) : state.letters,
      };
    }
    case 'sendProgress':
      return { ...state, outgoing: state.outgoing.map((o) => (o.id === action.id ? { ...o, progress: action.progress } : o)) };
    case 'sendFailed':
      return {
        ...state,
        failNextSend: false,
        announcement: say(state.announcement, `Letter not sent. ${action.error}`),
        outgoing: state.outgoing.map((o) => (o.id === action.id ? { ...o, status: 'failed', error: action.error } : o)),
      };
    case 'sendDone': {
      const o = state.outgoing.find((x) => x.id === action.id);
      if (!o || o.status !== 'sending') return state;
      const letter: Letter = {
        id: newId('s'),
        mailbox: 'sent',
        from: ME,
        to: o.to,
        subject: o.subject,
        body: o.body,
        sentAt: new Date().toISOString(),
        read: true,
        starred: false,
      };
      return {
        ...state,
        letters: [letter, ...state.letters],
        outgoing: state.outgoing.map((x) => (x.id === action.id ? { ...x, status: 'sent', progress: 1 } : x)),
        announcement: say(state.announcement, `Sent to ${o.to.map(p => p.name).join(', ')}.`),
      };
    }
    case 'retry':
      return {
        ...state,
        outgoing: state.outgoing.map((o) => (o.id === action.id ? { ...o, status: 'sending', progress: 0, error: undefined } : o)),
      };
    case 'dismissOutgoing':
      return { ...state, outgoing: state.outgoing.filter((o) => o.id !== action.id || o.status !== 'sent') };
    case 'setFailNextSend':
      return { ...state, failNextSend: action.on };
  }
}

const MailContext = createContext<{ state: MailState; dispatch: Dispatch<MailAction> } | null>(null);

const SEND_TICK_MS = 120;
// Leave time to reach Cancel with a keyboard before this simulated delivery completes.
const SEND_STEP = 0.01;
const FAIL_AT = 0.6;

export function loadInitialMail(): MailState {
  try {
    const raw = localStorage.getItem(MAIL_STORAGE_KEY);
    const loaded = decodeMail(raw);
    if (loaded.kind === 'loaded') return { ...initial, ...loaded.data, storageSaved: true, storageSnapshot: raw };
    if (loaded.kind === 'blocked') return { ...initial, storageBlocked: true, storageError: loaded.error, storageSnapshot: raw };
    return initial;
  } catch {
    return { ...initial, storageBlocked: true, storageError: 'Browser storage is unavailable. Sample mail is shown and changes are only in memory. Enable storage and export any existing stored mail before replacing it with this session.' };
  }
}

export function MailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialMail);
  const expectedSnapshot = useRef(state.storageSnapshot);
  const acceptedRevision = useRef(state.storageRevision);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key === MAIL_STORAGE_KEY || event.key === null) && event.newValue !== expectedSnapshot.current) dispatch({ type: 'storageConflict' });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  useEffect(() => {
    if (state.storageBlocked) return;
    if (acceptedRevision.current !== state.storageRevision) {
      expectedSnapshot.current = state.storageSnapshot;
      acceptedRevision.current = state.storageRevision;
    }
    const data = encodeMail({ letters: state.letters, waiting: state.waiting, outgoing: state.outgoing, settings: state.settings, laterReceived: state.laterReceived });
    try {
      if (localStorage.getItem(MAIL_STORAGE_KEY) !== expectedSnapshot.current) {
        dispatch({ type: 'storageConflict' });
        return;
      }
      localStorage.setItem(MAIL_STORAGE_KEY, data);
      expectedSnapshot.current = data;
      dispatch({ type: 'storageResult', error: '' });
    } catch {
      dispatch({ type: 'storageResult', error: 'Changes are only in memory because browser storage could not be written. Free browser storage, then choose Retry saving.' });
    }
  }, [state.letters, state.waiting, state.outgoing, state.settings, state.laterReceived, state.storageBlocked, state.storageRevision, state.storageSnapshot]);

  // The first load takes a moment, so lists show their reserved shape before the letters.
  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: 'loaded' }), 700);
    return () => clearTimeout(timer);
  }, []);

  // Delivery is persisted and deduplicated, so reloading never replays the same arrival.
  useEffect(() => {
    if (state.laterReceived) return;
    const timer = setTimeout(() => dispatch({ type: 'receive', letters: LATER }), 9000);
    return () => clearTimeout(timer);
  }, [state.laterReceived]);

  // The reducer sees current state on each tick; unrelated renders cannot restart the clock.
  const hasSending = state.outgoing.some(o => o.status === 'sending');
  useEffect(() => {
    if (!hasSending) return;
    const timer = setInterval(() => dispatch({ type: 'sendTick' }), SEND_TICK_MS);
    return () => clearInterval(timer);
  }, [hasSending]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
  const mail = useContext(MailContext);
  if (!mail) throw new Error('useMail must be used inside MailProvider');
  return mail;
}

/** Letters shown in a mailbox, newest first, filtered by the search query. */
export function lettersIn(state: MailState, mailbox: MailboxId): Letter[] {
  const q = state.query.trim().toLowerCase();
  return state.letters
    .filter((l) => (mailbox === 'starred' ? l.starred && l.mailbox !== 'archive' : l.mailbox === mailbox))
    .filter((l) => !q || [l.subject, l.body, l.from.name, l.from.address].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export type Row = { letter: Letter; ghost?: Ghost };

/** The rows the current mailbox shows: its letters, with each ghost back at the place it held. */
export function rowsIn(state: MailState): Row[] {
  const rows: Row[] = lettersIn(state, state.mailbox).map((letter) => ({ letter }));
  const ghosts = state.ghosts.filter((g) => g.from === state.mailbox).sort((a, b) => a.index - b.index);
  // Insert in ascending order: each index is the final position of its row.
  for (const ghost of ghosts) {
    const letter = state.letters.find((l) => l.id === ghost.id);
    if (letter) rows.splice(Math.min(ghost.index, rows.length), 0, { letter, ghost });
  }
  return rows;
}

export function unreadCount(state: MailState, mailbox: MailboxId): number {
  return state.letters.filter((l) => l.mailbox === mailbox && !l.read).length;
}

export function selectedLetter(state: MailState): Letter | null {
  return state.letters.find((l) => l.id === state.selectedId) ?? null;
}

export const MAILBOX_LABELS: Record<MailboxId, string> = {
  inbox: 'Inbox',
  starred: 'Starred',
  sent: 'Sent',
  drafts: 'Drafts',
  archive: 'Archive',
  settings: 'Settings',
};

/** "Today 9:12", "Yesterday", or "Oct 17". */
export function formatWhen(iso: string, now = new Date('2026-10-21T12:00:00+09:00')): string {
  const date = new Date(iso);
  const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
