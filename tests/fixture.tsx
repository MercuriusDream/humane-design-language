import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppShell, Arrivals, Button, Checkbox, Dialog, List, ListRow, Menu, Notice, Placeholder, PreferencesProvider,
  ProgressSurface, RadioGroup, Segmented, Slider, Switch, Tabs, UndoableList, useMedia, usePreferences, useUndoableList,
} from '../system/src';

function Fixture() {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(10);
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState(0);
  const [removed, setRemoved] = useState(0);
  const [option, setOption] = useState('short');
  const [radio, setRadio] = useState('standard');
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [slide, setSlide] = useState(30);
  const [query, setQuery] = useState('(min-width: 1px)');
  const matches = useMedia(query);
  const origin = useRef<HTMLButtonElement>(null);
  const prefs = usePreferences();
  const undo = useUndoableList([{ id: 'a', label: 'A long row label that wraps at larger text sizes' }, { id: 'b', label: 'Second row' }]);
  Object.assign(window, { humaneTest: { setReady, setCount, setProgress, setQuery, prefs } });
  const menuItems = Array.from({ length: 12 }, (_, i) => ({ id: String(i), label: `Action ${i + 1}`, onSelect() {} }));
  return (
    <AppShell title="Fixture" items={[{ id: 'one', label: 'First page' }, { id: 'two', label: 'Second page' }]} activeId="one" onSelect={() => {}}>
      <main style={{ display: 'grid', gap: 24, minWidth: 0 }}>
        <h1>Component regression fixture</h1>
        <output id="media-result">{String(matches)}</output>
        <section id="loading">
          <Placeholder ready={ready}><p>A loading paragraph with enough content to wrap over several lines when the user doubles the text size on a narrow screen. Its geometry is known before loading finishes.</p></Placeholder>
          <Button id="loading-anchor">Stationary target</Button>
        </section>
        <section id="fixed-loading">
          <Placeholder ready={ready} height={80}><p style={{ minHeight: 240 }}>Large content inside a reserved allocation</p></Placeholder>
          <Button id="fixed-anchor">Fixed target</Button>
        </section>
        <Arrivals count={count} onShow={() => setCount(0)}><p id="arrivals-content">Received items</p></Arrivals>
        <List label="Trailing actions"><ListRow title="Selectable row" onSelect={() => setSelected((n) => n + 1)} end={<Button onClick={() => setRemoved((n) => n + 1)}>Remove separately</Button>} /></List>
        <output id="row-actions">{selected},{removed}</output>
        <Segmented label="Long options" value={option} onChange={setOption} options={[{ value: 'short', label: 'Short' }, { value: 'long', label: 'Notification preferences and delivery' }]} />
        <Switch label="Fixture switch" checked={switchOn} onChange={setSwitchOn} />
        <Checkbox label="Fixture checkbox" hint="A hint under the label." checked={checked} onChange={setChecked} />
        <Slider label="Fixture slider" value={slide} min={0} max={100} onChange={setSlide} unit="px" />
        <Tabs label="Long tabs" tabs={[{ id: 'a', label: 'Short', content: 'First' }, { id: 'b', label: 'Notification preferences and delivery', content: 'Second' }]} />
        <div id="disabled-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['default', 'strong', 'quiet', 'danger'] as const).map((variant) => <Button key={variant} disabled variant={variant}>{variant}</Button>)}
        </div>
        <UndoableList label="Undo test" {...undo} renderLabel={(item) => item.label} />
        <ProgressSurface value={progress} max={100} label="Test progress"><p>Progress content</p></ProgressSurface>
        <div id="spacing-notice">
          <Notice title="Saved on this device" action={<Button>Undo</Button>}>
            Your changes upload when you reconnect.
          </Notice>
        </div>
        <div id="spacing-notice-nobody">
          <Notice title="Saved on this device" action={<Button>Undo</Button>} />
        </div>
        <div id="spacing-radio">
          <RadioGroup
            label="Delivery"
            name="fixture-radio"
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'express', label: 'Express' },
            ]}
            value={radio}
            onChange={setRadio}
          />
        </div>
        <div id="spacing-radio-compact">
          <RadioGroup
            label="Delivery"
            name="fixture-radio-compact"
            size="compact"
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'express', label: 'Express' },
            ]}
            value={radio}
            onChange={setRadio}
          />
        </div>
        <Button ref={origin} onClick={() => setDialog(true)}>Open test dialog</Button>
        <Dialog open={dialog} onClose={() => setDialog(false)} title="Test dialog" origin={origin.current}>
          <Menu label="Dialog menu" items={menuItems} />
        </Dialog>
        <div id="edge-menu" style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 10 }}><Menu label="Edge menu" items={menuItems} /></div>
      </main>
    </AppShell>
  );
}

const app = new URLSearchParams(location.search).get('app');
if (app === 'docs') {
  void import('../docs/src/main');
} else if (app === 'landing') {
  void import('../landing/src/main');
} else if (app === 'flagship') {
  void import('../flagship/src/main');
} else {
  createRoot(document.getElementById('root')!).render(<PreferencesProvider><Fixture /></PreferencesProvider>);
}
