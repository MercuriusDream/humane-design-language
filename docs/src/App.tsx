import { AppShell, PreferenceControls, PreferencesProvider, useScrollSpy } from 'humane-system';
import { Section } from './components/Section';
import { SECTIONS } from './sections';
import './styles/app.css';

const IDS = SECTIONS.map((s) => s.id);
const ITEMS = SECTIONS.map(({ id, title }) => ({ id, label: title, href: `#${id}` }));

export function App() {
  return (
    <PreferencesProvider>
      <Docs />
    </PreferencesProvider>
  );
}

function Docs() {
  const { active, jumpTo } = useScrollSpy(IDS);
  return (
    <AppShell
      title="Humane Design Language"
      items={ITEMS}
      activeId={active}
      onSelect={jumpTo}
      navLabel="Sections"
      sidebarExtra={<PreferenceControls showGrayscale />}
    >
      <div className="page-column">
        <header className="page-header">
          <h1 className="page-title">Humane Design Language</h1>
          <p className="lead">
            A language of relationships, not values. This page is built with it, and every demo on it is a rule you can
            operate.
          </p>
        </header>
        {SECTIONS.map(({ id, title, Content }) => (
          <Section key={id} id={id} title={title}>
            <Content />
          </Section>
        ))}
      </div>
    </AppShell>
  );
}
