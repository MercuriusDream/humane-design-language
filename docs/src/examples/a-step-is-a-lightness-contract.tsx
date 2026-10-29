import { useState } from 'react';
import { Example } from '../components/Example';
import { Switch, colorContrast } from 'humane-system';
import './a-step-is-a-lightness-contract.css';

const HUES = [
  { name: 'Blue', hue: 255 },
  { name: 'Red', hue: 27 },
  { name: 'Green', hue: 150 },
  { name: 'Amber', hue: 75 },
];

// Chroma is chosen per step so every swatch stays inside sRGB. Out of gamut, the browser
// clips the color and its lightness drifts from the step it is supposed to name.
const STEPS = [
  { step: 1, lightness: 0.95, chroma: 0.015 },
  { step: 2, lightness: 0.75, chroma: 0.08 },
  { step: 3, lightness: 0.55, chroma: 0.1 },
  { step: 4, lightness: 0.35, chroma: 0.05 },
];

/** Equal perceptual lightness across hues; actual contrast is checked per color, not inferred from the step. */
export default function StepIsLightnessContract() {
  const [grayscale, setGrayscale] = useState(false);

  return (
    <Example
      hint="Each row shares a perceptual lightness. Ratios against white are checked per hue: the same step does not guarantee the same contrast."
      controls={<Switch size="compact" label="Grayscale" checked={grayscale} onChange={setGrayscale} />}
    >
      <div className="ex-a-step-is-a-lightness-contract-fit">
        <table
          className="ex-a-step-is-a-lightness-contract-table"
          aria-label="Lightness of each step across four hues, with contrast on white"
          data-grayscale={grayscale || undefined}
        >
          <thead>
            <tr>
              <th scope="col" className="ex-a-step-is-a-lightness-contract-step-head">
                Step
              </th>
              {HUES.map(({ name }) => (
                <th scope="col" key={name} className="ex-a-step-is-a-lightness-contract-hue-head">
                  <span className="ex-a-step-is-a-lightness-contract-hue-name">{name}</span>
                  <span className="ex-a-step-is-a-lightness-contract-hue-initial" aria-hidden="true">
                    {name[0]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STEPS.map(({ step, lightness, chroma }) => (
              <tr key={step}>
                <th scope="row" className="ex-a-step-is-a-lightness-contract-step">
                  <span className="ex-a-step-is-a-lightness-contract-step-name">{step}</span>
                  <span className="ex-a-step-is-a-lightness-contract-step-value">L {lightness.toFixed(3)}</span>
                </th>
                {HUES.map(({ name, hue }) => (
                  <td key={name}>
                    <span
                      className="ex-a-step-is-a-lightness-contract-swatch"
                      role="img"
                      aria-label={`${name}, step ${step}, lightness ${lightness.toFixed(3)}`}
                      style={{
                        background: `oklch(${lightness} ${chroma} ${hue})`,
                      }}
                    />
                    <span className="ex-a-step-is-a-lightness-contract-ratio">
                      {colorContrast(`oklch(${lightness} ${chroma} ${hue})`, 'rgb(255 255 255)')?.toFixed(1)}:1
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Example>
  );
}
