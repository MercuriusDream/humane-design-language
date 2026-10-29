import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Example } from '../components/Example';
import { Switch, morphDuration, usePreferences } from 'humane-system';
import './show-and-expose.css';

const NOTICES = ['The ferry is boarding at the north dock.', 'Studio export finished, 36 photos.'];

type Exposed = { role: string; name: string; checked: string };

/** The list shows the change, the switch exposes its state through aria-checked, and the readout reads what assistive technology gets. */
export default function ShowAndExpose() {
  const { reducedMotion } = usePreferences();
  const [on, setOn] = useState(false);
  const [height, setHeight] = useState(0);
  const [exposed, setExposed] = useState<Exposed | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => setHeight(list.offsetHeight));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Read the switch from the DOM after every change, not from the state that drove it.
  useEffect(() => {
    const control = bodyRef.current?.querySelector<HTMLElement>('[role="switch"]');
    if (!control) return;
    setExposed({
      role: control.getAttribute('role') ?? 'none',
      name: control.textContent?.trim() ?? '',
      checked: control.getAttribute('aria-checked') ?? 'none',
    });
  }, [on]);

  const readout = (
    <dl className="ex-show-and-expose-readout">
      <div>
        <dt>Role</dt>
        <dd>{exposed?.role}</dd>
      </div>
      <div>
        <dt>Name</dt>
        <dd>{exposed?.name}</dd>
      </div>
      <div>
        <dt>Checked</dt>
        <dd>{exposed?.checked}</dd>
      </div>
    </dl>
  );

  return (
    <Example hint="Turn the switch on. The readout shows what assistive technology reads from it." controls={readout}>
      <div className="ex-show-and-expose-body" ref={bodyRef}>
        <Switch label="Notifications" checked={on} onChange={setOn} />
        <div
          className="ex-show-and-expose-collapse"
          data-open={on}
          inert={!on}
          style={{ '--dur': reducedMotion ? '0ms' : `${morphDuration(height)}ms` } as CSSProperties}
        >
          <div className="ex-show-and-expose-clip">
            <ul className="ex-show-and-expose-list" ref={listRef}>
              {NOTICES.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Example>
  );
}
