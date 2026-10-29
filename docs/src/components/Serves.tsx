import { Fragment } from 'react';
import { ALL_RULES } from '../language';

const NAMES = new Map(ALL_RULES.map((rule) => [rule.slug, rule.name]));

/** The line under a component's description: "Serves a, b, and c.", each rule in lowercase and linked to its section. */
export function Serves({ rules }: { rules: string[] }) {
  return (
    <p className="rule-from">
      Serves{' '}
      {rules.map((slug, i) => {
        const name = NAMES.get(slug);
        if (!name) throw new Error(`Serves: no rule with the slug "${slug}"`);
        const separator = i === 0 ? '' : rules.length === 2 ? ' and ' : i === rules.length - 1 ? ', and ' : ', ';
        return (
          <Fragment key={slug}>
            {separator}
            <a href={`#${slug}`}>{name.toLowerCase()}</a>
          </Fragment>
        );
      })}
      .
    </p>
  );
}
