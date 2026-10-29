import type { ComponentType, ReactNode } from 'react';
import { EXAMPLES } from '../examples';
import { slugify, type Rule } from '../language';

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>;
}

/** Every rule is a subsection with its own example, read from examples/<slug>.tsx. */
export function RuleList({ rules }: { rules: Rule[] }) {
  return (
    <ul className="rules">
      {rules.map((rule) => (
        <RuleView key={rule.slug} rule={rule} Example={EXAMPLES[rule.slug]} />
      ))}
    </ul>
  );
}

function RuleView({ rule, Example }: { rule: Rule; Example?: ComponentType }) {
  return (
    <li className="rule" id={rule.slug}>
      <h3 className="rule-name">{rule.name}</h3>
      <p className="rule-text">{rule.text}</p>
      {rule.points.length > 0 && (
        <ul className="rule-points">
          {rule.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {rule.from.length > 0 && (
        <p className="rule-from">
          Follows from{' '}
          {rule.from.map((premise, i) => (
            <span key={premise}>
              {i > 0 && ' and '}
              <a href={`#${slugify(premise)}`}>{premise.toLowerCase()}</a>
            </span>
          ))}
        </p>
      )}
      {Example && <Example />}
    </li>
  );
}
