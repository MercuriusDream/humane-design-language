import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { colorContrast } from '../system/src/lib/color.ts';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const language = read('README.md');
const system = read('system/README.md');
const slug = name => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
const names = [...language.matchAll(/^\*\*([^*]+)\*\*/gm)].map(match => match[1].replace(/\.$/, ''));
const slugs = new Set(names.map(slug));

test('every language rule, premise and signature has an example, with resolvable citations', () => {
  assert.ok(names.length >= 50);
  assert.equal(slugs.size, names.length);
  for (const name of names) assert.ok(existsSync(new URL(`../docs/src/examples/${slug(name)}.tsx`, import.meta.url)), name);
  for (const [, citation] of language.matchAll(/\*\(([^)]+)\)\*\s*$/gm)) {
    for (const premise of citation.split('.').map(s => s.trim()).filter(Boolean)) assert.ok(names.includes(premise), premise);
  }
  for (const file of readdirSync(new URL('../docs/src/system-docs', import.meta.url)).filter(f => f.endsWith('.tsx'))) {
    for (const block of read(`docs/src/system-docs/${file}`).matchAll(/<Serves[\s\S]*?\/>/g)) {
      for (const [, reference] of block[0].matchAll(/'([a-z]+(?:-[a-z]+)+)'/g)) assert.ok(slugs.has(reference), `${file}: ${reference}`);
    }
  }
});

const palettes = new Map();
for (const [, name, light, dark] of read('system/src/styles/tokens.css').matchAll(/--([\w-]+): light-dark\((oklch\([^)]+\)), (oklch\([^)]+\))\);/g)) {
  palettes.set(name, [...(palettes.get(name) ?? []), light, dark]);
}

test('documented palette lightness and chroma match the implementation', () => {
  let checked = 0;
  for (const line of system.split('\n')) {
    const token = line.match(/^\| `--([\w-]+)`/);
    if (!token || !palettes.has(token[1])) continue;
    const columns = line.split('|').slice(2, 6);
    columns.forEach((cell, mode) => {
      const values = cell.match(/L ([\d.]+), C ([\d.]+)/);
      if (!values) return;
      const colors = palettes.get(token[1]);
      const actual = colors[mode] ?? colors[mode % 2];
      const channels = actual.match(/oklch\(([\d.]+) ([\d.]+)/);
      assert.deepEqual(values.slice(1).map(Number), channels.slice(1).map(Number), `${token[1]} mode ${mode}`);
      checked++;
    });
  }
  assert.ok(checked >= 50);
});

test('documented sample contrast ratios are reproducible from the tokens', () => {
  let checked = 0;
  for (const line of system.split('\n')) {
    const pair = line.match(/^\| `--([\w-]+)` on `--([\w-]+)`/);
    if (!pair) continue;
    const ratios = [...line.matchAll(/([\d.]+):1/g)].slice(0, 4).map(match => match[1]);
    for (let mode = 0; mode < 4; mode++) assert.equal(colorContrast(palettes.get(pair[1])[mode], palettes.get(pair[2])[mode]).toFixed(1), ratios[mode], `${pair[1]}/${pair[2]} ${mode}`);
    checked++;
  }
  assert.equal(checked, 7);
});
