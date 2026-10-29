import { useState } from 'react';
import { Button, TextField } from 'humane-system';
import { Example } from '../components/Example';
import './saturation-belongs-to-state.css';

const EMAIL_ERROR = 'Enter an email address like name@example.com.';

/**
 * Rule: saturation belongs to state. Only the invalid field takes the danger signal, and focus takes the focus
 * signal from the global ring. Every other element, including the button, stays neutral.
 */
export default function SaturationBelongsToState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [emailError, setEmailError] = useState(false);

  return (
    <Example
      hint="Turn on the email error. Only that field turns red. Focus is the one other saturated mark."
      controls={
        <Button size="compact" aria-pressed={emailError} onClick={() => setEmailError((on) => !on)}>
          Email error
        </Button>
      }
    >
      <div className="ex-saturation-belongs-to-state-form">
        <TextField label="Name" value={name} onChange={setName} autoComplete="name" depth={2} />
        <div className="ex-saturation-belongs-to-state-field" data-invalid={emailError || undefined}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            error={emailError ? EMAIL_ERROR : undefined}
            depth={2}
          />
        </div>
        <TextField
          label="Company"
          hint="Optional"
          value={company}
          onChange={setCompany}
          autoComplete="organization"
          depth={2}
        />
      </div>
    </Example>
  );
}
