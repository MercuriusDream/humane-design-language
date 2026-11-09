// Canonical Markdown published under /llms/ by the root Vite build. Preserve repository paths so relative links keep working.
import { statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const LLM_DOCS = [
  'LANGUAGE.md',
  'AGENT-MAP.md',
  'AGENTS.md',
  'README.md',
  'system/README.md',
  'system/CONVENTIONS.md',
  'tests/README.md',
  'AUDIT.md',
  'DEPLOY.md',
  'REFERENCES.md',
  'LICENSE',
];

export const SITE = 'https://humane.mercuriusdream.com';
export const REPO = 'https://github.com/MercuriusDream/humane-design-language';

const root = import.meta.dirname;

const normalize = (path) => {
  const parts = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
};

// Canonical docs link repo-relative. Published under /llms/ or bundled into llms-full.txt, a link
// outside the mirrored set would 404, so emitted copies retarget them: mirrored documents go to the
// site, everything else to the repository's blob (or tree) view on main.
export function rewriteLlmsLinks(markdown, source) {
  return markdown.replace(/\]\(([^)]+)\)/g, (whole, destination) => {
    if (/^(?:[a-z]+:)?\/\//i.test(destination) || destination.startsWith('#') || destination.startsWith('mailto:')) return whole;
    const [pathname, hash] = destination.split('#', 2);
    const target = normalize(`${dirname(source)}/${pathname}`);
    const suffix = hash ? `#${hash}` : '';
    if (LLM_DOCS.includes(target)) return `](${SITE}/llms/${target}${suffix})`;
    const kind = statSync(resolve(root, target), { throwIfNoEntry: false })?.isDirectory() ? 'tree' : 'blob';
    return `](${REPO}/${kind}/main/${target}${suffix})`;
  });
}
