import { useState } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch, Table, type TableColumn } from 'humane-system';
import './lines-are-for-dense-repetition-only.css';

const P = 'ex-lines-are-for-dense-repetition-only';

type Week = { week: number; signups: number; revenue: number };

const SIGNUPS = [412, 437, 468, 451, 502, 530, 519, 571, 588, 622, 681, 744];

// Twelve rows of the same shape: this repetition is what the line separates.
const WEEKS: Week[] = SIGNUPS.map((signups, index) => ({
  week: index + 1,
  signups,
  revenue: signups * 42,
}));

const COLUMNS: TableColumn<Week>[] = [
  { key: 'week', header: 'Week', align: 'end', render: (row) => row.week },
  { key: 'signups', header: 'Signups', align: 'end', render: (row) => row.signups.toLocaleString('en-US') },
  { key: 'revenue', header: 'Revenue', align: 'end', render: (row) => `$${row.revenue.toLocaleString('en-US')}` },
];

// Three items that do not repeat densely enough to need a line. Space alone groups them.
const STEPS = [
  { id: 'review', title: 'Review the draft', meta: '2 comments' },
  { id: 'share', title: 'Share with the team', meta: '4 people' },
  { id: 'publish', title: 'Publish the notes', meta: 'Ready' },
];

/** Rule: lines are for dense repetition only. The table keeps its lines, the short group uses space and planes. */
export default function LinesForDenseRepetition() {
  const [lines, setLines] = useState(true);

  return (
    <Example
      hint="Off removes the lines between the twelve rows."
      controls={<Switch size="compact" label="Row lines" checked={lines} onChange={setLines} />}
    >
      <div className={P}>
        <div className={`${P}-layout`} data-lines={lines ? 'on' : 'off'}>
          <Surface depth={1} plane="base" padded={false} className={`${P}-table`}>
            <Table
              caption="Signups and revenue for the last twelve weeks"
              columns={COLUMNS}
              rows={WEEKS}
              rowKey={(row) => String(row.week)}
            />
          </Surface>

          <Surface depth={1} plane="raised" className={`${P}-group`}>
            <h4 className={`${P}-heading`}>Next steps</h4>
            <ul className={`${P}-steps`}>
              {STEPS.map((step) => (
                <li key={step.id} className={`${P}-step`}>
                  <span className={`${P}-step-title`}>{step.title}</span>
                  <span className={`${P}-step-meta`}>{step.meta}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      </div>
    </Example>
  );
}
