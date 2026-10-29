import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Button, Slider, Surface } from 'humane-system';
import './text-size-belongs-to-the-user.css';

/** Text follows the user's setting. The slider scales it on top of that setting, and the card reflows. */
export default function TextSizeBelongsToTheUser() {
  const [percent, setPercent] = useState(100);

  return (
    <Example
      hint="Drag to scale the text. Your browser's text size still applies."
      controls={<Slider size="compact" label="Text size" value={percent} min={100} max={200} unit="%" onChange={setPercent} />}
    >
      <div className="ex-text-size-belongs-to-the-user-stage" style={{ fontSize: `${percent}%`, '--scale': percent / 100 } as CSSProperties}>
        <Surface depth={1} plane="raised" className="ex-text-size-belongs-to-the-user-card">
          <h3 className="ex-text-size-belongs-to-the-user-title">Print settings</h3>
          <p className="ex-text-size-belongs-to-the-user-text">
            Two-sided, from the second drawer. Changes apply to the next job.
          </p>
          <dl className="ex-text-size-belongs-to-the-user-rows">
            <div className="ex-text-size-belongs-to-the-user-row">
              <dt>Paper</dt>
              <dd>A4, 80 g</dd>
            </div>
            <div className="ex-text-size-belongs-to-the-user-row">
              <dt>Copies</dt>
              <dd>2</dd>
            </div>
            <div className="ex-text-size-belongs-to-the-user-row">
              <dt>Printer</dt>
              <dd>Office printer, second floor, network room</dd>
            </div>
          </dl>
          <div className="ex-text-size-belongs-to-the-user-actions">
            <Button variant="quiet">Cancel</Button>
            <Button variant="strong">Print</Button>
          </div>
        </Surface>
      </div>
    </Example>
  );
}
