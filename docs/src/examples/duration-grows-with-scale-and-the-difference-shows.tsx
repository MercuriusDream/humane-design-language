import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, morphDuration, usePreferences } from 'humane-system';
import { Example } from '../components/Example';
import './duration-grows-with-scale-and-the-difference-shows.css';

// Three changes of clearly different size. Each box's duration is morphDuration of its own change.
const STEPS = [
  { id: 'small', name: 'Small change', grow: 16 },
  { id: 'medium', name: 'Medium change', grow: 120 },
  { id: 'large', name: 'Large change', grow: 200 },
] as const;

const BASE = 40; // px, the box before it grows
const CURVE_MAX = 600; // px, the right edge of the curve
const CURVE_STEP = 10; // px between sampled points
const FLOOR_MS = morphDuration(0);
const CEILING_MS = morphDuration(1_000_000); // large sizes reach the ceiling

// The y labels start at x 0, the controls inset, so the plot begins after them.
const PLOT = { left: 56, right: 216, top: 12, bottom: 100 };
const px = (size: number) => PLOT.left + (size / CURVE_MAX) * (PLOT.right - PLOT.left);
const ms = (time: number) => PLOT.bottom - (time / CEILING_MS) * (PLOT.bottom - PLOT.top);

// The area under the curve is a plane, so the curve needs no stroke line.
const CURVE_PATH =
  Array.from({ length: CURVE_MAX / CURVE_STEP + 1 }, (_, i) => {
    const size = i * CURVE_STEP;
    return `${i === 0 ? 'M' : 'L'}${px(size).toFixed(1)} ${ms(morphDuration(size)).toFixed(1)}`;
  }).join(' ') +
  ` L${px(CURVE_MAX).toFixed(1)} ${PLOT.bottom} L${PLOT.left} ${PLOT.bottom} Z`;

/** Duration grows with the size of the change. Each box shows its own change, and its time is printed beside it. */
export default function DurationScale() {
  const { reducedMotion } = usePreferences();
  const [grown, setGrown] = useState(false);
  const rowsRef = useRef<HTMLUListElement>(null);
  const [available, setAvailable] = useState(240);
  const [changes, setChanges] = useState<Record<string, number>>({});
  const base = Math.min(BASE, available);
  const factor = Math.min(1, Math.max(0, available - base) / 200);
  const steps = STEPS.map((step) => ({ ...step, grow: Math.round(step.grow * factor) }));

  useLayoutEffect(() => {
    const rows = rowsRef.current;
    if (!rows) return;
    const measure = () => { setAvailable(rows.clientWidth); setChanges({}); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rows);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const boxes = rowsRef.current?.querySelectorAll<HTMLElement>('.ex-duration-grows-with-scale-and-the-difference-shows-box');
    setChanges(Object.fromEntries(steps.map((step, i) => [step.id, Math.round(Math.abs((grown ? base : base + step.grow) - (boxes?.[i].getBoundingClientRect().width ?? base)))])));
    setGrown((on) => !on);
  };

  return (
    <Example
      hint="Press Grow. Each box grows by a different amount, and each change takes the time printed beside it."
      controls={
        <div className="ex-duration-grows-with-scale-and-the-difference-shows-stack">
          <Button size="compact" onClick={toggle}>
            {grown ? 'Reset' : 'Grow'}
          </Button>
          <svg
            className="ex-duration-grows-with-scale-and-the-difference-shows-curve"
            viewBox="0 0 220 124"
            role="img"
            aria-label={`Duration rises with the size of the change, from ${FLOOR_MS} milliseconds at 0 pixels up to a ceiling of ${CEILING_MS} milliseconds.`}
          >
            <path className="ex-duration-grows-with-scale-and-the-difference-shows-curve-area" d={CURVE_PATH} />
            {steps.map((step) => (
              <circle
                key={step.id}
                className="ex-duration-grows-with-scale-and-the-difference-shows-curve-dot"
                cx={px(step.grow)}
                cy={ms(morphDuration(step.grow))}
                r="3"
              />
            ))}
            <text className="ex-duration-grows-with-scale-and-the-difference-shows-curve-label" x={0} y={PLOT.top + 4}>
              {CEILING_MS} ms
            </text>
            <text className="ex-duration-grows-with-scale-and-the-difference-shows-curve-label" x={0} y={PLOT.bottom}>
              {FLOOR_MS} ms
            </text>
            <text className="ex-duration-grows-with-scale-and-the-difference-shows-curve-label" x={PLOT.left} y={PLOT.bottom + 18}>
              0 px
            </text>
            <text className="ex-duration-grows-with-scale-and-the-difference-shows-curve-label" x={PLOT.right} y={PLOT.bottom + 18} textAnchor="end">
              {CURVE_MAX} px
            </text>
          </svg>
        </div>
      }
    >
      <ul ref={rowsRef} className="ex-duration-grows-with-scale-and-the-difference-shows-rows">
        {steps.map((step) => {
          const change = changes[step.id] ?? step.grow;
          const duration = morphDuration(change);
          return (
            <li key={step.id} className="ex-duration-grows-with-scale-and-the-difference-shows-row">
              <p className="ex-duration-grows-with-scale-and-the-difference-shows-readout">
                <span className="ex-duration-grows-with-scale-and-the-difference-shows-name">{step.name}</span>
                <span className="ex-duration-grows-with-scale-and-the-difference-shows-value">
                  {change} px, {duration} ms
                </span>
              </p>
              <div className="ex-duration-grows-with-scale-and-the-difference-shows-track" data-reduced={reducedMotion || undefined}>
                <div
                  className="ex-duration-grows-with-scale-and-the-difference-shows-box"
                  data-grown={grown}
                  style={
                    {
                      '--grow': `${step.grow}px`,
                      '--base': `${base}px`,
                      '--dur': `${duration}ms`,
                    } as CSSProperties
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="visually-hidden" aria-live="polite">
        {grown ? 'Boxes grown.' : 'Boxes reset.'}
      </p>
    </Example>
  );
}
