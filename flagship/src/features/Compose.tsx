import { useEffect, useId, useRef, useState } from 'react';
import { Button, Dialog, TextField } from 'humane-system';
import { useCompose } from '../compose';
import { parseRecipients, useMail, type Draft } from '../store';
import { validateRecipients } from '../mail-storage';
import './compose.css';

/** Every edit updates the same identified draft. Sending never runs a later autosave effect. */
export function Compose() {
  const { open, draft, origin, closeCompose } = useCompose();
  const { state, dispatch } = useMail();
  const formId = useId();
  const toId = `${formId}-to`;
  const subjectId = `${formId}-subject`;
  const bodyId = `${formId}-body`;
  const [fields, setFields] = useState(draft);
  const [seenDraft, setSeenDraft] = useState(draft);
  const [toError, setToError] = useState<string | null>(null);
  const sent = useRef(false);
  if (draft !== seenDraft) {
    setSeenDraft(draft);
    setFields(draft);
    setToError(null);
  }
  useEffect(() => {
    if (!open) return;
    sent.current = false;
    const firstEmpty = !draft.to.trim() ? toId : !draft.subject.trim() ? subjectId : bodyId;
    document.getElementById(firstEmpty)?.focus();
  }, [open, draft, toId, subjectId, bodyId]);

  const update = (part: Partial<Draft>) => {
    if (sent.current) return;
    const next = { ...fields, ...part };
    setFields(next);
    dispatch({ type: 'saveDraft', draft: next });
  };
  const close = () => {
    const exists = state.letters.some(letter => letter.id === fields.id);
    if (!sent.current && (exists || [fields.to, fields.subject, fields.body].some(text => text.trim()))) {
      dispatch({ type: 'saveDraft', draft: fields });
    }
    closeCompose();
  };
  const send = () => {
    if (sent.current) return;
    const error = validateRecipients(parseRecipients(fields.to));
    if (error) {
      setToError(error);
      document.getElementById(toId)?.focus();
      return;
    }
    sent.current = true;
    dispatch({ type: 'send', draft: { ...fields, subject: fields.subject.trim() || '(No subject)' } });
    closeCompose();
  };
  return (
    <Dialog open={open} onClose={close} title="Write a letter" origin={origin}
      actions={<Button className="compose-send" variant="strong" onClick={send}>
        <span className="compose-send-label">{fields.subject.trim() ? `Send "${fields.subject.trim()}"` : 'Send'}</span>
      </Button>}>
      <div className="compose-fields">
        <TextField id={toId} label="To" hint="Separate addresses with commas" value={fields.to}
          onChange={to => { update({ to }); setToError(null); }} error={toError ?? undefined} autoComplete="off" />
        <TextField id={subjectId} label="Subject" value={fields.subject} onChange={subject => update({ subject })} />
        <TextField id={bodyId} label="Letter" multiline rows={14} value={fields.body} onChange={body => update({ body })}
          hint={state.storageError || (state.storageSaved ? 'Edits saved in this browser' : 'Saving edits in this browser')}
        />
        <p className="visually-hidden" role="status">{state.storageError}</p>
      </div>
    </Dialog>
  );
}
