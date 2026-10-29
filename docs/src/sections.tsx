import type { ComponentType } from 'react';
import { Button, usePreferences } from 'humane-system';
import { Lead, RuleList } from './components/Section';
import './components/prop-list.css';
import { CONFORMANCE, INTENT, LANGUAGE } from './language';
import { SYSTEM_DOCS } from './system-docs';

function Intent() {
  return (
    <>
      <Lead>{INTENT.lead}</Lead>
      <ul className="intent-points">
        {INTENT.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
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
        The Humane Design System turns the language into tokens and components. These live examples demonstrate the
        relationships above; they are not a certification that every conformance test passes.
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

export const SECTIONS: { id: string; title: string; Content: ComponentType }[] = [
  { id: 'intent', title: 'Intent', Content: Intent },
  ...LANGUAGE.map((group) => ({ id: group.id, title: group.title, Content: groupContent(group.id) })),
  { id: 'conformance', title: 'Conformance', Content: Conformance },
  { id: 'components', title: 'Components', Content: Components },
];
