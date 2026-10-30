import { Fragment } from 'react';
import { ALL_RULES } from '../language';

const NAMES = new Map(ALL_RULES.map((rule) => [rule.slug, rule.name]));

/** Related rules under a component's description, each linked to its section. */
export function Serves({ rules }: { rules: string[] }) {
  return (
    <p className="rule-from">
      Related rules:{' '}
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
