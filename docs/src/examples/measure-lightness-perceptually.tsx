import { useEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import { colorContrast, oklchLightness, usePreferences } from 'humane-system';
import './shared-demos.css';

const PLANES = [
  { token: '--plane-sunken', name: 'Sunken' },
  { token: '--plane-base', name: 'Base' },
  { token: '--plane-raised', name: 'Raised' },
  { token: '--plane-control', name: 'Control' },
];
const INKS = [
  { token: '--ink-1', name: 'Essential text' },
  { token: '--ink-2', name: 'Supporting text' },
  { token: '--ink-3', name: 'Tertiary text' },
  { token: '--ink-boundary', name: 'Control boundary' },
];

/** Read perceptual lightness and actual-color contrast after each effective palette change. */
export default function LightnessSteps() {
  const { scheme, highContrast } = usePreferences();
  const ref = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<Record<string, string>>({});

  // The provider writes document preferences in its layout effect, after child layout effects.
  useEffect(() => {
    const read: Record<string, string> = {};
    ref.current?.querySelectorAll<HTMLElement>('[data-token]').forEach((swatch) => {
      read[swatch.dataset.token!] = getComputedStyle(swatch).backgroundColor;
    });
    setColors(read);
  }, [scheme, highContrast]);

  return (
    <Example>
      <div className="steps" ref={ref}>
        <StepGroup title="Planes" steps={PLANES} colors={colors} />
        <StepGroup title="Ink, with contrast on base" steps={INKS} colors={colors} base={colors['--plane-base']} />
      </div>
    </Example>
  );
}

type StepGroupProps = {
  title: string;
  steps: { token: string; name: string }[];
  colors: Record<string, string>;
  base?: string;
};

function StepGroup({ title, steps, colors, base }: StepGroupProps) {
  return (
    <div className="step-group">
      <h4 className="h-field-label">{title}</h4>
      <ul className="step-list">
        {steps.map(({ token, name }) => {
          const color = colors[token];
          const lightness = color ? oklchLightness(color) : null;
          const ratio = color && base ? colorContrast(color, base) : null;
          return (
            <li key={token} className="step">
              <span className="step-well"><span className="step-swatch" data-token={token} style={{ background: `var(${token})` }} /></span>
              <span className="step-text">
                <span className="step-name">{name}</span>
                <span className="step-value">
                  {lightness === null ? '' : `L ${lightness.toFixed(3)}`}
                  {ratio !== null && `, ${ratio.toFixed(1)}:1`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
