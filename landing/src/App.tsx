import { Button, PreferencesProvider, UndoableList, useUndoableList } from 'humane-system';
import { LANGUAGE } from '../../docs/src/language';
import { AnalyticsNotice } from './AnalyticsNotice';
import './landing.css';

/** The three parts, each a place to go. Paths are those of the root dev server and build. */
const PARTS = [
  {
    href: '/docs/',
    name: 'Read the language',
    text: 'Six design principles, their implementation rules, and the visual conventions. Each rule includes an interactive example.',
  },
  {
    href: '/docs/#components',
    name: 'Inspect the system',
    text: 'Design tokens and React components for light and dark schemes, standard and high contrast, and reduced motion.',
  },
  {
    href: '/flagship/',
    name: 'Try Letters',
    text: 'A demonstration mail app built with the system. Read, write, archive, and undo. Sending is simulated.',
  },
];

const PREMISES = LANGUAGE.find((group) => group.id === 'premises')?.rules ?? [];
const PREMISE_LINKS: Record<string, string> = {
  'luminance-carries-structure': 'divide-with-planes',
  'rarity-creates-signal': 'saturation-belongs-to-state',
  'continuity-saves-effort': 'motion-is-a-morph',
  'control-creates-safety': 'prefer-undo-to-confirmation',
  'attention-is-finite': 'nothing-moves-idle',
  'perception-varies': 'reduced-motion-keeps-continuity',
};
const TASKS = [
  { id: 'reply', name: 'Reply to the landlord' },
  { id: 'plants', name: 'Water the plants' },
  { id: 'film', name: 'Drop off two rolls of film' },
];

export function App() {
  return (
    <PreferencesProvider>
      <main className="landing">
        <header className="landing-head">
          <h1 className="landing-title">Humane Design Language</h1>
          <p className="landing-lead">
            Design principles for layout, color, typography, motion, and interaction, with a React reference system
            and examples you can try.
          </p>
        </header>

        <section className="landing-destinations" aria-labelledby="landing-destinations-title">
          <h2 className="landing-heading" id="landing-destinations-title">Explore the project</h2>
          <ul className="landing-parts">
            {PARTS.map(({ href, name, text }) => (
              <li key={href} className="landing-part-item">
                {/* A Surface's root plane, drawn on the link itself, so the ring and the press follow its corner. */}
                <a href={href} className="h-surface landing-part" data-root data-depth={0} data-plane="raised" data-padded>
                  <span className="landing-part-name">{name}</span>
                  <span className="landing-part-text">{text}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <UndoExample />

        <section className="landing-premises" aria-labelledby="landing-premises-title">
          <h2 className="landing-heading" id="landing-premises-title">Premises</h2>
          <ul className="landing-premise-list">
            {PREMISES.map(({ slug, name, text }) => (
              <li key={slug} className="landing-premise">
                <h3 className="landing-premise-name">
                  <a href={`/docs/#${PREMISE_LINKS[slug]}`}>{name}</a>
                </h3>
                <p className="landing-premise-text">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="landing-use" aria-labelledby="landing-use-title">
          <h2 className="landing-heading" id="landing-use-title">Use the project</h2>
          <div className="landing-use-content">
            <p>
              The reference system is public alpha and exports source TypeScript. It is not yet a published npm
              package. The documentation records known limits as well as verified behavior.
            </p>
            <ul className="landing-use-links">
              <li><a href="https://github.com/MercuriusDream/humane-design-language">Source repository</a></li>
              <li><a href="/docs/#conformance">Conformance requirements</a></li>
              <li><a href="/llms.txt">Machine-readable documentation</a></li>
            </ul>
          </div>
        </section>

        <AnalyticsNotice />
      </main>
    </PreferencesProvider>
  );
}

function UndoExample() {
  const list = useUndoableList(TASKS);
  return (
    <section className="landing-example" aria-labelledby="landing-example-title">
      <div className="landing-example-head">
        <div className="landing-example-copy">
          <h2 className="landing-heading" id="landing-example-title">Prefer undo to confirmation</h2>
          <p>Remove a task. Its row stays in place until you move away, so the next target does not shift.</p>
        </div>
        <Button size="compact" onClick={() => list.restoreAll()}>Restore all</Button>
      </div>
      <UndoableList label="Example tasks" {...list} renderLabel={(task) => task.name} empty="No tasks. Restore all to begin again." />
      <a className="landing-rule-link" href="/docs/#prefer-undo-to-confirmation">Read the rule and its other examples</a>
    </section>
  );
}
