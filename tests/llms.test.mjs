import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { LLM_DOCS } from '../llms.manifest.mjs';

const root = resolve(import.meta.dirname, '..');
const index = readFileSync(resolve(root, 'public/llms.txt'), 'utf8');
const site = 'https://humane.mercuriusdream.com';

test('the LLM index links every canonical document exactly once', () => {
  assert.equal(new Set(LLM_DOCS).size, LLM_DOCS.length);
  assert.ok(index.startsWith('# Humane Design Language\n\n> '));
  for (const source of LLM_DOCS) {
    assert.ok(existsSync(resolve(root, source)), source);
    const link = `${site}/llms/${source}`;
    assert.equal(index.split(link).length - 1, 1, `${source} must have one index link`);
  }
});

test('published Markdown keeps relative document links inside the mirrored set', () => {
  for (const source of LLM_DOCS.filter((path) => path.endsWith('.md'))) {
    const markdown = readFileSync(resolve(root, source), 'utf8');
    for (const match of markdown.matchAll(/\]\(([^)]+)\)/g)) {
      const destination = match[1].split('#')[0];
      if (!destination || /^(?:[a-z]+:)?\/\//i.test(destination) || destination.startsWith('/') || destination.startsWith('mailto:')) continue;
      if (!destination.endsWith('.md') && !destination.endsWith('LICENSE')) continue;
      const target = resolve(dirname(resolve(root, source)), destination).slice(root.length + 1);
      assert.ok(LLM_DOCS.includes(target), `${source} links unpublished document ${target}`);
    }
  }
});

test('canonical Markdown is generated rather than duplicated in public assets', () => {
  for (const source of LLM_DOCS) assert.equal(existsSync(resolve(root, 'public/llms', source)), false, source);
});
