import type { ComponentType } from 'react';
import { Button, usePreferences } from 'humane-system';
import { Lead, RuleList } from './components/Section';
import './components/prop-list.css';
import { CONFORMANCE, INTENT, LANGUAGE, slugify, type Rule } from './language';
import { SYSTEM_DOCS } from './system-docs';

function Intent() {
  return (
    <>
      <Lead>{INTENT.lead}</Lead>
      {INTENT.points.length > 0 && (
        <ul className="intent-points">
          {INTENT.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function groupContent(id: string): ComponentType {
  const group = LANGUAGE.find((g) => g.id === id)!;
  return function GroupContent() {
    return (
      <>
        {group.lead && <Lead>{group.lead}</Lead>}
        <RuleList rules={group.rules} />
      </>
    );
  };
}

function Conformance() {
  const { grayscale, setGrayscale, reducedMotion, setReducedMotion, highContrast, setContrast } = usePreferences();
  return (
    <>
      <div className="row-actions">
        <Button aria-pressed={grayscale} onClick={() => setGrayscale(!grayscale)}>
          {grayscale ? 'End grayscale test' : 'Run grayscale test'}
        </Button>
        <Button aria-pressed={reducedMotion} onClick={() => setReducedMotion(!reducedMotion)}>
          {reducedMotion ? 'End reduced motion test' : 'Run reduced motion test'}
        </Button>
        <Button aria-pressed={highContrast} onClick={() => setContrast(highContrast ? 'standard' : 'high')}>
          {highContrast ? 'End high contrast test' : 'Run high contrast test'}
        </Button>
      </div>
      <dl className="doc-definitions doc-tests" aria-label="Conformance tests">
        {CONFORMANCE.map(({ name, condition }) => (
          <div className="doc-definition" key={name}>
            <dt className="doc-definition-term doc-definition-term-label">{name}</dt>
            <dd className="doc-definition-meaning">
              <span className="visually-hidden">Passes when: </span>
              {condition}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function Components() {
  return (
    <>
      <Lead>
        The Humane Design System turns the language into tokens and components. Each component below shows its live
        specimen, the rules it serves, and its props.
      </Lead>
      <ul className="component-docs">
        {SYSTEM_DOCS.map(({ name, Doc }) => (
          <li key={name} id={`component-${name.toLowerCase()}`} className="component-doc">
            <h3 className="rule-name">{name}</h3>
            <Doc />
          </li>
        ))}
      </ul>
    </>
  );
}

/* Each rule is filed under the first premise it names, so the sections are the premises themselves. */
const PREMISES = LANGUAGE.find((group) => group.id === 'premises')!.rules;
const rulesByPremise = new Map<string, Rule[]>(PREMISES.map((premise) => [premise.slug, []]));
for (const group of LANGUAGE) {
  if (group.id === 'premises' || group.id === 'signature') continue;
  for (const rule of group.rules) {
    const bucket = rulesByPremise.get(slugify(rule.from[0] ?? ''));
    if (!bucket) throw new Error(`"${rule.name}" names no premise`);
    bucket.push(rule);
  }
}

function premiseContent(premise: Rule): ComponentType {
  const rules = rulesByPremise.get(premise.slug)!;
  return function PremiseContent() {
    return (
      <>
        <Lead>{premise.text}</Lead>
        <RuleList rules={rules} />
      </>
    );
  };
}

export const SECTIONS: { id: string; title: string; Content: ComponentType }[] = [
  { id: 'intent', title: 'Intent', Content: Intent },
  ...PREMISES.map((premise) => ({ id: premise.slug, title: premise.name, Content: premiseContent(premise) })),
  { id: 'signature', title: 'Signature', Content: groupContent('signature') },
  { id: 'conformance', title: 'Conformance', Content: Conformance },
  { id: 'components', title: 'Components', Content: Components },
];
