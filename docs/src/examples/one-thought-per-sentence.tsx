import { useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Segmented, morphDuration } from 'humane-system';
import './one-thought-per-sentence.css';

// The split adds one line of body copy, so the morph is sized to one line.
const SPLIT_PX = 24;

type Version = 'before' | 'after';

// The em-dash below is the one sample string that may contain one. It is the "before" copy being demonstrated.
const COPY: Record<Version, [string, string]> = {
  before: ['Your export is ready — open the folder to find your photos.', ''],
  after: ['Your export is ready.', 'Open the folder to find your photos.'],
};

const OPTIONS: { value: Version; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
];

/** Interface copy holds one thought per sentence. An em-dash joins two thoughts, so the version switch shows the split. */
export default function OneThoughtPerSentence() {
  const [version, setVersion] = useState<Version>('before');
  const [first, second] = COPY[version];
  const thoughts = second ? 2 : 1;

  return (
    <Example
      hint="Switch the copy. The first version joins two thoughts into one line. The second splits them into two sentences."
      controls={<Segmented size="compact" label="Copy" options={OPTIONS} value={version} onChange={setVersion} />}
    >
      <div
        className="ex-one-thought-per-sentence-message"
        data-version={version}
        style={{ '--dur': `${morphDuration(SPLIT_PX)}ms` } as CSSProperties}
      >
        <p className="ex-one-thought-per-sentence-text">
          <span className="ex-one-thought-per-sentence-sentence">{first}</span>
          <span className="ex-one-thought-per-sentence-sentence">{second}</span>
        </p>
        <p className="ex-one-thought-per-sentence-count">{thoughts === 1 ? '1 thought' : '2 thoughts'}</p>
      </div>
    </Example>
  );
}
