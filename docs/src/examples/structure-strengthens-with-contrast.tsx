import { useState } from 'react';
import { Example } from '../components/Example';
import { Button, Checkbox, Segmented, TextField } from 'humane-system';
import './structure-strengthens-with-contrast.css';

type Contrast = 'standard' | 'high';

const CONTRAST_OPTIONS: { value: Contrast; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

/** Under high contrast, the stroke token doubles and the focus width grows. Both are set on the stage, so every field, checkbox, and button inside it follows. */
export default function StructureStrengthensWithContrast() {
  const [contrast, setContrast] = useState<Contrast>('standard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weekly, setWeekly] = useState(false);

  return (
    <Example
      hint="Switch contrast, then Tab into the form. The checkbox boundary, the strokes, and the focus ring all thicken, not only darken."
      controls={<Segmented size="compact" label="Contrast" options={CONTRAST_OPTIONS} value={contrast} onChange={setContrast} />}
    >
      <form
        className="ex-structure-strengthens-with-contrast-stage"
        data-contrast={contrast}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="ex-structure-strengthens-with-contrast-fields">
          <TextField label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" depth={2} autoComplete="name" />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            depth={2}
            autoComplete="email"
          />
        </div>
        <div className="ex-structure-strengthens-with-contrast-actions">
          <Checkbox label="Send a weekly summary" checked={weekly} onChange={setWeekly} />
          <Button type="submit" depth={2}>
            Save
          </Button>
        </div>
      </form>
    </Example>
  );
}
