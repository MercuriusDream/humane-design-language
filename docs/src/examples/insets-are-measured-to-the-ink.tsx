import { useLayoutEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import { Segmented } from 'humane-system';
import './insets-are-measured-to-the-ink.css';

const P = 'ex-insets-are-measured-to-the-ink';

type Mode = 'line' | 'ink';

const MODES: { value: Mode; label: string }[] = [
  { value: 'line', label: 'Line box' },
  { value: 'ink', label: 'Ink' },
];

/** The ink box inside the card, and the space from each card edge to it. */
type Ink = { top: number; bottom: number; side: number; box: { top: number; left: number; width: number; height: number } };

const canvas = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');

/** Cap top and baseline of one line rect, from the font's own metrics, so the reading is the letters and not the line box. */
function inkOfLine(el: Element, rect: DOMRect) {
  if (!canvas) return null;
  canvas.font = getComputedStyle(el).font;
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = canvas.measureText('Hg');
  const cap = canvas.measureText('H').actualBoundingBoxAscent;
  const baseline = rect.top + (rect.height - (ascent + descent)) / 2 + ascent;
  return { capTop: baseline - cap, baseline };
}

/** Reads what the browser laid out, so the numbers follow the CSS in either mode. */
function measure(card: HTMLElement): Ink | null {
  const first = card.querySelector(`.${P}-title`);
  const last = card.querySelector(`.${P}-body`);
  if (!first?.firstChild || !last?.lastChild) return null;
  const range = document.createRange();
  range.selectNodeContents(first.firstChild);
  const firstLine = range.getClientRects()[0];
  range.selectNodeContents(last.lastChild);
  const lines = range.getClientRects();
  const lastLine = lines[lines.length - 1];
  if (!firstLine || !lastLine) return null;
  const top = inkOfLine(first, firstLine);
  const bottom = inkOfLine(last, lastLine);
  if (!top || !bottom) return null;

  const r = card.getBoundingClientRect();
  const side = parseFloat(getComputedStyle(card).paddingLeft);
  return {
    top: top.capTop - r.top,
    bottom: r.bottom - bottom.baseline,
    side,
    box: { top: top.capTop - r.top, left: side, width: r.width - 2 * side, height: bottom.baseline - top.capTop },
  };
}

/** One card, one padding. Only where the text box ends changes: at the line box, or at the letters. */
export default function InsetsAreMeasuredToTheInk() {
  const [mode, setMode] = useState<Mode>('line');
  const card = useRef<HTMLElement>(null);
  const [ink, setInk] = useState<Ink | null>(null);

  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const update = () => setInk(measure(el));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <Example
      hint="The shaded box is the ink: from the cap height of the first line to the baseline of the last. Line box adds the leading above and below it. Ink makes all four insets equal."
      controls={<Segmented size="compact" label="Measure the inset to" options={MODES} value={mode} onChange={setMode} />}
    >
      {/* The readout reports on the card, so it sits under it. */}
      <div className={`${P}-stage`}>
        <article ref={card} className={`${P}-card`} data-mode={mode}>
          {ink && (
            <span
              className={`${P}-ink`}
              aria-hidden="true"
              style={{ top: ink.box.top, left: ink.box.left, width: ink.box.width, height: ink.box.height }}
            />
          )}
          <h4 className={`${P}-title`}>Ferry to the island</h4>
          <p className={`${P}-body`}>
            Pier two, every 40 minutes. The last boat returns at 19:15, so plan the walk back from the lighthouse.
          </p>
        </article>
        <dl className={`${P}-readout`} aria-live="polite">
          <div>
            <dt>Top</dt>
            <dd>{px(ink?.top)}</dd>
          </div>
          <div>
            <dt>Sides</dt>
            <dd>{px(ink?.side)}</dd>
          </div>
          <div>
            <dt>Bottom</dt>
            <dd>{px(ink?.bottom)}</dd>
          </div>
        </dl>
      </div>
    </Example>
  );
}

function px(value: number | undefined): string {
  return value === undefined ? '' : `${Math.round(value)} px`;
}
