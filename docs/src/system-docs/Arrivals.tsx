import { useState } from 'react';
import { Arrivals, Button, Switch, defaultArrivalsLabel, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './arrivals.css';

type Message = { id: number; from: string; text: string };

const SENDERS = ['Mina', 'Jun', 'Sam', 'Aiko', 'Theo'];
const TEXTS = [
  'Can you check the proof before noon?',
  'The train is running ten minutes late.',
  'Photos from Saturday are in the shared folder.',
  'Lunch moved to the north room.',
  'Call me when the file uploads.',
];

function makeMessage(id: number): Message {
  return { id, from: SENDERS[id % SENDERS.length], text: TEXTS[id % TEXTS.length] };
}

function waitingLabel(count: number): string {
  return `${count} waiting`;
}

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'count',
    type: 'number',
    meaning:
      'How many new items wait. Zero leaves the reserved slot empty. Count announcements are debounced to coalesce bursts while keeping the eventual count current.',
  },
  {
    prop: 'onShow',
    type: '() => void',
    meaning:
      'Called when the user presses the label. The insertion it causes may move content, because the user asked for it.',
  },
  {
    prop: 'label',
    type: '(count: number) => string',
    meaning:
      'Words for the pending count. Defaults to defaultArrivalsLabel, which gives "1 new" and "5 new". Its text supplies the debounced polite count announcement.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'The list, below the reserved slot. Its stable content region receives focus after a user activates the arrival control and that control disappears, unless focus has already moved elsewhere.',
  },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard reserves a 44 px slot. Compact reserves a 36 px slot. Defaults to standard.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '22%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '34%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** New items wait in a reserved slot and never push content down. Serves arrive quietly and reserve space for what is loading. */
export default function ArrivalsDoc() {
  const [shown, setShown] = useState<Message[]>(() => [makeMessage(1), makeMessage(0)]);
  const [queue, setQueue] = useState<Message[]>([]);
  const [seq, setSeq] = useState(2);
  const [custom, setCustom] = useState(false);

  const receive = () => {
    const id = seq;
    setSeq(id + 1);
    setQueue((current) => [...current, makeMessage(id)]);
  };

  const show = () => {
    setShown((current) => [...[...queue].reverse(), ...current]);
    setQueue([]);
  };

  return (
    <>
      <p className="rule-text">
        New items the user did not request wait in a reserved slot above the list. The slot shows how many arrived, and the
        user decides when to bring them in.
      </p>
      <Serves rules={['arrive-quietly', 'reserve-space-for-what-is-loading']} />
      <Example
        hint="Receive a message, then press the label to show it. The slot above the list never moves."
        controls={
          <div className="doc-arrivals-controls">
            <Button size="compact" onClick={receive}>
              Receive a message
            </Button>
            <Switch label="Custom label" checked={custom} onChange={setCustom} size="compact" />
          </div>
        }
      >
        <div className="doc-arrivals-specimen">
          <Arrivals
            count={queue.length}
            onShow={show}
            label={custom ? waitingLabel : defaultArrivalsLabel}
          >
            <ul className="doc-arrivals-list">
              {shown.map((message) => (
                <li key={message.id} className="doc-arrivals-item">
                  <span className="doc-arrivals-from">{message.from}</span>
                  <span className="doc-arrivals-text">{message.text}</span>
                </li>
              ))}
            </ul>
          </Arrivals>
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow> caption="Arrivals props" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
