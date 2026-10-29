import { useState } from 'react';
import { Example } from '../components/Example';
import { Switch } from 'humane-system';
import './rarity-creates-signal.css';

type Item = {
  id: string;
  title: string;
  time: string;
  description?: string;
  /** The one element that needs the user. */
  signal?: boolean;
};

const ITEMS: Item[] = [
  { id: 'invoice', title: 'Invoice paid', time: '07:55' },
  { id: 'backup', title: 'Backup finished', time: '08:10' },
  { id: 'member', title: 'Team member joined', time: '08:34' },
  { id: 'draft', title: 'Draft saved', time: '09:01' },
  {
    id: 'payment',
    title: 'Payment failed',
    time: '09:18',
    description: 'Update the card to keep your plan.',
    signal: true,
  },
  { id: 'calendar', title: 'Calendar synced', time: '09:40' },
  { id: 'comment', title: 'Comment added', time: '10:05' },
  { id: 'export', title: 'Export ready', time: '10:30' },
];

/** Rule: rarity creates signal. Saturation marks the one row that needs the user; saturating every row erases it. */
export default function RarityCreatesSignal() {
  const [saturateAll, setSaturateAll] = useState(false);
  const saturatedCount = ITEMS.filter((item) => saturateAll || item.signal).length;

  return (
    <Example
      hint="Turn on saturate everything. One row needs you. Watch it stop standing out once every row is saturated."
      controls={
        <>
          <Switch size="compact" label="Saturate everything" checked={saturateAll} onChange={setSaturateAll} />
          <p className="ex-rarity-creates-signal-count" aria-live="polite">
            {saturatedCount} of {ITEMS.length} saturated
          </p>
        </>
      }
    >
      <ul className="ex-rarity-creates-signal-list" aria-label="Recent activity">
        {ITEMS.map((item) => {
          const saturated = saturateAll || item.signal === true;
          return (
            <li key={item.id} className="ex-rarity-creates-signal-row" data-saturated={saturated}>
              <span className="ex-rarity-creates-signal-dot" aria-hidden="true" />
              <span className="ex-rarity-creates-signal-main">
                <span className="ex-rarity-creates-signal-title">{item.title}</span>
                {item.description && <span className="ex-rarity-creates-signal-description">{item.description}</span>}
              </span>
              <span className="ex-rarity-creates-signal-time">{item.time}</span>
            </li>
          );
        })}
      </ul>
    </Example>
  );
}
