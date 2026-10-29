import { useRef, useState, type FormEvent } from 'react';
import { Example } from '../components/Example';
import { Button, Notice, TextField } from 'humane-system';
import './words-are-for-intent-commands-and-errors.css';

/** Returns an error in words: what happened, then what to do next. Null when the address is usable. */
function check(raw: string): string | null {
  const address = raw.trim();
  if (!address) return 'Enter an address, such as name@example.com.';

  const at = address.indexOf('@');
  if (at === -1) return 'This address has no @. Add the part after @, such as example.com.';

  const local = address.slice(0, at);
  const domain = address.slice(at + 1);
  if (domain.includes('@')) return 'This address has more than one @. Keep only the one between the name and the domain.';
  if (!local) return 'This address has nothing before @. Add the name, such as ana.';
  if (!domain) return 'This address has nothing after @. Add the domain, such as example.com.';
  if (!domain.includes('.')) return 'This domain has no ending. Add it, such as .com.';
  return null;
}

/** An address form whose errors are stated in words. The error appears on submit and then follows each edit. */
export default function AddressErrors() {
  const [value, setValue] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const error = attempted ? check(value) : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const address = value.trim();
    if (check(address) === null) setSent(address);
  };

  // The "Use another address" button unmounts on reset, so focus moves to the field the user is returning to.
  const reset = () => {
    setValue('');
    setAttempted(false);
    setSent(null);
    formRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
  };

  return (
    <Example hint="Submit an address with a mistake to see what is wrong and how to fix it.">
      <form ref={formRef} className="ex-words-are-for-intent-commands-and-errors-form" onSubmit={submit} noValidate>
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={value}
          onChange={(next) => {
            setValue(next);
            setSent(null);
          }}
          error={error ?? undefined}
          placeholder="name@example.com"
        />
        <div className="ex-words-are-for-intent-commands-and-errors-actions">
          <Button type="submit" variant="strong">
            Send link
          </Button>
        </div>
        {sent && (
          <Notice
            title={`Link sent to ${sent}.`}
            action={
              <Button type="button" variant="quiet" depth={2} onClick={reset}>
                Use another address
              </Button>
            }
          >
            Open it on this device within 15 minutes to finish signing in.
          </Notice>
        )}
      </form>
    </Example>
  );
}
