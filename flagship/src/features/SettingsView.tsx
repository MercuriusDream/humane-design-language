import { Disclosure, Operator, PreferenceControls, RadioGroup, Switch, TextField } from 'humane-system';
import { ME } from '../data';
import { useMail } from '../store';
import type { Notify } from '../mail-storage';
import './settings-view.css';

const NOTIFY_OPTIONS: { value: Notify; label: string; hint?: string }[] = [
  { value: 'every', label: 'Every letter' },
  { value: 'people', label: 'Only people I have written to' },
  { value: 'none', label: 'None' },
];

/**
 * The Settings mailbox. Groups are separated by space, and each setting saves as it changes, with no confirmation step.
 * One tier for the page: every control is compact, the tier PreferenceControls always takes, so the radio rows, the
 * signature field, the disclosure, and both switches share its heights and text size.
 */
export function SettingsView() {
  const { state, dispatch } = useMail();
  const { notify, signature } = state.settings;

  return (
    <div className="settings-view">
      {/* The title sits in a row of the control height, as each mailbox title sits beside Write, so it stays
          level with them when the view changes. */}
      <header className="settings-view-header">
        <h1 className="settings-view-title">Settings</h1>
      </header>

      <section className="settings-view-group" aria-labelledby="settings-display">
        <h2 id="settings-display" className="settings-view-heading">
          Display
        </h2>
        <PreferenceControls />
      </section>

      <section className="settings-view-group" aria-labelledby="settings-notifications">
        <h2 id="settings-notifications" className="settings-view-heading">
          Notifications
        </h2>
        <RadioGroup
          size="compact"
          label="Announce new letters to screen readers"
          name="notifications"
          options={NOTIFY_OPTIONS}
          value={notify}
          onChange={notify => dispatch({ type: 'setSettings', settings: { notify } })}
        />
      </section>

      <section className="settings-view-group" aria-labelledby="settings-writing">
        <h2 id="settings-writing" className="settings-view-heading">
          Writing
        </h2>
        <TextField
          size="compact"
          label="Signature"
          multiline
          rows={3}
          value={signature}
          onChange={signature => dispatch({ type: 'setSettings', settings: { signature } })}
          hint="Added once when you start a new letter or reply. Existing drafts are unchanged."
        />
      </section>

      <section className="settings-view-group" aria-labelledby="settings-account">
        <h2 id="settings-account" className="settings-view-heading">
          Account
        </h2>
        <Operator operator="Humane Post" detail={`Demo account: ${ME.address}`} />
        <Disclosure size="compact" title="Data this app keeps">
          <ul className="settings-view-list">
            <li>Letters you have received and sent, including archived ones.</li>
            <li>Drafts you have not sent yet, pending outgoing letters, your signature, and in-app announcement preferences.</li>
            <li>Your display preferences: theme, contrast, sidebar side, and reduced motion. They stay in this browser.</li>
          </ul>
        </Disclosure>
      </section>

      <section className="settings-view-group" aria-labelledby="settings-try">
        <h2 id="settings-try" className="settings-view-heading">
          Try it
        </h2>
        <Switch
          size="compact"
          label="Fail the next send"
          checked={state.failNextSend}
          onChange={(on) => dispatch({ type: 'setFailNextSend', on })}
        />
      </section>
    </div>
  );
}
