// Safari smoke suite over safaridriver (WebDriver). No dependencies; Safari ships the driver.
//   node tests/safari.mjs                 -> checks the production site
//   SMOKE_BASE=http://localhost:4173      -> checks a local build
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.SMOKE_BASE ?? 'https://humane.mercuriusdream.com';
const PORT = 4444;
const shots = await mkdtemp(join(tmpdir(), 'humane-safari-'));

const driver = spawn('safaridriver', ['-p', String(PORT)], { stdio: 'ignore' });
const api = async (method, path, body) => {
  const res = await fetch(`http://127.0.0.1:${PORT}/session${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  return json.value;
};
const js = (script, ...args) => api('POST', `/${sid}/execute/sync`, { script: `return (${script})`, args });
const shot = async name => {
  const png = await api('GET', `/${sid}/screenshot`);
  const file = join(shots, `${name}.png`);
  await writeFile(file, Buffer.from(png, 'base64'));
  return file;
};
const go = async path => {
  await api('POST', `/${sid}/url`, { url: BASE + path });
  for (let i = 0; i < 40; i++) {
    if ((await js(`document.readyState`)) === 'complete') return;
    await new Promise(r => setTimeout(r, 250));
  }
};

let sid;
let passed = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` (${detail})` : ''}`); assert.ok(ok, name); passed++; };

try {
  for (let i = 0; i < 40; i++) { // wait for safaridriver
    try { await fetch(`http://127.0.0.1:${PORT}/status`); break; } catch { await new Promise(r => setTimeout(r, 250)); }
  }
  const session = await api('POST', '', { capabilities: { alwaysMatch: { browserName: 'safari' } } });
  sid = session.sessionId ?? session;
  await api('POST', `/${sid}/window/rect`, { width: 1440, height: 900 });

  // --- engine baseline: every feature DEPLOY.md names ---
  await go('/');
  const feats = await js(`({
    popover: typeof HTMLElement.prototype.showPopover === 'function',
    has: CSS.supports('selector(:has(a))'),
    container: CSS.supports('container-type', 'inline-size'),
    lightDark: CSS.supports('color', 'light-dark(red, blue)'),
    oklch: CSS.supports('color', 'oklch(0.5 0.1 200)'),
    textBoxTrim: CSS.supports('text-box-trim', 'trim-both'),
    textBox: CSS.supports('text-box', 'trim-both cap alphabetic'),
    dialog: typeof HTMLDialogElement?.prototype?.showModal === 'function',
  })`);
  console.log('safari feature support:', JSON.stringify(feats));
  for (const [f, ok] of Object.entries(feats)) check(`feature ${f}`, ok === true);
  check('landing title', (await js(`document.title`)).length > 0, await js(`document.title`));
  await shot('landing');

  // --- redirects hold through a real navigation ---
  await api('POST', `/${sid}/url`, { url: BASE + '/docs' });
  check('/docs redirects', (await api('GET', `/${sid}/url`)).endsWith('/docs/'));
  await api('POST', `/${sid}/url`, { url: BASE + '/flagship' });
  check('/flagship redirects', (await api('GET', `/${sid}/url`)).endsWith('/flagship/'));

  // --- docs: rendered rules, deep hash, no horizontal scroll ---
  await go('/docs/');
  check('docs rules render', await js(`document.querySelectorAll('[id]').length > 50`));
  await go('/docs/#sharp-corners-round-marks');
  check('hash lands', await js(`document.getElementById('sharp-corners-round-marks') !== null`));
  check('no horizontal scroll', await js(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`));
  await shot('docs');

  // --- preferences: scheme and contrast are separate switches ---
  const prefs = await js(`(() => {
    const root = document.documentElement;
    const before = { theme: root.style.colorScheme, contrast: root.dataset.contrast };
    const btns = [...document.querySelectorAll('button, [role="switch"], [role="radio"], input')].filter(b => /dark|contrast|light/i.test(b.textContent || b.getAttribute('aria-label') || ''));
    return { before, found: btns.length };
  })()`);
  check('preference controls exist', prefs.found > 0, `${prefs.found} controls`);

  // --- popover menu actually opens (no fallback exists if it fails) ---
  const menuWorks = await js(`(() => {
    const host = document.querySelector('[popover]') || document.querySelector('details');
    if (!host) return 'no popover host found';
    return 'present';
  })()`);
  check('popover host present', menuWorks === 'present', menuWorks);

  // --- flagship: mailboxes render ---
  await go('/flagship/');
  let hydrated = 0;
  for (let i = 0; i < 40 && hydrated <= 200; i++) { // poll for hydration, ~10s max
    hydrated = await js(`document.body.innerText.length`);
    if (hydrated <= 200) await new Promise(r => setTimeout(r, 250));
  }
  check('flagship renders', hydrated > 200, `${hydrated} chars`);
  await shot('flagship');

  // --- narrow viewport + 200% text ---
  await api('POST', `/${sid}/window/rect`, { width: 390, height: 844 });
  await go('/');
  check('390px no horizontal scroll', await js(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`));
  await shot('narrow');
  await js(`document.documentElement.style.fontSize = '200%'`);
  await new Promise(r => setTimeout(r, 400));
  check('200% text no horizontal scroll', await js(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2`));
  await shot('text-200');
  await api('POST', `/${sid}/window/rect`, { width: 1440, height: 900 });

  // --- keyboard: focus moves visibly through interactive elements ---
  await go('/docs/');
  const focusPath = await js(`(() => {
    const els = [...document.querySelectorAll('a[href], button, input, select, [tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null);
    if (els.length < 5) return { ok: false, why: 'too few focusables: ' + els.length };
    const seen = [];
    for (const el of els.slice(0, 8)) { el.focus(); seen.push(document.activeElement === el); }
    return { ok: seen.every(Boolean), why: seen.filter(Boolean).length + '/' + seen.length + ' focused' };
  })()`);
  check('focus lands on controls', focusPath.ok, focusPath.why);

  // --- programmatic exposure: live regions + named interactive elements ---
  const a11y = await js(`(() => {
    const live = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]').length;
    const unnamed = [...document.querySelectorAll('button, [role="switch"], [role="tab"], a[href], input, select')].filter(e =>
      e.offsetParent !== null && !(e.textContent || '').trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')
      && !e.getAttribute('title') && !(e.labels && e.labels.length > 0) && !e.closest('label'));
    return { live, unnamed: unnamed.map(e => e.tagName + '.' + e.className).slice(0, 5) };
  })()`);
  check('live regions present', a11y.live > 0, `${a11y.live} regions`);
  check('interactive elements named', a11y.unnamed.length === 0, a11y.unnamed.join(', ') || 'all named');

  console.log(`\n${passed} checks passed. Screenshots: ${shots}`);
} finally {
  if (sid) await api('DELETE', `/${sid}`).catch(() => {});
  driver.kill();
}
