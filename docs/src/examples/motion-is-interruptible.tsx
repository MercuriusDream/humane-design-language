import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { morphDuration } from 'humane-system';
import './shared-demos.css';
import './motion-is-interruptible.css';

const ITEMS = [
  {
    id: 'walk',
    title: 'Morning walk',
    meta: '14 photos',
    body: 'Fog over the river until nine. The bridge lights were still on when the first rowers went out.',
  },
  {
    id: 'studio',
    title: 'Studio session',
    meta: '36 photos',
    body: 'Two rolls on the old camera, one on the new. Window light only. The north wall works best after three.',
  },
  {
    id: 'harbor',
    title: 'Harbor at dusk',
    meta: '9 photos',
    body: 'Long exposures from the breakwater. The ferry crossed twice and left two lines of light on the water. The second pass was slower, so its line is brighter.',
  },
  {
    id: 'kitchen',
    title: 'Kitchen notes',
    meta: '5 photos',
    body: 'Bread, third attempt.',
  },
];

export default function MorphList() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Example hint="Open a row, then click it again before it finishes. It reverses from where it is. Short rows open faster than long ones.">
      <ul className="morph-list ex-motion-is-interruptible-list">
        {ITEMS.map((item) => (
          <MorphRow
            key={item.id}
            item={item}
            open={open === item.id}
            onToggle={() => setOpen((current) => (current === item.id ? null : item.id))}
          />
        ))}
      </ul>
    </Example>
  );
}

type RowProps = {
  item: (typeof ITEMS)[number];
  open: boolean;
  onToggle: () => void;
};

function MorphRow({ item, open, onToggle }: RowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => setHeight(content.offsetHeight));
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const duration = morphDuration(height);
  const bodyId = `morph-${item.id}`;

  return (
    <li className="morph-row" data-open={open} style={{ '--dur': `${duration}ms` } as CSSProperties}>
      <button type="button" className="morph-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className="morph-title">{item.title}</span>
        <span className="morph-meta">{item.meta}</span>
      </button>
      <div className="morph-body" id={bodyId} inert={!open}>
        <div className="morph-clip">
          <div className="morph-content" ref={contentRef}>
            <p>{item.body}</p>
            <p className="morph-timing">
              {height} px of change, {duration} ms
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
