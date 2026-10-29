import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Segmented, morphDuration } from 'humane-system';
import './type-hierarchy-comes-from-size-and-weight-first.css';

type Mode = 'color' | 'size';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Size, weight' },
];

// The title drops from 1.5rem to 1.0625rem between the modes: 24px to 17px at a 16px root.
const TITLE_SHRINK_PX = 7;

/** Hierarchy comes from size and weight first. Color is the tool only when those are not enough. */
export default function TypeHierarchyExample() {
  const [mode, setMode] = useState<Mode>('color');
  return (
    <Example
      hint="Switch between the two. The words and their order stay the same. Only the tools that build the hierarchy change."
      controls={<Segmented size="compact" label="Build hierarchy with" options={OPTIONS} value={mode} onChange={setMode} />}
    >
      <article
        className="ex-type-hierarchy-comes-from-size-and-weight-first-article"
        data-mode={mode}
        style={{ '--dur': `${morphDuration(TITLE_SHRINK_PX)}ms` } as CSSProperties}
      >
        <h3 className="ex-type-hierarchy-comes-from-size-and-weight-first-title">Early boats at the harbor</h3>
        <p className="ex-type-hierarchy-comes-from-size-and-weight-first-byline">Mira Solberg, 6 min read</p>
        <p className="ex-type-hierarchy-comes-from-size-and-weight-first-body">
          The harbor is quiet before seven. Fishing boats leave in a line, and the gulls follow the first one out. By
          nine the market has its tables up, and the tide has turned.
        </p>
      </article>
    </Example>
  );
}
