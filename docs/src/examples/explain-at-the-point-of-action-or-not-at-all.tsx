import { useState, type FormEvent } from 'react';
import { Example } from '../components/Example';
import { Button, Select, TextField } from 'humane-system';
import './explain-at-the-point-of-action-or-not-at-all.css';

const P = 'ex-explain-at-the-point-of-action-or-not-at-all';

type Access = 'anyone' | 'invited';

const ACCESS_OPTIONS: { value: Access; label: string }[] = [
  { value: 'anyone', label: 'Anyone with the link' },
  { value: 'invited', label: 'Invited people only' },
];

type Errors = { name?: string; expiry?: string };

/** Every hint sits beside its label. Nothing explains the form below it. Serves: Explain at the point of action. */
export default function ShareLinkForm() {
  const [name, setName] = useState('');
  const [access, setAccess] = useState<Access>('anyone');
  const [expiry, setExpiry] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [created, setCreated] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (created) {
      setName('');
      setAccess('anyone');
      setExpiry('');
      setCreated(false);
      return;
    }
    const next: Errors = {};
    if (!name.trim()) next.name = 'Enter a name for the link.';
    if (expiry.trim() && !/^\d+$/.test(expiry.trim())) next.expiry = 'Enter a whole number of days, or leave this empty.';
    setErrors(next);
    setCreated(!next.name && !next.expiry);
  };

  return (
    <Example hint="Submit with the name empty to see the error beside its field.">
      <form className={`${P}-form`} data-created={created || undefined} onSubmit={submit} noValidate>
        <h3 className={`${P}-title`}>New share link</h3>

        <TextField
          label="Link name"
          hint="Shown to people you send it to."
          placeholder="Harbor photos"
          value={name}
          error={errors.name}
          autoComplete="off"
          onChange={(value) => {
            setCreated(false);
            setErrors((e) => ({ ...e, name: undefined }));
            setName(value);
          }}
        />

        <Select
          label="Who can open it"
          hint="Invited people sign in before they open it."
          value={access}
          options={ACCESS_OPTIONS}
          onChange={(value) => {
            setCreated(false);
            setAccess(value);
          }}
        />

        <TextField
          label="Expires after"
          hint="Counted in days. Leave empty for no expiry."
          placeholder="30"
          value={expiry}
          error={errors.expiry}
          autoComplete="off"
          onChange={(value) => {
            setCreated(false);
            setErrors((e) => ({ ...e, expiry: undefined }));
            setExpiry(value);
          }}
        />

        <Button type="submit" variant="strong" className={`${P}-submit`}>
          {created ? 'Create another' : 'Create link'}
        </Button>

        <p className="visually-hidden" role="status">
          {created ? 'Link created.' : ''}
        </p>
      </form>
    </Example>
  );
}
