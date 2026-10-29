import { Example } from '../components/Example';
import './shared-demos.css';
import './levels-are-far-apart.css';

const LEVELS = [
  { token: '--text-display', spec: '48, weight 700', sample: 'Humane Design Language' },
  { token: '--text-title', spec: '34, weight 700', sample: 'Space' },
  { token: '--text-heading', spec: '24, weight 600', sample: 'Divide with planes' },
  { token: '--text-lead', spec: '20, weight 400', sample: 'Whitespace is syntax, and every gap means something.' },
  { token: '--text-body', spec: '17, weight 400', sample: 'Separate regions with surfaces of different lightness, not with lines.' },
  { token: '--text-small', spec: '14, weight 400', sample: '12 pages, edited yesterday' },
  { token: '--text-label', spec: '14, weight 600', sample: 'Repositories' },
];

/* Each sample is set in its own token on purpose: this list is the printed scale. Adjacent levels are about 1.41 apart. */
export default function TypeScale() {
  return (
    <Example>
      <ul className="type-scale ex-levels-are-far-apart-scale">
        {LEVELS.map(({ token, spec, sample }) => (
          <li key={token} className="type-level">
            <span className="type-spec">
              <code>{token}</code>
              <span>{spec}</span>
            </span>
            <span className="type-sample" style={{ font: `var(${token})` }}>
              {sample}
            </span>
          </li>
        ))}
      </ul>
    </Example>
  );
}
