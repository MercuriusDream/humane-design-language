import { PreferencesProvider } from 'humane-system';
import { AnalyticsNotice } from './AnalyticsNotice';
import './landing.css';

/** The three parts, each a whole section of the screen. Paths are those of the root dev server and build. */
const PARTS = [
  { href: '/docs/', name: 'Language', line: 'Principles drawn from human perception.' },
  { href: '/docs/#components', name: 'Components', line: 'A React system that follows them.' },
  { href: '/flagship/', name: 'Example', line: 'A mail app built with the system.' },
];

export function App() {
  return (
    <PreferencesProvider>
      <main className="landing">
        <h1 className="landing-title">Humane Design Language</h1>
        {PARTS.map(({ href, name, line }) => (
          <a key={href} href={href} className="landing-part">
            <span className="landing-part-name">{name}</span>
            <span className="landing-part-line">{line}</span>
          </a>
        ))}
        <AnalyticsNotice />
      </main>
    </PreferencesProvider>
  );
}
