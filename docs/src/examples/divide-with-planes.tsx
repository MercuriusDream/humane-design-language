import { useId, useState, type ReactNode } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch, type Plane } from 'humane-system';
import './divide-with-planes.css';

const GROUPS = [
  {
    id: 'notifications',
    title: 'Notifications',
    settings: [
      { id: 'email', label: 'Email updates' },
      { id: 'mentions', label: 'Mentions' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    settings: [
      { id: 'activity', label: 'Show activity' },
      { id: 'profile', label: 'Public profile' },
    ],
  },
];

const DEFAULTS: Record<string, boolean> = { email: true, mentions: true, activity: false, profile: false };

/** Separates groups with planes of different lightness. The same groups can be divided by 1px lines instead, with identical gaps. */
export default function DivideWithPlanes() {
  const [lines, setLines] = useState(false);
  const [values, setValues] = useState(DEFAULTS);

  const setValue = (id: string, checked: boolean) => setValues((current) => ({ ...current, [id]: checked }));

  return (
    <Example
      hint="Switch to lines to compare. The same settings, divided by 1px rules instead of planes."
      controls={<Switch size="compact" label="Divide with lines" checked={lines} onChange={setLines} />}
    >
      <div className="ex-divide-with-planes-panel" data-divide={lines ? 'lines' : 'planes'}>
        {GROUPS.map((group) => (
          <Group key={group.id} title={group.title} plane={lines ? 'none' : 'raised'}>
            <div className="ex-divide-with-planes-rows">
              {group.settings.map((setting) => (
                <Switch
                  key={setting.id}
                  label={setting.label}
                  checked={values[setting.id]}
                  onChange={(checked) => setValue(setting.id, checked)}
                />
              ))}
            </div>
          </Group>
        ))}
      </div>
    </Example>
  );
}

type GroupProps = {
  title: string;
  plane: Plane;
  children: ReactNode;
};

/** A group is a section with a name. Its division from the other groups comes from the plane or the line, not from its own border. */
function Group({ title, plane, children }: GroupProps) {
  const headingId = useId();
  return (
    <Surface as="section" depth={1} plane={plane} className="ex-divide-with-planes-section" aria-labelledby={headingId}>
      <h4 id={headingId} className="ex-divide-with-planes-heading">
        {title}
      </h4>
      {children}
    </Surface>
  );
}
