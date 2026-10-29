import type { Letter, Person } from './data';
import type { Outgoing } from './store';

export const MAIL_STORAGE_KEY = 'humane-letters-v1';
export type Notify = 'every' | 'people' | 'none';
export type MailSettings = { notify: Notify; signature: string };
export type SavedMail = {
  letters: Letter[];
  waiting: Letter[];
  outgoing: Outgoing[];
  settings: MailSettings;
  laterReceived: boolean;
};
export type MailLoad = { kind: 'empty' } | { kind: 'loaded'; data: SavedMail } | { kind: 'blocked'; error: string };
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === 'string';
const person = (x: unknown): x is Person => record(x) && text(x.name) && text(x.address)
  && (x.verifiedAs === undefined || text(x.verifiedAs)) && (x.organization === undefined || typeof x.organization === 'boolean');
const people = (x: unknown): x is Person[] => Array.isArray(x) && x.every(person);
const letter = (x: unknown): x is Letter => record(x) && text(x.id) && x.id.length > 0
  && text(x.mailbox) && ['inbox', 'sent', 'drafts', 'archive'].includes(x.mailbox)
  && (x.archivedFrom === undefined || (text(x.archivedFrom) && ['inbox', 'sent', 'drafts'].includes(x.archivedFrom)))
  && person(x.from) && people(x.to) && text(x.subject) && text(x.body) && text(x.sentAt)
  && Number.isFinite(Date.parse(x.sentAt)) && typeof x.read === 'boolean' && typeof x.starred === 'boolean';
const outgoing = (x: unknown): x is Outgoing => record(x) && text(x.id) && x.id.length > 0 && people(x.to)
  && text(x.subject) && text(x.body) && typeof x.progress === 'number' && Number.isFinite(x.progress)
  && x.progress >= 0 && x.progress <= 1 && text(x.status) && ['sending', 'sent', 'failed'].includes(x.status)
  && (x.error === undefined || text(x.error));
const unique = (items: { id: string }[]) => new Set(items.map(x => x.id)).size === items.length;

/** Reject the entire unsupported/corrupt snapshot. The caller must not overwrite it automatically. */
export function decodeMail(raw: string | null): MailLoad {
  if (raw === null) return { kind: 'empty' };
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !record(value.data)) throw new Error();
    const d = value.data;
    if (!Array.isArray(d.letters) || !d.letters.every(letter) || !Array.isArray(d.waiting) || !d.waiting.every(letter)
      || !Array.isArray(d.outgoing) || !d.outgoing.every(outgoing) || !record(d.settings)
      || !text(d.settings.notify) || !['every', 'people', 'none'].includes(d.settings.notify) || !text(d.settings.signature)
      || typeof d.laterReceived !== 'boolean' || !unique([...d.letters, ...d.waiting, ...d.outgoing])) throw new Error();
    return { kind: 'loaded', data: d as unknown as SavedMail };
  } catch {
    return { kind: 'blocked', error: 'Stored mail could not be read or uses an unsupported version. Your stored data has not been replaced. Sample mail is shown for this session, and changes are only in memory. Export the stored data before choosing Replace stored mail.' };
  }
}
export function encodeMail(data: SavedMail): string { return JSON.stringify({ version: 1, data }); }

export function validateRecipients(addresses: Person[]): string | null {
  if (!addresses.length) return 'Add at least one address, such as mina@studio.example.';
  const invalid = addresses.find(({ address }) => {
    const parts = address.split('@');
    return parts.length !== 2 || !parts[0] || !parts[1] || /\s/.test(address);
  });
  return invalid ? `${invalid.address} is not a complete address. Use one @, a name and domain, and no spaces.` : null;
}

/** Scope concerns in-app polite announcements, not delivery or operating-system notifications. */
export function announcementCount(waiting: Letter[], letters: Letter[], notify: Notify): number {
  if (notify === 'none') return 0;
  if (notify === 'every') return waiting.length;
  const written = new Set(letters.filter(l => l.mailbox === 'sent' || l.archivedFrom === 'sent')
    .flatMap(l => l.to.map(p => p.address.toLowerCase())));
  return waiting.filter(l => written.has(l.from.address.toLowerCase())).length;
}
