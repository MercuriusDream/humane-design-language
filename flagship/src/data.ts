export type Person = {
  name: string;
  address: string;
  /** The organization a verified sender belongs to. Absent for people and unverified senders. */
  verifiedAs?: string;
  /** The sender speaks for an organization. Without verifiedAs, that claim is unconfirmed. */
  organization?: boolean;
};

export type StoredMailbox = 'inbox' | 'sent' | 'drafts' | 'archive';

export type Letter = {
  id: string;
  mailbox: StoredMailbox;
  /** Durable destination for Restore, independent of temporary undo rows. */
  archivedFrom?: Exclude<StoredMailbox, 'archive'>;
  from: Person;
  to: Person[];
  subject: string;
  body: string;
  /** ISO timestamp. */
  sentAt: string;
  read: boolean;
  starred: boolean;
};

export const ME: Person = { name: 'Seo-yeon Kim', address: 'seoyeon@letters.example' };

const mina: Person = { name: 'Mina Park', address: 'mina.park@studio.example' };
const joon: Person = { name: 'Joon Lee', address: 'joon@lee.example' };
const library: Person = { name: 'Mapo Public Library', address: 'notice@library.mapo.example', verifiedAs: 'Mapo District Office' };
const clinic: Person = { name: 'Hangang Family Clinic', address: 'care@hangang-clinic.example', verifiedAs: 'Hangang Family Clinic' };
const building: Person = { name: 'Building office', address: 'office@seokyo-apts.example', verifiedAs: 'Seokyo Apartments management' };
const bank: Person = { name: 'Account security', address: 'security@bank-alerts.example', organization: true };
const hana: Person = { name: 'Hana Choi', address: 'hana@choi.example' };
const press: Person = { name: 'Small Press Weekly', address: 'weekly@smallpress.example', verifiedAs: 'Small Press Weekly' };

export const LETTERS: Letter[] = [
  {
    id: 'l1', mailbox: 'inbox', from: mina, to: [ME], subject: 'Prints are ready',
    body: 'The test prints came out well. The river series is warmer than the screen showed, which I think helps.\n\nI can bring them on Thursday after four, or you can pick them up at the studio any time before seven.',
    sentAt: '2026-10-21T09:12:00+09:00', read: false, starred: false,
  },
  {
    id: 'l2', mailbox: 'inbox', from: clinic, to: [ME], subject: 'Your appointment on Monday, October 26',
    body: 'Your appointment is confirmed for Monday, October 26 at 10:30 with Dr. Yoon.\n\nPlease bring your health insurance card. If you need to change the time, reply to this letter or call the front desk before Friday.',
    sentAt: '2026-10-21T08:40:00+09:00', read: false, starred: true,
  },
  {
    id: 'l3', mailbox: 'inbox', from: bank, to: [ME], subject: 'Confirm your account details today',
    body: 'We noticed unusual activity. Confirm your account details within 24 hours using the link below, or your account will be limited.',
    sentAt: '2026-10-21T07:55:00+09:00', read: false, starred: false,
  },
  {
    id: 'l4', mailbox: 'inbox', from: joon, to: [ME], subject: 'Lease draft, second pass',
    body: 'I went through the draft again and marked three clauses. The one about repairs still puts everything on the tenant, which the office said they would change.\n\nCan we talk it over tomorrow evening?',
    sentAt: '2026-10-20T21:03:00+09:00', read: true, starred: false,
  },
  {
    id: 'l5', mailbox: 'inbox', from: library, to: [ME], subject: 'Two books due Friday',
    body: 'Two books on your card are due on Friday, October 23: "The Long Afternoon" and "Field Notes on Light".\n\nYou can renew them once from your library account, or return them to any branch.',
    sentAt: '2026-10-19T10:00:00+09:00', read: true, starred: false,
  },
  {
    id: 'l6', mailbox: 'inbox', from: building, to: [ME], subject: 'Water off on Wednesday morning',
    body: 'The water will be off on Wednesday from 9 to 11 while the pipes on the third floor are replaced. We are sorry for the trouble.',
    sentAt: '2026-10-18T16:20:00+09:00', read: true, starred: false,
  },
  {
    id: 'l7', mailbox: 'inbox', from: hana, to: [ME], subject: 'Photos from the weekend',
    body: 'Here are the ones from the ferry. The second roll was mostly fog, but two frames are lovely.',
    sentAt: '2026-10-17T19:45:00+09:00', read: true, starred: true,
  },
  {
    id: 'l8', mailbox: 'inbox', from: press, to: [ME], subject: 'This week: three new chapbooks',
    body: 'Three new chapbooks arrive this week, including a collection of letters between two lighthouse keepers.',
    sentAt: '2026-10-16T07:00:00+09:00', read: true, starred: false,
  },
  {
    id: 's1', mailbox: 'sent', from: ME, to: [joon], subject: 'Re: Lease draft',
    body: 'Thanks for reading it. I agree about the repairs clause. Tomorrow at eight works.',
    sentAt: '2026-10-20T21:30:00+09:00', read: true, starred: false,
  },
  {
    id: 's2', mailbox: 'sent', from: ME, to: [mina], subject: 'Paper for the river series',
    body: 'Let us try the cotton paper for the river series. The matte one flattened the blacks.',
    sentAt: '2026-10-15T14:10:00+09:00', read: true, starred: false,
  },
  {
    id: 'd1', mailbox: 'drafts', from: ME, to: [hana], subject: 'Ferry photos',
    body: 'These are beautiful. Could you send the second frame from',
    sentAt: '2026-10-17T20:02:00+09:00', read: true, starred: false,
  },
  {
    id: 'a1', mailbox: 'archive', from: library, to: [ME], subject: 'Your library card was renewed',
    body: 'Your library card is renewed until October 2027.',
    sentAt: '2026-09-30T09:00:00+09:00', read: true, starred: false,
  },
];

/** Letters that arrive while the app is open, to show new mail arriving quietly. */
export const LATER: Letter[] = [
  {
    id: 'n1', mailbox: 'inbox', from: mina, to: [ME], subject: 'Re: Prints are ready',
    body: 'Thursday after four is perfect. I will bring the river series and two spares.',
    sentAt: '2026-10-21T10:05:00+09:00', read: false, starred: false,
  },
  {
    id: 'n2', mailbox: 'inbox', from: library, to: [ME], subject: 'A book you asked for is waiting',
    body: '"Letters from the Coast" is waiting for you at the Mapo branch until October 28.',
    sentAt: '2026-10-21T10:07:00+09:00', read: false, starred: false,
  },
];
