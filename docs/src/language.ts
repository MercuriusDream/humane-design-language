// The docs read the language straight from LANGUAGE.md, so the page can never drift from it.
import readme from '../../LANGUAGE.md?raw';

export type Rule = {
  slug: string;
  name: string;
  /** Paragraph text without the trailing premise citation. */
  text: string;
  /** Bullet points that follow the rule, if any. */
  points: string[];
  /** Premises the rule cites. Empty for premises themselves and for signature choices. */
  from: string[];
};

export type Group = {
  id: string;
  title: string;
  lead?: string;
  rules: Rule[];
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Turn inline markdown emphasis into plain text; the page styles names itself. */
function plain(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\\\*/g, '*').trim();
}

function parseRule(paragraph: string, points: string[]): Rule | null {
  const match = paragraph.match(/^\*\*(.+?)\.?\*\*\s*([\s\S]*)$/);
  if (!match) return null;
  const name = match[1].replace(/\.$/, '');
  let body = match[2].trim();
  let from: string[] = [];
  const cite = body.match(/\*\(([^)]+)\)\*\s*$/);
  if (cite) {
    from = cite[1]
      .split('.')
      .map((s) => s.trim())
      .filter(Boolean);
    body = body.slice(0, cite.index).trim();
  }
  return { slug: slugify(name), name, text: plain(body), points: points.map(plain), from };
}

/** Split a markdown block into paragraphs, attaching bullet lists to the paragraph before them. */
function rulesIn(block: string): { rules: Rule[]; lead?: string } {
  const rules: Rule[] = [];
  let lead: string | undefined;
  const chunks = block.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.startsWith('- ')) {
      const last = rules[rules.length - 1];
      if (last) last.points.push(...chunk.split('\n').map((l) => plain(l.replace(/^-\s*/, ''))));
      continue;
    }
    const rule = parseRule(chunk, []);
    if (rule) rules.push(rule);
    else if (!rules.length && !chunk.startsWith('|') && !chunk.startsWith('#')) lead = plain(chunk);
  }
  return { rules, lead };
}

function section(markdown: string, heading: RegExp): string {
  const start = markdown.search(heading);
  if (start < 0) return '';
  const rest = markdown.slice(start).replace(heading, '');
  const next = rest.search(/\n#{2,3} /);
  return next < 0 ? rest : rest.slice(0, next);
}

const GROUPS: [string, string, RegExp][] = [
  ['premises', 'Premises', /^## Premises\n/m],
  ['space', 'Space', /^### Space\n/m],
  ['color', 'Color', /^### Color\n/m],
  ['type', 'Type', /^### Type\n/m],
  ['motion', 'Time and motion', /^### Time and Motion\n/m],
  ['agency', 'Agency', /^### Agency\n/m],
  ['communication', 'Communication', /^### Communication\n/m],
  ['signature', 'Signature', /^## Signature\n/m],
];

export const LANGUAGE: Group[] = GROUPS.map(([id, title, heading]) => ({ id, title, ...rulesIn(section(readme, heading)) }));

export const INTENT: { lead: string; points: string[] } = (() => {
  const block = section(readme, /^## Intent\n/m);
  const chunks = block.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const list = chunks.find((c) => c.startsWith('- '));
  return {
    lead: plain(chunks[0] ?? ''),
    points: list ? list.split('\n').map((l) => plain(l.replace(/^-\s*/, ''))) : [],
  };
})();

export const CONFORMANCE: { name: string; condition: string }[] = section(readme, /^## Conformance Tests\n/m)
  .split('\n')
  .filter((line) => line.startsWith('|') && !line.includes('---'))
  .slice(1)
  .map((line) => line.split('|').map((cell) => cell.trim()))
  .map((cells) => ({ name: cells[1], condition: cells[2] }));

export const ALL_RULES: Rule[] = LANGUAGE.flatMap((group) => group.rules);
