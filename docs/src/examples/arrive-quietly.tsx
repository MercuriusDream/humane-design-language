import { useCallback, useEffect, useRef, useState } from 'react';
import { Example } from '../components/Example';
import {
  Arrivals,
  Button,
  List,
  ListRow,
  Switch,
  TextField,
  defaultArrivalsLabel,
} from 'humane-system';
import './shared-demos.css';
import './arrive-quietly.css';

type Message = { id: number; from: string; text: string };

const START: Message[] = [
  { id: 1, from: 'Mira', text: 'Fog over the river until nine.' },
  { id: 2, from: 'Dev', text: 'Good light for the studio session.' },
];

const INCOMING: Omit<Message, 'id'>[] = [
  { from: 'Ana', text: 'Still on for the walk tomorrow?' },
  { from: 'Dev', text: 'Uploaded the new photos to the shared folder.' },
  { from: 'Mira', text: 'The bridge lights go off after midnight now.' },
  { from: 'Ana', text: 'Bringing the thermos.' },
  { from: 'Dev', text: 'Can you check the harbor set before Friday?' },
];

/** New messages wait in Arrivals. The list, the reply, and the cursor stay where the user put them. */
export default function ArriveQuietly() {
  const [messages, setMessages] = useState<Message[]>(START);
  const [pending, setPending] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [auto, setAuto] = useState(true);
  const [heard, setHeard] = useState('');
  const sequence = useRef(0);

  // Only state setters and refs are used, so this callback never changes.
  const receive = useCallback(() => {
    const n = sequence.current++;
    const next = INCOMING[n % INCOMING.length];
    setPending((current) => [...current, { id: 100 + n, ...next }]);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(receive, 4000);
    return () => clearInterval(timer);
  }, [auto, receive]);

  // Mirror the debounced live-region text, not a promise about a screen reader's exact speech.
  useEffect(() => {
    const timer = setTimeout(() => setHeard(pending.length > 0 ? defaultArrivalsLabel(pending.length) : ''), 200);
    return () => clearTimeout(timer);
  }, [pending.length]);

  const show = () => {
    setMessages((current) => [...[...pending].reverse(), ...current]);
    setPending([]);
  };

  return (
    <Example
      hint="New messages wait in the slot above the list. Type while they arrive: the list and your cursor stay put. Count announcements are polite and coalesced during bursts."
      controls={
        <>
          <Switch size="compact" label="Arrive by themselves" checked={auto} onChange={setAuto} />
          <Button size="compact" onClick={receive}>Send a message</Button>
          {/* What a screen reader hears, read out beside the controls as every example's readout is. */}
          <dl className="readout" aria-label="Announcement text">
            <div>
              <dt>Announced</dt>
              <dd className="ex-arrive-quietly-heard" data-silent={!heard || undefined}>
                {heard || 'Nothing'}
              </dd>
            </div>
            <div>
              <dt>Waiting</dt>
              <dd>{pending.length}</dd>
            </div>
            <div>
              <dt>In the list</dt>
              <dd>{messages.length}</dd>
            </div>
          </dl>
        </>
      }
    >
      <div className="ex-arrive-quietly">
        <div className="ex-arrive-quietly-main">
          <Arrivals count={pending.length} onShow={show}>
            <div className="ex-arrive-quietly-scroll" role="region" aria-label="Messages" tabIndex={0}>
              <List label="Conversation">
                {messages.map((message) => (
                  <ListRow key={message.id} title={message.from} description={message.text} depth={1} />
                ))}
              </List>
            </div>
          </Arrivals>
          <TextField label="Reply" value={draft} onChange={setDraft} placeholder="Type while messages arrive" />
        </div>
      </div>
    </Example>
  );
}
