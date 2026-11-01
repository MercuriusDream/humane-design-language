import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { colorContrast, neutralContrast, oklchLightness, relativeLuminance } from '../system/src/lib/color.ts';
import { morphBezier, morphChannel, morphDuration } from '../system/src/lib/motion.ts';
import { parsePreferences } from '../system/src/lib/preferenceStorage.ts';
import { rootRadius } from '../system/src/lib/rootRadius.ts';

const near = (actual, expected, tolerance = 0.0001) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`);

test('contrast uses actual luminance, including hue and chroma', () => {
  near(colorContrast('rgb(0 0 0)', 'rgb(255 255 255)'), 21);
  near(relativeLuminance('rgb(255, 0, 0)'), 0.2126);
  near(relativeLuminance('rgb(100% 0% 0%)'), 0.2126);
  near(relativeLuminance('color(srgb 1 0 0)'), 0.2126);
  near(relativeLuminance('color(srgb-linear 1 0 0)'), 0.2126);
  near(relativeLuminance('oklch(0.62795536 0.25768331 29.233885)'), 0.2126);
  near(relativeLuminance('oklab(0.62795536 0.22486306 0.1258463)'), 0.2126);
  near(oklchLightness('rgb(255 0 0)'), 0.62795536);
  near(oklchLightness('oklch(62.795536% 0.25768331 29.233885)'), 0.62795536);
  near(colorContrast('oklch(.5 0 0)', 'oklch(1 0 0)'), neutralContrast(.5, 1));
  assert.notEqual(colorContrast('oklch(.6 .15 25)', 'rgb(255 255 255)'), colorContrast('oklch(.6 .15 140)', 'rgb(255 255 255)'));
});

test('unsupported or translucent colors cannot produce a false contrast pass', () => {
  for (const value of ['transparent', 'rgba(0, 0, 0, .5)', 'rgb(0 0 0 / 0%)', 'oklch(.5 .1 20 / .5)', 'garbage', 'rgb(no 0 0)']) {
    assert.equal(colorContrast(value, 'rgb(255 255 255)'), null, value);
  }
  near(colorContrast('rgb(0 0 0 / 100%)', 'rgb(255 255 255 / 1)'), 21);
});

const tokens = readFileSync(new URL('../system/src/styles/tokens.css', import.meta.url), 'utf8');
const palettes = new Map();
for (const [, name, light, dark] of tokens.matchAll(/--([\w-]+): light-dark\((oklch\([^)]+\)), (oklch\([^)]+\))\);/g)) {
  palettes.set(name, [...(palettes.get(name) ?? []), light, dark]);
}
for (const [mode, name] of ['light standard', 'dark standard', 'light high', 'dark high'].entries()) {
  test(`all supported text, signal and boundary pairs pass in ${name}`, () => {
    const planes = [...palettes].filter(([key]) => key.startsWith('plane-'));
    assert.equal(planes.length, 8);
    for (const ink of ['ink-1', 'ink-2', 'ink-3', 'signal-danger', 'ink-boundary', 'signal-focus']) {
      const floor = ink === 'ink-boundary' || ink === 'signal-focus' ? 3 : 4.5;
      for (const [plane, colors] of planes) {
        const ratio = colorContrast(palettes.get(ink)[mode], colors[mode]);
        assert.ok(ratio >= floor, `${ink} on ${plane}: ${ratio?.toFixed(3)} < ${floor}`);
      }
    }
    const inverse = palettes.get('ink-inverse')[mode % 2];
    for (const ink of ['ink-1', 'ink-2']) assert.ok(colorContrast(inverse, palettes.get(ink)[mode]) >= 4.5);
  });
}

test('heading tracking matches normal letter spacing', () => {
  for (const role of ['display', 'title', 'heading', 'text']) assert.match(tokens, new RegExp(`--tracking-${role}: 0;`));
});

test('duration grows with distance and stays within its declared bounds', () => {
  assert.equal(morphDuration(0), 48);
  assert.equal(morphDuration(8), 62);
  assert.equal(morphDuration(300), 264);
  assert.equal(morphDuration(-300), 264);
  assert.equal(morphDuration(10000), 360);
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const duration = morphDuration(i);
    assert.ok(duration >= previous && duration >= 48 && duration <= 360);
    previous = duration;
  }
});

test('morphChannel follows cubic-bezier(0.2, 0, 0, 1) from rest and preserves velocity when redirected', () => {
  assert.equal(morphBezier(0).value, 0);
  assert.equal(morphBezier(1).value, 1);
  assert.ok(morphBezier(0.2).value > 0.4);
  const first = morphChannel(-200, 0, 240);
  near(first.at(0), -200);
  near(first.at(1), 0);
  const u = 0.35;
  const posAtInterrupt = 200 + first.at(u);
  const velAtInterrupt = first.velocity(u);
  assert.ok(velAtInterrupt > 0);
  const redirected = morphChannel(posAtInterrupt - 50, velAtInterrupt, 200);
  near(redirected.at(0), posAtInterrupt - 50);
  near(redirected.velocity(0), velAtInterrupt);
  near(redirected.at(1), 0);
  near(redirected.velocity(1), 0);
});

test('root radius is capped at 2px and does not depend on orientation', () => {
  assert.equal(rootRadius(296, 900), 2);
  assert.equal(rootRadius(300, 880), 2);
  assert.equal(rootRadius(880, 300), 2);
  assert.equal(rootRadius(20, 100), 1);
});

test('pre-paint preference scripts agree with provider defaults, including corrupt storage', () => {
  for (const app of ['docs', 'flagship']) {
    const html = readFileSync(new URL(`../${app}/index.html`, import.meta.url), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    for (const raw of ['null', '{', '{"theme":"bogus","contrast":false,"grayscale":"false","reducedMotion":"false"}', '{"theme":"dark","contrast":"standard","grayscale":true,"reducedMotion":false}']) {
      const root = { style: {}, dataset: {} };
      runInNewContext(script, { localStorage: { getItem: () => raw }, document: { documentElement: root }, matchMedia: () => ({ matches: true }) });
      let value; try { value = JSON.parse(raw); } catch {}
      const parsed = parsePreferences(value);
      assert.equal(root.style.colorScheme ?? 'system', parsed.theme);
      assert.equal(root.dataset.contrast, parsed.contrast === 'standard' ? 'standard' : 'high');
      assert.equal('grayscale' in root.dataset, parsed.grayscale);
      assert.equal(root.dataset.motion, parsed.reducedMotion === false ? 'full' : 'reduced');
    }
  }
});

test('stored preferences validate every field independently', () => {
  const defaults = { theme: 'system', contrast: 'system', side: 'left', grayscale: false, reducedMotion: null };
  for (const invalid of [null, undefined, 42, 'dark', [], { theme: 'invalid', contrast: true, side: 'up', grayscale: 'false', reducedMotion: 'false' }]) {
    assert.deepEqual(parsePreferences(invalid), defaults);
  }
  const valid = { theme: 'dark', contrast: 'high', side: 'right', grayscale: true, reducedMotion: false };
  assert.deepEqual(parsePreferences(valid), valid);
  assert.deepEqual(parsePreferences({ theme: 'light', extra: 1 }), { ...defaults, theme: 'light' });
});
