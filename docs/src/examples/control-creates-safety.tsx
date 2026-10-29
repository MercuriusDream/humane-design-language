import { useState } from 'react';
import { Example } from '../components/Example';
import { Button } from 'humane-system';
import './control-creates-safety.css';

type Task = { id: string; name: string };

const TASKS: Task[] = [
  { id: 'plants', name: 'Water the plants' },
  { id: 'letter', name: 'Reply to the landlord' },
  { id: 'film', name: 'Drop off two rolls of film' },
  { id: 'bike', name: 'Fix the back brake' },
];

/**
 * Control creates safety. The list changes only when the user presses. A removed row keeps its
 * place and its Undo button, so every change can be reversed without a confirmation.
 */
export default function ControlCreatesSafety() {
  const [removed, setRemoved] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  const toggle = (task: Task) => {
    if (removed.includes(task.id)) {
      setRemoved((all) => all.filter((id) => id !== task.id));
      setAnnouncement(`Restored ${task.name}.`);
    } else {
      setRemoved((all) => [...all, task.id]);
      setAnnouncement(`Removed ${task.name}. Undo is available.`);
    }
  };

  const restoreAll = () => {
    if (removed.length === 0) return;
    setRemoved([]);
    setAnnouncement('All tasks restored.');
  };

  return (
    <Example
      hint="Nothing leaves the list unless you press Remove. Every removal keeps its Undo, and Restore all brings back the whole list."
      controls={
        <Button size="compact"
          className="ex-control-creates-safety-restore"
          onClick={restoreAll}
          aria-disabled={removed.length === 0}
        >
          Restore all
        </Button>
      }
    >
      <ul className="ex-control-creates-safety-list" aria-label="Tasks">
        {TASKS.map((task) => {
          const isRemoved = removed.includes(task.id);
          return (
            <li key={task.id} className="ex-control-creates-safety-row" data-removed={isRemoved}>
              <span className="ex-control-creates-safety-label">
                {task.name}
              </span>
              <Button depth={2} onClick={() => toggle(task)}>
                <span className="ex-control-creates-safety-action">
                  <span style={{ visibility: isRemoved ? 'hidden' : 'visible' }} aria-hidden={isRemoved}>Remove</span>
                  <span style={{ visibility: isRemoved ? 'visible' : 'hidden' }} aria-hidden={!isRemoved}>Undo</span>
                </span>
                <span className="ex-control-creates-safety-sr"> {task.name}</span>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="ex-control-creates-safety-sr" aria-live="polite">
        {announcement}
      </p>
    </Example>
  );
}
