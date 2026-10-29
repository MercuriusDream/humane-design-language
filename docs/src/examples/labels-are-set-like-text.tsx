import { useId, useState } from 'react';
import { Example } from '../components/Example';
import { Checkbox } from 'humane-system';
import './labels-are-set-like-text.css';

const REPOSITORIES = [
  { id: 'tokens', name: 'Design tokens' },
  { id: 'system', name: 'Humane system' },
  { id: 'docs', name: 'Documentation site' },
  { id: 'icons', name: 'Icon set' },
];

/** The section label is set in the same typeface, case, and spacing as the rows beneath it. Serves: labels are set like text. */
export default function LabelsAreSetLikeText() {
  const [selected, setSelected] = useState<string[]>(['tokens', 'system']);
  const labelId = useId();

  return (
    <Example hint="The label uses the same typeface, sentence case, and normal spacing as the rows under it. Weight and space set it apart.">
      <section className="ex-labels-are-set-like-text-group" aria-labelledby={labelId}>
        <header className="ex-labels-are-set-like-text-head">
          <h3 className="ex-labels-are-set-like-text-label" id={labelId}>
            Repositories
          </h3>
          <span className="ex-labels-are-set-like-text-count">
            {selected.length} of {REPOSITORIES.length}
          </span>
        </header>
        <ul className="ex-labels-are-set-like-text-list">
          {REPOSITORIES.map((repo) => (
            <li key={repo.id}>
              <Checkbox
                label={repo.name}
                checked={selected.includes(repo.id)}
                onChange={(on) =>
                  setSelected((current) =>
                    on ? [...current, repo.id] : current.filter((id) => id !== repo.id),
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>
    </Example>
  );
}
