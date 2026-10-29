import { Example } from '../components/Example';
import { usePreferences } from 'humane-system';
import './shared-demos.css';

const MESSAGES = [
  { id: 'a', from: 'Mina', subject: 'Prints are ready', time: '9:12', unread: true },
  { id: 'b', from: 'Backup', subject: 'Last backup failed. Reconnect the drive.', time: '8:40', unread: true, error: true },
  { id: 'c', from: 'Joon', subject: 'Lease draft, second pass', time: 'Yesterday', unread: false },
  { id: 'd', from: 'Library', subject: 'Two books due Friday', time: 'Mon', unread: false },
];

/** One saturated element in the region: the failure. Read and unread differ by lightness and weight alone. */
export default function SignalDemo() {
  const { grayscale, setGrayscale } = usePreferences();
  return (
    <Example
      hint="Run the grayscale test. The order of importance must not change."
      controls={
        <button type="button" className="h-button" data-size="compact" aria-pressed={grayscale} onClick={() => setGrayscale(!grayscale)}>
          {grayscale ? 'End grayscale test' : 'Run grayscale test'}
        </button>
      }
    >
      <ul className="inbox" aria-label="Messages">
        {MESSAGES.map((m) => (
          <li key={m.id} className="inbox-row" data-unread={m.unread} data-error={m.error ?? false}>
            <span className="inbox-from">{m.from}</span>
            <span className="inbox-subject">{m.subject}</span>
            <span className="inbox-time">{m.time}</span>
          </li>
        ))}
      </ul>
    </Example>
  );
}
