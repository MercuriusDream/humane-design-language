import { useState, type ReactNode } from 'react';
import { Example } from '../components/Example';
import { RadioGroup } from 'humane-system';
import './hierarchy-comes-from-lightness-then-hue-then-saturation.css';

const P = 'ex-hierarchy-comes-from-lightness-then-hue-then-saturation';

type Step = 'lightness' | 'hue' | 'saturation';

const STEPS: { value: Step; label: string }[] = [
  { value: 'lightness', label: 'Lightness only' },
  { value: 'hue', label: 'Plus hue' },
  { value: 'saturation', label: 'Plus saturation' },
];

/**
 * Rule: hierarchy comes from lightness, then hue, then saturation.
 * Each step adds one channel on top of the one before. The title and the warning already stand apart at lightness only.
 * The warning sits in a short feed of ordinary cards, so its level is read against non-essential peers.
 */
export default function HierarchyComesFromLightnessThenHueThenSaturation() {
  const [step, setStep] = useState<Step>('lightness');

  return (
    <Example
      hint="Step through the three. Lightness alone already separates the title and the warning from the rest. Hue and saturation only add to it."
      controls={<RadioGroup size="compact" label="Emphasis" name={`${P}-step`} options={STEPS} value={step} onChange={setStep} />}
    >
      <div className={`${P}-feed`} data-step={step}>
        <Card title="Nightly backup" time="Today, 07:52" body="Finished at 02:14. 38 files changed since the last run.">
          <p className={`${P}-warning`}>
            <strong className={`${P}-warning-lead`}>Backups are paused.</strong> Storage is 96% full. Free 2 GB to resume.
          </p>
        </Card>
        <Card title="Weekly report" time="Today, 06:00" body="Sent to 3 people." />
        <Card title="Photo sync" time="Yesterday" body="212 new photos from the phone." />
      </div>
    </Example>
  );
}

/** One feed item. Title, time, and body keep the same levels in every card, so only the warning stands apart. */
function Card({ title, time, body, children }: { title: string; time: string; body: string; children?: ReactNode }) {
  return (
    <article className={`${P}-card`}>
      <header className={`${P}-head`}>
        <h4 className={`${P}-title`}>{title}</h4>
        <time className={`${P}-time`}>{time}</time>
      </header>
      <p className={`${P}-body`}>{body}</p>
      {children}
    </article>
  );
}
