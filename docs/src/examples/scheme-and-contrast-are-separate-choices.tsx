import { Button, Surface } from 'humane-system';
import { Example } from '../components/Example';
import './scheme-and-contrast-are-separate-choices.css';

type Cell = {
  id: string;
  label: string;
  scheme: 'light' | 'dark';
  contrast: 'standard' | 'high';
};

const CELLS: Cell[] = [
  { id: 'light-standard', label: 'Light, standard', scheme: 'light', contrast: 'standard' },
  { id: 'light-high', label: 'Light, high contrast', scheme: 'light', contrast: 'high' },
  { id: 'dark-standard', label: 'Dark, standard', scheme: 'dark', contrast: 'standard' },
  { id: 'dark-high', label: 'Dark, high contrast', scheme: 'dark', contrast: 'high' },
];

/**
 * Rule: scheme and contrast are separate choices. Each cell sets its own scheme and contrast
 * on its wrapper, so the same card is built and checked in all four combinations.
 */
export default function SchemeAndContrast() {
  return (
    <Example hint="Each cell sets its own scheme and contrast, so all four combinations show at once.">
      <ul className="ex-scheme-and-contrast-are-separate-choices-grid" aria-label="Four combinations of scheme and contrast">
        {CELLS.map((cell) => (
          <Surface
            key={cell.id}
            as="li"
            depth={0}
            plane="base"
            className="ex-scheme-and-contrast-are-separate-choices-cell"
            data-contrast={cell.contrast}
            style={{ colorScheme: cell.scheme }}
          >
            <p className="ex-scheme-and-contrast-are-separate-choices-label">{cell.label}</p>
            <div className="ex-scheme-and-contrast-are-separate-choices-card">
              <p className="ex-scheme-and-contrast-are-separate-choices-title">Harbor at dusk</p>
              <p className="ex-scheme-and-contrast-are-separate-choices-meta">9 photos</p>
              <Button depth={2} aria-label={`Open, ${cell.label}`}>
                Open
              </Button>
            </div>
          </Surface>
        ))}
      </ul>
    </Example>
  );
}
