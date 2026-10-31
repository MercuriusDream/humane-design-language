import { PreferencesProvider } from 'humane-system';
import { AnalyticsNotice } from './AnalyticsNotice';
import './landing.css';

/** The three parts, each a place to go. Paths are those of the root dev server and build. */
const PARTS = [
  { href: '/docs/', name: 'About' },
  { href: '/docs/#components', name: 'System' },
  { href: '/flagship/', name: 'Example' },
];

export function App() {
  return (
    <PreferencesProvider>
      <main className="landing">
        <h1 className="landing-title">A humane perception.</h1>
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
