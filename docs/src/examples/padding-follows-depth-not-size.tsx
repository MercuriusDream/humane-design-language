import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch, morphDuration, usePreferences } from 'humane-system';
import './shared-demos.css';
import './padding-follows-depth-not-size.css';

type Card = { id: string; title: string; meta: string; body: string };

/** Two siblings at depth 1 at different widths. The stylesheet shares the row between them, three parts to two. */
const CARDS: Card[] = [
  {
    id: 'harbor',
    title: 'Harbor at dusk',
    meta: '9 photos',
    body: 'Long exposures from the breakwater. The ferry crossed twice and left two lines of light on the water.',
  },
  {
    id: 'kitchen',
    title: 'Kitchen notes',
    meta: '5 photos',
    body: 'Bread, third attempt.',
  },
];

/** The padding a size-based scale would give. This is the approach the rule rejects. */
const SIZE_RATIO = 0.08;

type Readout = { inset: number[]; width: number[] };

const EMPTY: Readout = { inset: [], width: [] };

/** Measures what the browser resolved, so the readout cannot drift from the layout. */
export default function PaddingFollowsDepthNotSize() {
  const { reducedMotion } = usePreferences();
  const [bySize, setBySize] = useState(false);
  const [readout, setReadout] = useState<Readout>(EMPTY);
  const stage = useRef<HTMLDivElement>(null);

  // bySize is a dependency so the measurement reruns when the padding rule changes.
  // ResizeObserver then follows the padding morph frame by frame, so the readout ends on the resolved value.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const cards = () => Array.from(el.querySelectorAll<HTMLElement>('.ex-padding-follows-depth-not-size-card'));
    const update = () => {
      const list = cards();
      setReadout({
        width: list.map((card) => card.offsetWidth),
        inset: list.map((card) => {
          const title = card.querySelector<HTMLElement>('.ex-padding-follows-depth-not-size-title');
          if (!title) return 0;
          return Math.round(title.getBoundingClientRect().left - card.getBoundingClientRect().left);
        }),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    cards().forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [bySize]);

  const [large, small] = readout.inset;
  const aligned = large !== undefined && large === small;

  return (
    <Example
      hint="Both cards are depth 1, so their headings share one inset. Turn on size-based padding to see the headings drift apart."
      controls={
        <>
          <Switch size="compact" label="Pad by size instead" checked={bySize} onChange={setBySize} />
          <dl className="readout" aria-live="polite">
            <div>
              <dt>Inset, large card</dt>
              <dd>{large !== undefined ? `${large} px` : ''}</dd>
            </div>
            <div>
              <dt>Inset, small card</dt>
              <dd>{small !== undefined ? `${small} px` : ''}</dd>
            </div>
            <div>
              <dt>Headings</dt>
              <dd>{large !== undefined ? (aligned ? 'Aligned' : 'Not aligned') : ''}</dd>
            </div>
          </dl>
        </>
      }
    >
      <div className="ex-padding-follows-depth-not-size-stage" ref={stage}>
        {CARDS.map((card, i) => {
          // The size rule pads by the card's measured width. The padding it writes is the size of the change,
          // so it sets the morph duration.
          const padBySize = Math.round((readout.width[i] ?? 0) * SIZE_RATIO);
          const duration = reducedMotion ? 0 : morphDuration(padBySize);
          return (
            <Surface
              key={card.id}
              as="article"
              depth={1}
              className="ex-padding-follows-depth-not-size-card"
              style={{
                '--dur': `${duration}ms`,
                ...(bySize ? { padding: padBySize } : {}),
              } as CSSProperties}
            >
              <h4 className="ex-padding-follows-depth-not-size-title">{card.title}</h4>
              <p className="ex-padding-follows-depth-not-size-meta">{card.meta}</p>
              <p className="ex-padding-follows-depth-not-size-body">{card.body}</p>
            </Surface>
          );
        })}
      </div>
    </Example>
  );
}
