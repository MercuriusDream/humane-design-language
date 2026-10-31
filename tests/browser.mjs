import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const chromePath = process.env.CHROME_PATH ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].find(existsSync);
if (!chromePath) throw new Error('Set CHROME_PATH to a Chrome/Chromium executable. No browser dependency is downloaded.');
const profile = await mkdtemp(join(tmpdir(), 'humane-browser-'));
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--config', 'tests/vite.config.ts'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
let serverLog = '';
const serverReady = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Vite startup timed out: ${serverLog}`)), 15000);
  const log = (chunk) => {
    serverLog += chunk;
    if (serverLog.includes('http://127.0.0.1:4179')) { clearTimeout(timer); resolve(); }
  };
  vite.stdout.on('data', log);
  vite.stderr.on('data', log);
  vite.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Vite exited ${code}: ${serverLog}`)); });
});
// Attach a rejection handler immediately; startup may fail before Chrome's endpoint is ready.
serverReady.catch(() => {});
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
let sessionId;
let sequence = 0;
const pending = new Map();
const errors = [];
let passed = 0;
const command = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
  pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value); }, reject: (error) => { clearTimeout(timer); reject(error); } });
  socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
});
const evaluate = async (expression) => {
  const response = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  return response.result.value;
};
const waitFor = (expression) => evaluate(`new Promise((resolve, reject) => { const end = performance.now() + 8000; const check = () => { if (${expression}) resolve(true); else if (performance.now() > end) reject(new Error('Condition timed out: ' + ${JSON.stringify(expression)})); else requestAnimationFrame(check); }; check(); })`);
const frames = () => evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
const settle = () => evaluate('Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})))');
const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const key = async (key, code = key) => {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: key === 'Escape' ? 27 : key === 'Tab' ? 9 : undefined });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
};
const open = async (app = '') => {
  await command('Page.navigate', { url: `http://127.0.0.1:4179/tests/fixture.html${app ? `?app=${app}` : ''}` });
  await waitFor('document.querySelector("#root")?.children.length > 0');
  await frames();
};
const viewport = async (width, fontSize = 16) => {
  await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await command('Page.setFontSizes', { fontSizes: { standard: fontSize, fixed: Math.round(fontSize * 0.8125) } });
  await frames();
  await settle();
};
const check = async (name, run) => { await run(); passed++; console.log(`✓ ${name}`); };
const field = async (label, value) => {
  await evaluate(`(() => {
    const label = [...document.querySelectorAll('label')].find(el => el.textContent === ${JSON.stringify(label)});
    const el = document.getElementById(label.htmlFor);
    Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', {bubbles:true}));
  })()`);
  await frames();
};
const mailbox = async (id) => {
  if (await evaluate('document.querySelector(".h-sidebar-toggle").getAttribute("aria-expanded") !== "true"')) {
    await click('.h-sidebar-toggle'); await settle();
  }
  await click(`.h-sidebar [data-id="${id}"]`); await frames(); await settle();
};
const mailData = () => evaluate('JSON.parse(localStorage.getItem("humane-letters-v1")).data');
const rect = (selector) => evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {top:r.top, left:r.left, right:r.right, bottom:r.bottom, width:r.width, height:r.height}; })()`);

try {
  const endpoint = await new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`Chrome startup timed out: ${stderr}`)), 15000);
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    chrome.once('error', reject);
  });
  socket = new WebSocket(endpoint);
  await once(socket, 'open');
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(message.error.message)); else request?.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(message.params.args.map((a) => a.value ?? a.description).join(' '));
    }
  });
  const { targetId } = await command('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, null));
  await command('Page.enable');
  await command('Runtime.enable');
  await serverReady;
  await viewport(1440);
  await open();
  await waitFor('window.humaneTest');
  await evaluate('humaneTest.prefs.setReducedMotion(true)');
  await frames();

  await check('loading reveals without moving following controls', async () => {
    const before = await rect('#loading-anchor');
    const fixed = await rect('#fixed-anchor');
    await evaluate('humaneTest.setReady(true)');
    await frames(); await settle();
    assert.ok(Math.abs((await rect('#loading-anchor')).top - before.top) < 1);
    assert.ok(Math.abs((await rect('#fixed-anchor')).top - fixed.top) < 1);
    assert.ok(await evaluate('document.querySelector("#fixed-loading .h-placeholder-content").scrollHeight >= 240'));
  });
  await check('trailing actions are independent, never nested buttons', async () => {
    assert.equal(await evaluate('document.querySelectorAll("button button").length'), 0);
    await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Remove separately").click()');
    await frames();
    assert.equal(await evaluate('document.querySelector("#row-actions").textContent'), '0,1');
  });
  await check('media hook refreshes when its query changes', async () => {
    assert.equal(await evaluate('document.querySelector("#media-result").textContent'), 'true');
    await evaluate('humaneTest.setQuery("(max-width: 1px)")');
    await waitFor('document.querySelector("#media-result").textContent === "false"');
  });
  await check('arrivals counts stay current and Show preserves focus', async () => {
    await evaluate('humaneTest.setCount(1)');
    await waitFor('document.querySelector(".h-arrivals-announce").textContent.includes("1 new")');
    await evaluate('humaneTest.setCount(10)');
    await waitFor('document.querySelector(".h-arrivals-announce").textContent.includes("10 new")');
    await evaluate('document.querySelector(".h-arrivals-button").focus(); document.querySelector(".h-arrivals-button").click()');
    await frames();
    assert.ok(await evaluate('document.activeElement !== document.body && !document.activeElement.closest("[inert]")'));
  });
  await check('notice and choice gaps follow the named spacing tokens', async () => {
    const metrics = await evaluate(`(() => {
      const notice = document.querySelector('#spacing-notice .h-notice');
      const title = notice.querySelector('.h-notice-title');
      const body = notice.querySelector('.h-notice-body');
      const action = notice.querySelector('.h-notice-action');
      const noBody = document.querySelector('#spacing-notice-nobody .h-notice');
      const noBodyTitle = noBody.querySelector('.h-notice-title');
      const noBodyAction = noBody.querySelector('.h-notice-action');
      const gap = (a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;
      const rows = [...document.querySelectorAll('#spacing-radio .h-radio-row')];
      const compactRows = [...document.querySelectorAll('#spacing-radio-compact .h-radio-row')];
      const rowStyle = getComputedStyle(rows[0]);
      const compactStyle = getComputedStyle(compactRows[0]);
      return {
        titleBody: gap(title, body),
        bodyAction: gap(body, action),
        noBodyAction: gap(noBodyTitle, noBodyAction),
        rowGap: gap(rows[0], rows[1]),
        rowHeight: rows[0].getBoundingClientRect().height,
        compactRowHeight: compactRows[0].getBoundingClientRect().height,
        rowPad: Number.parseFloat(rowStyle.paddingTop),
        compactRowPad: Number.parseFloat(compactStyle.paddingTop),
      };
    })()`);
    assert.ok(Math.abs(metrics.titleBody - 4) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.bodyAction - 8) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.noBodyAction - 8) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.rowGap - 8) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.rowHeight - 44) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.compactRowHeight - 36) < 0.5, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.rowPad - 8.40625) < 0.1, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.compactRowPad - 7.5) < 0.1, JSON.stringify(metrics));
  });
  await check('corners are capped at 2px and only the switch is a pill', async () => {
    const shape = await evaluate(`(() => {
      const radius = (selector) => {
        const el = document.querySelector(selector);
        return el ? Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) : null;
      };
      const track = document.querySelector('.h-switch-track');
      return {
        button: radius('.h-button'),
        segmented: radius('.h-segmented'),
        option: radius('.h-segmented-option'),
        tabsTrack: radius('.h-tabs-track'),
        tabsTab: radius('.h-tabs-tab'),
        listRow: radius('.h-list-row'),
        switchRadius: radius('.h-switch-track'),
        switchHeight: track ? track.getBoundingClientRect().height : 0,
      };
    })()`);
    assert.ok(shape.button !== null && shape.button <= 2.1, JSON.stringify(shape));
    assert.ok(shape.segmented !== null && shape.segmented <= 2.1, JSON.stringify(shape));
    assert.ok(shape.option === 0, JSON.stringify(shape));
    assert.ok(shape.tabsTrack !== null && shape.tabsTrack <= 2.1, JSON.stringify(shape));
    assert.ok(shape.tabsTab === 0, JSON.stringify(shape));
    assert.ok(shape.listRow !== null && shape.listRow <= 2.1, JSON.stringify(shape));
    assert.ok(Math.abs(shape.switchRadius - shape.switchHeight / 2) < 0.5, JSON.stringify(shape));
  });
  await check('forced colors keep choice and switch geometry', async () => {
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
    await frames();
    const forced = await evaluate(`(() => {
      const border = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).borderTopWidth) || 0;
      return {
        active: matchMedia('(forced-colors: active)').matches,
        checkbox: border('.h-checkbox-box'),
        radio: border('.h-radio-dot'),
        switchTrack: border('.h-switch-track'),
      };
    })()`);
    await command('Emulation.setEmulatedMedia', { features: [] });
    await frames();
    assert.ok(forced.active, JSON.stringify(forced));
    assert.ok(forced.checkbox > 0, JSON.stringify(forced));
    assert.ok(forced.radio > 0, JSON.stringify(forced));
    assert.ok(forced.switchTrack > 0, JSON.stringify(forced));
    assert.equal(await evaluate("matchMedia('(forced-colors: active)').matches"), false);
  });
  await check('disabled variants use the same inactive treatment', async () => {
    // One inactive ink for every variant; each keeps only the plane it rests on (a quiet button rests on none).
    const states = await evaluate('[...document.querySelectorAll("#disabled-buttons button")].map(b => {const s=getComputedStyle(b);return {variant:b.dataset.variant,color:s.color,background:s.backgroundColor}})');
    assert.equal(new Set(states.map(s => s.color)).size, 1);
    assert.equal(new Set(states.filter(s => s.variant !== 'quiet').map(s => s.background)).size, 1);
    assert.equal(states.find(s => s.variant === 'quiet').background, 'rgba(0, 0, 0, 0)');
  });
  await check('reduced-motion removal fades in place and re-entry cancels settlement', async () => {
    await evaluate('const action = document.querySelector(".h-undoable-list-action"); action.focus(); action.click()');
    await frames();
    const before = await rect('.h-undoable-list-item');
    await evaluate('document.querySelector("#loading-anchor").focus()');
    await frames();
    assert.equal(await evaluate('document.querySelector(".h-undoable-list-item").dataset.status'), 'leaving');
    assert.ok(Math.abs((await rect('.h-undoable-list-item')).height - before.height) < 1);
    await evaluate('document.querySelector(".h-undoable-list-action").focus()');
    await frames();
    await evaluate('new Promise(resolve => setTimeout(resolve, 160))');
    assert.equal(await evaluate('document.querySelector(".h-undoable-list-item").dataset.status'), 'removed');
    await evaluate('document.querySelector("#loading-anchor").focus()');
    await waitFor('document.querySelectorAll(".h-undoable-list-item").length === 1');
  });
  await check('interrupted FLIP starts at its current position, reduced motion uses opacity', async () => {
    const result = await evaluate(`(async () => {
      const { moveFrom } = await import('/system/src/lib/morph.ts');
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px';
      document.body.append(el);
      const first = el.getBoundingClientRect(); el.style.left = '100px';
      const a = moveFrom(el, first, false); a.pause(); a.currentTime = 40;
      const before = el.getBoundingClientRect(); el.style.left = '300px';
      const b = moveFrom(el, before, false); b.pause(); b.currentTime = 0;
      const difference = Math.abs(el.getBoundingClientRect().left - before.left);
      const second = el.getBoundingClientRect(); el.style.left = '400px';
      const reduced = moveFrom(el, second, true);
      const opacityOnly = reduced.effect.getKeyframes().every(frame => !('transform' in frame));
      reduced.cancel(); el.remove();
      return { difference, opacityOnly, cancelled: a.playState === 'idle' };
    })()`);
    assert.ok(result.difference < 1, JSON.stringify(result));
    assert.ok(result.opacityOnly && result.cancelled);
  });
  await check('rendered token pairs and stronger strokes pass all four modes', async () => {
    const results = await evaluate(`(async () => {
      const {colorContrast} = await import('/system/src/lib/color.ts');
      const root=document.documentElement, probe=document.createElement('span'); document.body.append(probe);
      const failures=[]; const strokes=[];
      const canvas=document.createElement('canvas'); canvas.width=canvas.height=1;
      const ctx=canvas.getContext('2d', {colorSpace:'srgb',willReadFrequently:true});
      for (const scheme of ['light','dark']) for (const contrast of ['standard','high']) {
        root.style.colorScheme=scheme; root.dataset.contrast=contrast;
        const color = token => {
          probe.style.color='var(--'+token+')'; ctx.fillStyle=getComputedStyle(probe).color; ctx.fillRect(0,0,1,1);
          const [r,g,b]=ctx.getImageData(0,0,1,1).data; return 'rgb('+r+' '+g+' '+b+')';
        };
        for (const ink of ['ink-1','ink-2','ink-3','signal-danger','ink-boundary','signal-focus']) for (const plane of ['plane-base','plane-sunken','plane-raised','plane-fill','plane-control','plane-control-hover','plane-control-active','plane-selected']) {
          const floor = ['ink-boundary','signal-focus'].includes(ink) ? 3 : 4.5;
          const ratio=colorContrast(color(ink),color(plane)); if (ratio < floor || ratio === null) failures.push({scheme,contrast,ink,plane,ratio});
        }
        strokes.push([parseFloat(getComputedStyle(root).getPropertyValue('--stroke')),parseFloat(getComputedStyle(root).getPropertyValue('--focus-width'))]);
      }
      probe.remove(); return {failures,strokes};
    })()`);
    assert.deepEqual(results.failures, []);
    assert.deepEqual(results.strokes, [[1,2],[2,3],[1,2],[2,3]]);
  });
  await check('checkbox boundaries thicken with contrast and controls draw no optional edge', async () => {
    const result = await evaluate(`(() => {
      const outer = document.createElement('div');
      outer.dataset.contrast = 'standard';
      outer.innerHTML = '<label class="h-checkbox"><input class="h-checkbox-input" type="checkbox"><span class="h-checkbox-box"></span></label><div data-contrast="high"><label class="h-checkbox"><input class="h-checkbox-input" type="checkbox"><span class="h-checkbox-box"></span></label><button class="h-button">High</button></div><div data-contrast="standard"><button class="h-button">Standard again</button></div>';
      document.body.append(outer);
      const boxes = [...outer.querySelectorAll('.h-checkbox-box')].map(el => getComputedStyle(el).boxShadow);
      const buttons = [...outer.querySelectorAll('.h-button')].map(el => getComputedStyle(el).boxShadow);
      outer.remove();
      return { boxes, buttons };
    })()`);
    assert.ok(result.boxes[0].includes('1px'), result.boxes[0]);
    assert.ok(result.boxes[1].includes('2px'), result.boxes[1]);
    assert.deepEqual(result.buttons, ['none', 'none']);
  });
  await check('menu flips and stays within the viewport', async () => {
    await click('#edge-menu button'); await settle();
    const r = await rect('#edge-menu [role="menu"]');
    assert.ok(r.left >= 0 && r.right <= 1441 && r.top >= 0 && r.bottom <= 901, JSON.stringify(r));
    assert.ok(await evaluate('document.activeElement.getAttribute("role") === "menuitem"'));
    await key('Escape'); await settle();
    assert.ok(await evaluate('document.activeElement === document.querySelector("#edge-menu button")'));
  });
  await check('menus work in the native modal top layer', async () => {
    await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Open test dialog").click()');
    await waitFor('document.querySelector("dialog").open'); await settle();
    await evaluate('[...document.querySelectorAll("dialog button")].find(b => b.textContent === "Dialog menu").click()');
    await settle();
    assert.ok(await evaluate('document.activeElement.getAttribute("role") === "menuitem"'));
    const r = await rect('dialog [role="menu"]');
    assert.ok(r.top >= 0 && r.bottom <= 901, JSON.stringify(r));
    await key('Escape'); await settle();
    assert.ok(await evaluate('document.querySelector("dialog").open'));
    await key('Escape'); await settle();
    await waitFor('!document.querySelector("dialog").open');
  });
  await check('200% text wraps long tabs and options without page overflow', async () => {
    await viewport(390, 32);
    assert.equal(await evaluate('getComputedStyle(document.documentElement).fontSize'), '32px');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'));
    const overflow = await evaluate('[...document.querySelectorAll(".h-tabs-tab,.h-segmented-option")].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)');
    assert.deepEqual(overflow, []);
    const spacing = await evaluate(`(() => {
      const row = document.querySelector('#spacing-radio .h-radio-row');
      const compact = document.querySelector('#spacing-radio-compact .h-radio-row');
      return {
        rowPad: Number.parseFloat(getComputedStyle(row).paddingTop),
        compactPad: Number.parseFloat(getComputedStyle(compact).paddingTop),
        rowHeight: row.getBoundingClientRect().height,
        compactHeight: compact.getBoundingClientRect().height,
      };
    })()`);
    assert.ok(Math.abs(spacing.rowPad - 16.8047) < 0.1, JSON.stringify(spacing));
    assert.ok(Math.abs(spacing.compactPad - 15) < 0.1, JSON.stringify(spacing));
    assert.ok(Math.abs(spacing.rowHeight - 88) < 0.5, JSON.stringify(spacing));
    assert.ok(Math.abs(spacing.compactHeight - 72) < 0.5, JSON.stringify(spacing));
  });
  await check('overlay navigation returns focus before becoming inert', async () => {
    const toggle = '.h-sidebar-toggle';
    if (await evaluate(`document.querySelector('${toggle}').getAttribute('aria-expanded') !== 'true'`)) await click(toggle);
    await settle();
    await evaluate('const nav = document.querySelector(".h-sidebar nav button"); nav.focus(); nav.click()');
    await frames(); await settle();
    assert.ok(await evaluate('document.activeElement === document.querySelector(".h-sidebar-toggle")'));
  });

  for (const app of ['landing', 'docs', 'flagship']) {
    for (const width of [390, 1440]) {
      await check(`${app} renders at ${width}px and 200% text without horizontal page overflow`, async () => {
        await viewport(width, 32);
        await open(app);
        if (app === 'flagship') await waitFor('document.querySelector(".message-list-body")');
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), await evaluate('JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth})'));
      });
    }
  }
  await check('documentation reference lists are semantic definition lists', async () => {
    await open('docs');
    const result = await evaluate(`(() => {
      const lists = [...document.querySelectorAll('.doc-definitions')];
      const props = lists.find((list) => list.querySelector('.doc-definition-type'));
      const conformance = lists.find((list) => list.classList.contains('doc-tests'));
      const firstDefinition = props?.querySelector('.doc-definition');
      return {
        propsTag: props?.tagName ?? '',
        propsTerms: props?.querySelectorAll('dt').length ?? 0,
        propsDefinitions: props?.querySelectorAll('dd').length ?? 0,
        conformanceTag: conformance?.tagName ?? '',
        conformanceTerms: conformance?.querySelectorAll('dt').length ?? 0,
        conformanceDefinitions: conformance?.querySelectorAll('dd').length ?? 0,
        labels: [...(firstDefinition?.querySelectorAll('.visually-hidden') ?? [])].map((el) => el.textContent.trim()),
      };
    })()`);
    assert.equal(result.propsTag, 'DL', JSON.stringify(result));
    assert.equal(result.conformanceTag, 'DL', JSON.stringify(result));
    assert.ok(result.propsTerms > 0 && result.propsDefinitions >= result.propsTerms * 2, JSON.stringify(result));
    assert.ok(result.conformanceTerms > 0 && result.conformanceDefinitions === result.conformanceTerms, JSON.stringify(result));
    assert.deepEqual(result.labels, ['Type:', 'Meaning:']);
  });
  await check('documentation readouts refresh when contrast changes without changing scheme', async () => {
    await open('docs');
    const choose = async (label, option) => {
      await evaluate(`(() => {
        const group=[...document.querySelectorAll('.h-segmented-field')].find(el=>el.firstElementChild.textContent.trim()===${JSON.stringify(label)});
        [...group.querySelectorAll('button')].find(el=>el.textContent===${JSON.stringify(option)}).click();
      })()`);
      await frames();
    };
    await choose('Theme','Light'); await choose('Contrast','Standard');
    await waitFor('document.querySelector(".steps .step-value").textContent.includes("0.935")');
    await choose('Contrast','High');
    await waitFor('document.querySelector(".steps .step-value").textContent.includes("0.880")');
    const before=await evaluate('document.querySelectorAll(".ex-interactive-boundaries-meet-a-contrast-floor-reading")[1].textContent');
    await click('.ex-interactive-boundaries-meet-a-contrast-floor-stage input[type="checkbox"]'); await frames();
    const after=await evaluate('document.querySelectorAll(".ex-interactive-boundaries-meet-a-contrast-floor-reading")[1].textContent');
    assert.notEqual(before, after);
    assert.ok(after.includes('Meets 3:1'), after);
  });
  await check('docs scrolling changes the current label without moving the closed sidebar', async () => {
    await viewport(390, 16);
    await evaluate(`(() => {
      const preferences = JSON.parse(localStorage.getItem('humane-preferences') ?? '{}');
      localStorage.setItem('humane-preferences', JSON.stringify({...preferences, reducedMotion:false}));
    })()`);
    await open('docs');
    await evaluate(`document.querySelector('.h-sidebar-toggle').focus({preventScroll:true})`);
    const before = await rect('.h-sidebar');
    await evaluate(`document.querySelector('#attention-is-finite').scrollIntoView({behavior:'instant'})`);
    await waitFor(`document.querySelector('.h-sidebar-current').textContent === 'Attention is finite'`);
    await frames();
    const after = await rect('.h-sidebar');
    assert.equal(await evaluate(`document.querySelector('.h-sidebar-current').textContent`), 'Attention is finite');
    assert.deepEqual(after, before);
    assert.equal(await evaluate(`document.querySelector('.h-sidebar').getAnimations().length`), 0);
    assert.ok(await evaluate(`document.activeElement === document.querySelector('.h-sidebar-toggle')`));
  });
  await check('landing analytics dismissal persists with a way to reopen', async () => {
    await viewport(390, 16);
    await evaluate(`localStorage.removeItem('humane-analytics-notice-dismissed')`);
    await open('landing');
    await waitFor(`document.querySelector('.landing-analytics')`);
    await evaluate(`document.querySelector('.landing-analytics .h-button').focus({preventScroll:true})`);
    await click('.landing-analytics .h-button');
    await waitFor(`!document.querySelector('.landing-analytics')`);
    assert.ok(await evaluate(`document.activeElement === document.querySelector('.landing-foot button')`));
    await open('landing');
    assert.equal(await evaluate(`document.querySelector('.landing-analytics') === null`), true);
    await click('.landing-foot button');
    await waitFor(`document.querySelector('.landing-analytics')`);
    await key('Escape');
    await waitFor(`!document.querySelector('.landing-analytics')`);
  });
  await evaluate(`(() => {
    const preferences = JSON.parse(localStorage.getItem('humane-preferences') ?? '{}');
    localStorage.setItem('humane-preferences', JSON.stringify({...preferences, reducedMotion:true}));
  })()`);
  await viewport(390, 16);
  await evaluate(`(async () => {
    const {initial} = await import('/flagship/src/store.tsx');
    const {encodeMail} = await import('/flagship/src/mail-storage.ts');
    localStorage.setItem('humane-letters-v1', encodeMail({letters:initial.letters,waiting:[],outgoing:[],settings:{notify:'every',signature:''},laterReceived:true}));
  })()`);
  await open('flagship');
  await waitFor('document.querySelector(".h-placeholder[aria-busy=false]")');
  await check('changing letters keeps the open reader in place', async () => {
    await viewport(1440, 16);
    await evaluate(`(() => {
      const preferences = JSON.parse(localStorage.getItem('humane-preferences') ?? '{}');
      localStorage.setItem('humane-preferences', JSON.stringify({...preferences, reducedMotion:false}));
    })()`);
    await open('flagship');
    await waitFor('document.querySelector(".h-placeholder[aria-busy=false]")');
    await click('.message-row');
    await frames();
    const openingTravel = await evaluate(`document.querySelector('.reader').getAnimations().flatMap(a => a.effect.getKeyframes()).some(frame => frame.transform && frame.transform !== 'none' && frame.transform !== 'translate(0px, 0px) scale(1, 1)')`);
    assert.ok(openingTravel, 'the first letter grows from its row');
    await settle();
    const before = await rect('.reader');
    const subject = await evaluate(`document.querySelectorAll('.message-row-subject')[1].textContent`);
    await evaluate(`document.querySelectorAll('.message-row')[1].click()`);
    await frames();
    const change = await evaluate(`(() => {
      const reader = document.querySelector('.reader');
      const frames = reader.getAnimations().flatMap(a => a.effect.getKeyframes());
      const rect = reader.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        subject: document.querySelector('.reader-subject').textContent,
        faded: frames.some(frame => frame.opacity !== undefined && Number(frame.opacity) < 1),
        transforms: frames.map(frame => frame.transform).filter(Boolean),
      };
    })()`);
    assert.ok(Math.abs(change.left - before.left) < 1 && Math.abs(change.top - before.top) < 1, JSON.stringify(change));
    assert.equal(change.subject, subject);
    assert.ok(change.faded, JSON.stringify(change));
    assert.ok(change.transforms.every(transform => transform === 'none' || transform === 'translate(0px, 0px) scale(1, 1)'), JSON.stringify(change));
  });
  await evaluate(`(() => {
    const preferences = JSON.parse(localStorage.getItem('humane-preferences') ?? '{}');
    localStorage.setItem('humane-preferences', JSON.stringify({...preferences, reducedMotion:true}));
  })()`);
  await viewport(390, 16);
  await open('flagship');
  await waitFor('document.querySelector(".h-placeholder[aria-busy=false]")');
  await check('single-pane reading and Back hand focus to the destination', async () => {
    const id = await evaluate('document.querySelector(".message-list-item").dataset.letterId');
    await evaluate('document.querySelector(".message-row").focus(); document.querySelector(".message-row").click()');
    await frames(); await settle();
    assert.ok(await evaluate('document.activeElement.classList.contains("reader-subject")'));
    await click('.reader-back'); await frames();
    assert.equal(await evaluate('document.activeElement.closest("[data-letter-id]")?.dataset.letterId'), id);
  });
  await check('settings persist across reload and initialize a new signature once', async () => {
    await mailbox('settings');
    await field('Signature', 'Regards\nAudit signature');
    await click('input[name="notifications"][value="none"]'); await frames();
    await open('flagship'); await mailbox('settings');
    assert.equal(await evaluate('document.querySelector(".settings-view textarea").value'), 'Regards\nAudit signature');
    assert.ok(await evaluate('document.querySelector("input[name=notifications][value=none]").checked'));
    await mailbox('inbox'); await click('.mailbox-write'); await waitFor('document.querySelector("dialog[open] textarea")');
    assert.equal(await evaluate('document.querySelector("dialog[open] textarea").value'), 'Regards\nAudit signature');
  });
  let draftId;
  await check('draft edits autosave before dismissal and invalid recipients cannot send', async () => {
    await field('To', '@'); await field('Subject', 'Audit autosave'); await field('Letter', 'First line\nSecond line\n\nRegards\nAudit signature');
    await click('.compose-send'); await frames();
    assert.ok(await evaluate('document.querySelector("dialog[open] input[aria-invalid=true]") !== null'));
    assert.equal((await mailData()).outgoing.length, 0);
    await field('To', 'friend@example.com');
    const draft = (await mailData()).letters.find(l => l.subject === 'Audit autosave');
    assert.ok(draft); draftId = draft.id;
    assert.equal(draft.body, 'First line\nSecond line\n\nRegards\nAudit signature');
    await open('flagship'); await mailbox('drafts');
    await click(`[data-letter-id="${draftId}"] .message-row`); await waitFor('document.querySelector("dialog[open] textarea")');
    assert.equal(await evaluate('document.querySelector("dialog[open] textarea").value'), draft.body);
  });
  await check('clearing an existing draft persists rather than resurrecting old content', async () => {
    await field('To', ''); await field('Subject', ''); await field('Letter', '');
    await click('dialog[open] .h-dialog-close'); await settle();
    const draft = (await mailData()).letters.find(l => l.id === draftId);
    assert.deepEqual([draft.to, draft.subject, draft.body], [[], '', '']);
    await click(`[data-letter-id="${draftId}"] .message-row`); await waitFor('document.querySelector("dialog[open] textarea")');
    assert.equal(await evaluate('document.querySelector("dialog[open] textarea").value'), '');
    await click('dialog[open] .h-dialog-close'); await settle();
  });
  await check('archive restoration retains sent-mail provenance after the ghost is gone', async () => {
    await mailbox('sent');
    const id = await evaluate('document.querySelector(".message-list-item").dataset.letterId');
    const recipient = (await mailData()).letters.find(l => l.id === id).to[0].address;
    await click(`[data-letter-id="${id}"] .message-row`); await frames();
    await click('.reader-actions button'); await waitFor('document.querySelector("dialog[open] input")');
    assert.ok(await evaluate(`document.querySelector('dialog[open] input').value.includes(${JSON.stringify(recipient)})`));
    await click('dialog[open] .h-dialog-close'); await settle();
    await evaluate('[...document.querySelectorAll(".reader button")].find(b => b.textContent === "Archive").click()'); await frames();
    assert.equal((await mailData()).letters.find(l => l.id === id).mailbox, 'archive');
    await mailbox('inbox'); await mailbox('archive');
    await click(`[data-letter-id="${id}"] .message-row`); await frames();
    await evaluate('[...document.querySelectorAll(".reader button")].find(b => b.textContent === "Restore").click()'); await frames();
    assert.equal((await mailData()).letters.find(l => l.id === id).mailbox, 'sent');
  });
  await check('send clock survives typing; failures stay visible in Settings and recover to Drafts', async () => {
    await mailbox('settings');
    await evaluate('[...document.querySelectorAll("[role=switch]")].find(el => el.textContent.includes("Fail the next send")).click()');
    await mailbox('inbox'); await click('.mailbox-write'); await waitFor('document.querySelector("dialog[open] textarea")');
    await field('To', 'friend@example.com'); await field('Subject', 'Recover this letter'); await field('Letter', 'Recoverable body');
    await click('.compose-send'); await settle();
    await evaluate(`new Promise(resolve => {
      const input=document.querySelector('.search-field input'); let n=0;
      const timer=setInterval(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input, 'typing '+n++);
        input.dispatchEvent(new Event('input',{bubbles:true}));
        if(n===20){clearInterval(timer);resolve();}
      },50);
    })`);
    assert.ok((await mailData()).outgoing[0].progress > .03);
    await mailbox('settings');
    await waitFor('JSON.parse(localStorage.getItem("humane-letters-v1")).data.outgoing[0].status === "failed"');
    assert.ok(await evaluate('document.querySelector(".outbox-region").textContent.includes("connection dropped")'));
    assert.ok(await evaluate('[...document.querySelectorAll(".mailbox-announce")].some(el => el.textContent.includes("Letter not sent"))'));
    await evaluate('[...document.querySelectorAll(".outbox-region button")].find(el => el.textContent === "Keep as draft").click()'); await frames();
    const data=await mailData();
    assert.equal(data.outgoing.length,0);
    assert.equal(data.letters.find(l=>l.subject==='Recover this letter').body,'Recoverable body');
  });
  await check('a stale editing session cannot overwrite a changed stored snapshot', async () => {
    await evaluate(`(() => {const saved=JSON.parse(localStorage.getItem('humane-letters-v1'));saved.data.settings.signature='Changed in another tab';localStorage.setItem('humane-letters-v1',JSON.stringify(saved));})()`);
    await field('Signature', 'My conflicting edit');
    await waitFor('document.querySelector(".outbox-region").textContent.includes("changed in another tab")');
    assert.equal((await mailData()).settings.signature, 'Changed in another tab');
  });
  await check('unsupported stored mail is preserved and replacement requires confirmation', async () => {
    const raw = '{"version":99,"important":"do not overwrite"}';
    await evaluate(`localStorage.setItem('humane-letters-v1',${JSON.stringify(raw)})`);
    await open('flagship'); await frames();
    assert.equal(await evaluate('localStorage.getItem("humane-letters-v1")'), raw);
    await evaluate('[...document.querySelectorAll(".outbox-region button")].find(el => el.textContent.includes("Replace stored mail")).click()');
    await waitFor('document.querySelector("dialog[open]")');
    assert.equal(await evaluate('localStorage.getItem("humane-letters-v1")'), raw);
    await key('Escape'); await settle();
    assert.equal(await evaluate('localStorage.getItem("humane-letters-v1")'), raw);
  });
  await check('browser run has no uncaught errors or React errors', async () => assert.deepEqual(errors, []));
  console.log(`\n${passed} browser checks passed (${await command('Browser.getVersion', {}, null).then(v => v.product)}).`);
} catch (error) {
  if (socket?.readyState === WebSocket.OPEN && sessionId) {
    try {
      const { data } = await command('Page.captureScreenshot', { format: 'png' });
      const path = join(tmpdir(), 'humane-browser-failure.png');
      await writeFile(path, Buffer.from(data, 'base64'));
      console.error(`Failure screenshot: ${path}`);
      console.error(await evaluate('document.body.innerText.slice(0, 2000)'));
      console.error('Browser errors:', errors);
    } catch {}
  }
  throw error;
} finally {
  socket?.close();
  const chromeExit = chrome.exitCode === null && chrome.signalCode === null ? once(chrome, 'exit').catch(() => {}) : Promise.resolve();
  chrome.kill(); vite.kill();
  await chromeExit;
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
