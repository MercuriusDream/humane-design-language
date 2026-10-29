import { useLayoutEffect, useRef, useState, type Ref } from 'react';
import { Example } from '../components/Example';
import './padding-is-small-text-is-large.css';

const COPY =
  'The first ferry leaves at 7:40 and the last one returns at 19:15. Bring cash for the bike fare, because the card reader on the upper deck has been out since spring. Sit on the left for the lighthouse.';

type Measure = { padding: number; text: number; column: number };

/** Reads what the browser actually resolved, so the readout cannot drift from the CSS. */
function measure(card: HTMLElement | null): Measure | null {
  const body = card?.querySelector<HTMLElement>('.ex-padding-is-small-text-is-large-body');
  if (!card || !body) return null;
  const padding = parseFloat(getComputedStyle(card).paddingLeft);
  return {
    padding,
    text: parseFloat(getComputedStyle(body).fontSize),
    column: card.clientWidth - 2 * padding,
  };
}

/** Same card, same width, same copy. Only the padding and the text size differ. */
export default function PaddingIsSmallTextIsLarge() {
  const loose = useRef<HTMLElement>(null);
  const tight = useRef<HTMLElement>(null);
  const [looseM, setLooseM] = useState<Measure | null>(null);
  const [tightM, setTightM] = useState<Measure | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      setLooseM(measure(loose.current));
      setTightM(measure(tight.current));
    };
    update();
    const observer = new ResizeObserver(update);
    if (loose.current) observer.observe(loose.current);
    if (tight.current) observer.observe(tight.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Example
      hint="Same width, same copy. The card with less padding gives the room to the text, so its text is larger and its column is wider."
      controls={
        <dl className="ex-padding-is-small-text-is-large-readout">
          <dt>Padding, loose and tight</dt>
          <dd>{formatPair(looseM?.padding, tightM?.padding, 'px')}</dd>
          <dt>Text size</dt>
          <dd>{formatPair(looseM?.text, tightM?.text, 'px')}</dd>
          <dt>Text column</dt>
          <dd>{formatPair(looseM?.column, tightM?.column, 'px')}</dd>
        </dl>
      }
    >
      <div className="ex-padding-is-small-text-is-large-row">
        <Card ref={loose} variant="loose" />
        <Card ref={tight} variant="tight" />
      </div>
    </Example>
  );
}

type CardProps = {
  ref: Ref<HTMLElement>;
  variant: 'loose' | 'tight';
};

function Card({ ref, variant }: CardProps) {
  return (
    <article ref={ref} className="ex-padding-is-small-text-is-large-card" data-variant={variant}>
      <h4 className="ex-padding-is-small-text-is-large-title">Ferry to the island</h4>
      <p className="ex-padding-is-small-text-is-large-meta">Pier two, every 40 minutes</p>
      <p className="ex-padding-is-small-text-is-large-body">{COPY}</p>
    </article>
  );
}

function formatPair(loose: number | undefined, tight: number | undefined, unit: string): string {
  if (loose === undefined || tight === undefined) return '';
  return `${Math.round(loose)} ${unit} and ${Math.round(tight)} ${unit}`;
}
