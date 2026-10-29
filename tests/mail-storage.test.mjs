import assert from 'node:assert/strict';
import test from 'node:test';
import { LETTERS, LATER } from '../flagship/src/data.ts';
import { announcementCount, decodeMail, encodeMail, validateRecipients } from '../flagship/src/mail-storage.ts';

const saved = () => ({ letters: structuredClone(LETTERS), waiting: structuredClone(LATER), outgoing: [], settings: { notify: 'every', signature: 'Regards' }, laterReceived: true });

test('mail snapshots round trip all durable fields and recovery metadata', () => {
  const data = saved();
  data.letters[0].archivedFrom = 'sent';
  data.letters[0].mailbox = 'archive';
  data.outgoing.push({ id: 'outgoing-test', to: [], subject: 'Recover me', body: 'Original\ncontent', progress: .6, status: 'failed', error: 'Try again' });
  assert.deepEqual(decodeMail(encodeMail(data)), { kind: 'loaded', data });
});

test('missing mail is distinct from invalid or unsupported storage', () => {
  assert.deepEqual(decodeMail(null), { kind: 'empty' });
  for (const raw of ['', 'null', '[]', '{', '{"version":2,"data":{}}']) assert.equal(decodeMail(raw).kind, 'blocked', raw);
});

test('malformed snapshots are rejected without partial data loss', () => {
  const mutations = [
    d => { d.letters[0].mailbox = 'unknown'; },
    d => { d.letters[0].archivedFrom = 'archive'; },
    d => { d.letters[0].sentAt = 'invalid'; },
    d => { d.letters[0].read = 'true'; },
    d => { d.settings.notify = 'invalid'; },
    d => { d.settings.signature = null; },
    d => { d.laterReceived = 1; },
    d => { d.waiting.push(d.letters[0]); },
    d => { d.outgoing.push({ id: 'x', to: [], subject: '', body: '', progress: 2, status: 'sending' }); },
  ];
  for (const mutate of mutations) {
    const data = saved(); mutate(data);
    assert.equal(decodeMail(encodeMail(data)).kind, 'blocked');
  }
});

test('recipient validation rejects incomplete addresses without restricting ordinary local domains', () => {
  const people = address => [{ name: address, address }];
  assert.ok(validateRecipients([]));
  for (const invalid of ['@', 'name@', '@example.com', 'a@@b', 'a b@example.com']) assert.ok(validateRecipients(people(invalid)), invalid);
  for (const valid of ['name@example.com', 'name+tag@example.com', 'name@localhost']) assert.equal(validateRecipients(people(valid)), null, valid);
});

test('arrival announcement policy counts only eligible senders, including archived sent letters', () => {
  const waiting = [{ ...LETTERS[0], from: { name: 'Known', address: 'KNOWN@example.com' } }, { ...LETTERS[1], from: { name: 'Unknown', address: 'unknown@example.com' } }];
  const sent = [{ ...LETTERS[0], mailbox: 'archive', archivedFrom: 'sent', to: [{ name: 'Known', address: 'known@example.com' }] }];
  assert.equal(announcementCount(waiting, sent, 'every'), 2);
  assert.equal(announcementCount(waiting, sent, 'people'), 1);
  assert.equal(announcementCount(waiting, sent, 'none'), 0);
});
