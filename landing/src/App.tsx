import { PreferencesProvider } from 'humane-system';
import { AnalyticsNotice } from './AnalyticsNotice';
import './landing.css';

/** The three parts, each a place to go. Paths are those of the root dev server and build. */
const PARTS = [
  { href: '/docs/', name: 'Language' },
  { href: '/docs/#components', name: 'Components' },
  { href: '/flagship/', name: 'Example: a mail app' },
];

export function App() {
  return (
    <PreferencesProvider>
      <main className="landing">
        <header className="landing-header">
          <h1 className="landing-title">Humane Design Language</h1>
          <p className="landing-lead">
            A design language built from human perception, a React component system, and a reference mail app.
          </p>
        </header>
        <ul className="landing-parts">
          {PARTS.map(({ href, name }) => (
            <li key={href}>
              {/* A Surface's root plane, drawn on the link itself, so the ring and the press follow its corner. */}
              <a href={href} className="h-surface landing-part" data-root data-depth={0} data-plane="raised">
                {name}
              </a>
            </li>
          ))}
        </ul>
        <AnalyticsNotice />
      </main>
    </PreferencesProvider>
  );
}
