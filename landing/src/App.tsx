import { PreferencesProvider } from 'humane-system';
import { INTENT, LANGUAGE } from '../../docs/src/language';
import './landing.css';

/** The three parts, each a place to go. Paths are those of the root dev server and build. */
const PARTS = [
  {
    href: '/docs/',
    name: 'The language',
    text: 'Six premises about how people see and act, the rules that follow from them, and a signature. Every rule has a demo you can operate.',
  },
  {
    href: '/docs/#components',
    name: 'The system',
    text: 'Tokens and components that turn the relationships into values, built for light and dark, standard and high contrast.',
  },
  {
    href: '/flagship/',
    name: 'Letters',
    text: 'A mail client made from the system and nothing else. Read, archive, undo, and write.',
  },
];

const PREMISES = LANGUAGE.find((group) => group.id === 'premises')?.rules ?? [];

export function App() {
  return (
    <PreferencesProvider>
      <main className="landing">
        <header className="landing-head">
          <h1 className="landing-title">Humane Design Language</h1>
          <p className="landing-lead">{INTENT.lead}</p>
        </header>

        <nav aria-label="Parts">
          <ul className="landing-parts">
            {PARTS.map(({ href, name, text }) => (
              <li key={href} className="landing-part-item">
                {/* A Surface's root plane, drawn on the link itself, so the ring and the press follow its corner. */}
                <a href={href} className="h-surface landing-part" data-root data-depth={0} data-plane="raised" data-padded>
                  <span className="landing-part-name">
                    {name}
                    <svg className="landing-part-mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="landing-part-text">{text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="landing-premises" aria-labelledby="landing-premises-title">
          <h2 className="landing-heading" id="landing-premises-title">Premises</h2>
          <ul className="landing-premise-list">
            {PREMISES.map(({ slug, name, text }) => (
              <li key={slug} className="landing-premise">
                <h3 className="landing-premise-name">{name}</h3>
                <p className="landing-premise-text">{text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PreferencesProvider>
  );
}
