import { useState } from 'react';
import { Button, Dialog, Menu, Surface, Switch, type MenuItem } from 'humane-system';
import { Example } from '../components/Example';
import './new-things-grow-from-their-trigger.css';

const PHOTOS = [
  'Breakwater',
  'Ferry lights',
  'Harbor wall',
  'Last boat',
  'Gulls on the pier',
  'Fish market',
  'Lighthouse',
  'Tide line',
];

/** Each new surface grows out of the control that caused it, and closes back into that control. */
export default function NewThingsGrowFromTheirTrigger() {
  // The trigger's element is stored in state by a callback ref, so the Dialog never reads a ref during render.
  const [shareOrigin, setShareOrigin] = useState<HTMLButtonElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [anyone, setAnyone] = useState(false);
  const [last, setLast] = useState('8 photos');

  const items: MenuItem[] = [
    { id: 'rename', label: 'Rename', onSelect: () => setLast('8 photos. Last action: Rename.') },
    { id: 'duplicate', label: 'Duplicate', onSelect: () => setLast('8 photos. Last action: Duplicate.') },
    { id: 'delete', label: 'Delete', danger: true, onSelect: () => setLast('8 photos. Last action: Delete.') },
  ];

  return (
    <Example hint="Press a button. The dialog and the menu grow out of it and close back into it.">
      <Surface depth={1} className="ex-new-things-grow-from-their-trigger-album">
        <div className="ex-new-things-grow-from-their-trigger-head">
          <div className="ex-new-things-grow-from-their-trigger-text">
            <h4 className="ex-new-things-grow-from-their-trigger-title">Harbor at dusk</h4>
            <p className="ex-new-things-grow-from-their-trigger-result" aria-live="polite">
              {last}
            </p>
          </div>
          <div className="ex-new-things-grow-from-their-trigger-actions">
            <Button ref={setShareOrigin} depth={2} aria-haspopup="dialog" onClick={() => setShareOpen(true)}>
              Share album
            </Button>
            <Menu label="Actions" items={items} depth={2} align="end" />
          </div>
        </div>
        {/* The photos fill the room the menu needs below its trigger, so the menu opens over the album. */}
        <ul className="ex-new-things-grow-from-their-trigger-photos" aria-label="Photos">
          {PHOTOS.map((photo) => (
            <li key={photo} className="ex-new-things-grow-from-their-trigger-photo" aria-label={photo}>
              <svg viewBox="0 0 48 48" width="40%" height="40%" aria-hidden="true" focusable="false">
                <circle cx="34" cy="16" r="5" fill="currentColor" />
                <path d="M0 48 L16 24 L26 36 L32 28 L48 48 Z" fill="currentColor" />
              </svg>
            </li>
          ))}
        </ul>
      </Surface>
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share album"
        origin={shareOrigin}
        actions={
          <Button variant="strong" onClick={() => setShareOpen(false)}>
            Done
          </Button>
        }
      >
        <Switch label="Anyone with the link can view" checked={anyone} onChange={setAnyone} />
      </Dialog>
    </Example>
  );
}
