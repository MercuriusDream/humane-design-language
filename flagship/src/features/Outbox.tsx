import { useRef, useState } from 'react';
import { Button, Dialog, ProgressSurface } from 'humane-system';
import { MAIL_STORAGE_KEY } from '../mail-storage';
import { useMail } from '../store';
import './outbox.css';

/**
 * Outgoing letters and the state of browser storage. Below the working view it is a permanently reserved region,
 * so async outcomes never resize mail targets. At the foot of the letter's section (reserved false) it is there
 * only while something is going out or storage needs the user, and the letter above it keeps its place.
 */
export function Outbox({ reserved = true }: { reserved?: boolean }) {
  const { state, dispatch } = useMail();
  const region = useRef<HTMLElement>(null);
  const replaceButton = useRef<HTMLButtonElement>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const finish = (type: 'keepOutgoing' | 'dismissOutgoing', id: string) => {
    region.current?.focus({ preventScroll: true });
    dispatch({ type, id });
  };
  const replaceStored = () => {
    try {
      dispatch({ type: 'replaceStorage', snapshot: localStorage.getItem(MAIL_STORAGE_KEY) });
    } catch {
      dispatch({ type: 'storageResult', error: 'Browser storage is still unavailable. Your edits remain in memory. Enable storage, then retry saving.' });
    }
  };
  const exportStored = () => {
    try {
      const raw = localStorage.getItem(MAIL_STORAGE_KEY);
      if (raw === null) return;
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'letters-stored-backup.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      dispatch({ type: 'storageResult', error: 'Stored mail cannot be exported because browser storage is unavailable. Your session remains in memory.' });
    }
  };
  if (!reserved && state.outgoing.length === 0 && !state.storageError && !confirmReplace) return null;
  return (
    <section ref={region} className="outbox-region" data-root tabIndex={-1} aria-label="Outgoing letters and browser storage">
      <h2 className="outbox-heading">Outgoing letters</h2>
      <p role="status">{state.storageError || (state.storageSaved ? 'Mail and settings saved in this browser.' : 'Saving in this browser…')}</p>
      {/* Compact throughout, as the actions on each outgoing letter: one tier for the region. */}
      {state.storageError && <div className="outbox-actions">
        {state.storageBlocked && <Button size="compact" onClick={exportStored}>Export stored mail</Button>}
        <Button ref={replaceButton} size="compact" onClick={() => state.storageBlocked ? setConfirmReplace(true) : dispatch({ type: 'retryStorage' })}>{state.storageBlocked ? 'Replace stored mail with this session' : 'Retry saving'}</Button>
      </div>}
      {state.outgoing.length === 0 ? <p>No outgoing letters.</p> : <ul className="outbox" aria-label="Outgoing letters">
        {state.outgoing.map(o => <li key={o.id} className="outbox-item">
          <ProgressSurface value={o.progress} max={1} label={`${o.status === 'sent' ? 'Sent' : o.status === 'failed' ? 'Not sent' : 'Sending'} to ${o.to.map(p => p.name).join(', ')}`}>
            <p className="outbox-to">To {o.to.map(p => p.name).join(', ')}</p>
            <p className="outbox-subject">{o.subject}</p>
            <p>{o.status === 'sent' ? 'Sent' : o.status === 'failed' ? o.error : `${Math.round(o.progress * 100)}%`}</p>
            <div className="outbox-actions">
              {o.status === 'failed' && <Button size="compact" onClick={() => {
                region.current?.focus({ preventScroll: true });
                dispatch({ type: 'retry', id: o.id });
              }}>Try again</Button>}
              <Button size="compact" onClick={() => finish(o.status === 'sent' ? 'dismissOutgoing' : 'keepOutgoing', o.id)}>
                {o.status === 'sent' ? 'Dismiss sent letter' : o.status === 'sending' ? 'Cancel send and keep as draft' : 'Keep as draft'}
              </Button>
            </div>
          </ProgressSurface>
        </li>)}
      </ul>}
      <Dialog open={confirmReplace} onClose={() => setConfirmReplace(false)} origin={replaceButton.current} title="Replace stored mail?"
        actions={<>
          <Button onClick={() => setConfirmReplace(false)}>Keep stored mail</Button>
          <Button variant="danger" onClick={() => { setConfirmReplace(false); replaceStored(); }}>Replace stored mail</Button>
        </>}>
        <p>This replaces previously saved mail with the mail currently open in this tab. Export stored mail first if you need to keep it. This replacement cannot be undone.</p>
      </Dialog>
    </section>
  );
}
