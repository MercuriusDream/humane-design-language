import { useEffect, useState } from 'react';
import { Button, Notice, Segmented, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './notice.css';

type Tone = 'neutral' | 'danger';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'title',
    type: 'string',
    meaning: 'Required. What happened, in words. Set heavier than the body, at the same size.',
  },
  {
    prop: 'tone',
    type: "'neutral' | 'danger'",
    meaning:
      'Neutral is the default. Danger sets only the title in the signal color, for an error. Nothing else in the notice is saturated.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning:
      'The body: what happened and what the user can do next. Optional. When it is empty, no wrapper renders, so the title stands alone.',
  },
  {
    prop: 'action',
    type: 'ReactNode',
    meaning:
      'One action placed under the words, such as a Button. Optional. When it is empty, no wrapper renders and no gap is added.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const COPY: Record<Tone, { title: string; body: string }> = {
  neutral: {
    title: 'Saved on this device',
    body: 'Your changes upload when you reconnect.',
  },
  danger: {
    title: 'Export could not finish',
    body: 'The disk is full. Free at least 90 MB, then try again.',
  },
};

/** Words that state what happened. A notice is a plane in words, so the message needs no icon or badge. */
export default function NoticeDoc() {
  const [tone, setTone] = useState<Tone>('neutral');
  const [body, setBody] = useState(true);
  const [action, setAction] = useState(true);
  const [tries, setTries] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  // The sync finishes on its own. The notice it produces arrives in place, and focus stays on the button.
  useEffect(() => {
    if (!syncing) return;
    const timer = window.setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [syncing]);

  const onSync = () => {
    if (syncing) return;
    if (synced) {
      setSynced(false);
      return;
    }
    setSyncing(true);
  };

  const { title, body: copy } = COPY[tone];
  const tried = tries === 0 ? '' : ` Tried ${tries} ${tries === 1 ? 'time' : 'times'}.`;

  return (
    <>
      <p className="rule-text">
        A notice states one message in words, such as an outcome or an error with the next step. It is a plane of its own
        with no icon or badge, and it appears without taking focus.
      </p>
      <Serves rules={['words-are-for-intent-commands-and-errors', 'arrive-quietly', 'show-and-expose']} />
      <Example
        hint="Switch the tone, the body, and the action. On danger, press Try again to count attempts. Start sync, and a notice arrives when it finishes, without moving focus."
        controls={
          <>
            <Segmented
              label="Tone"
              value={tone}
              onChange={setTone}
              options={[
                { value: 'neutral', label: 'Neutral' },
                { value: 'danger', label: 'Danger' },
              ]}
              size="compact"
            />
            <Switch label="Body" checked={body} onChange={setBody} size="compact" />
            <Switch label="Action" checked={action} onChange={setAction} size="compact" />
            <Button size="compact" onClick={onSync}>
              {synced ? 'Clear notice' : syncing ? 'Syncing' : 'Start sync'}
            </Button>
          </>
        }
      >
        <div className="doc-notice-specimen">
          <Notice
            tone={tone}
            title={title}
            action={
              action ? (
                <Button variant="strong" onClick={() => setTries((n) => n + 1)}>
                  Try again
                </Button>
              ) : undefined
            }
          >
            {body ? `${copy}${tone === 'danger' ? tried : ''}` : undefined}
          </Notice>
          {synced && (
            <div className="doc-notice-arrival">
              <Notice title="Sync finished">Your changes are on every device.</Notice>
            </div>
          )}
        </div>
      </Example>
      <h4 className="doc-heading">Props</h4>
      <PropList caption="Notice props" columns={PROP_COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}
