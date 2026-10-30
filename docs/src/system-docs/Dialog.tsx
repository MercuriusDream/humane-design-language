import { useState, type MouseEvent } from 'react';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import { Button, Dialog, TextField, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import './dialog.css';

type Variant = 'rename' | 'delete' | 'notice';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'open',
    type: 'boolean',
    meaning:
      'Whether the dialog is open. The component is controlled: it opens and closes only when this changes, and it reports every request to close through onClose.',
  },
  {
    prop: 'onClose',
    type: '() => void',
    meaning:
      'Called when the user asks to close it: Escape, the close control, a press on the scrim, or a native close. The parent decides by setting open to false.',
  },
  {
    prop: 'title',
    type: 'string',
    meaning: 'The visible heading. It is also the accessible name of the dialog.',
  },
  {
    prop: 'children',
    type: 'ReactNode',
    meaning: 'The body. Nothing is rendered for an empty body.',
  },
  {
    prop: 'actions',
    type: 'ReactNode',
    meaning: 'Buttons placed at the end of the dialog, in a row. Nothing is rendered when empty.',
  },
  {
    prop: 'origin',
    type: 'HTMLElement | null',
    meaning:
      'The trigger. The dialog grows out of it on open, shrinks back into it on close, and focus returns to it. Without an origin it fades in place.',
  },
];

const PROP_COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '20%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '30%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/** Dialog serves the motion rules: it is one object that grows out of its trigger and returns into it. */
export default function DialogDoc() {
  const [active, setActive] = useState<Variant | null>(null);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);
  const [projectName, setProjectName] = useState('Studio archive');
  // The rename field edits a draft, so Cancel leaves the project name as it was.
  const [draftName, setDraftName] = useState(projectName);
  const [result, setResult] = useState('');

  const open = (variant: Variant) => (event: MouseEvent<HTMLButtonElement>) => {
    setOrigin(event.currentTarget);
    setResult('');
    setDraftName(projectName);
    setActive(variant);
  };

  const close = () => setActive(null);

  const save = () => {
    setProjectName(draftName);
    setResult(`Renamed to ${draftName}.`);
    close();
  };

  const remove = () => {
    setResult('Project deleted.');
    close();
  };

  return (
    <>
      <p className="rule-text">
        A modal that grows out of the control that opened it and shrinks back into that control when it closes. It is
        one object in both states, so the user can follow where it came from and where it went.
      </p>
      <Serves
        rules={[
          'new-things-grow-from-their-trigger',
          'removed-things-go-somewhere',
          'never-take-control-from-the-user',
          'reduced-motion-keeps-continuity',
          'focus-is-a-signal-not-a-separator',
          'show-and-expose',
        ]}
      />

      <Example hint="Open a dialog. It grows out of the button you pressed and shrinks back into it on close. Press Escape while it grows to see it reverse from where it is.">
        <div className="doc-dialog-stage">
          <div className="doc-dialog-triggers">
            <Button depth={1} onClick={open('rename')}>
              Rename
            </Button>
            <Button depth={1} onClick={open('delete')}>
              Delete
            </Button>
            <Button depth={1} onClick={open('notice')}>
              Export notice
            </Button>
          </div>
          <p className="doc-dialog-result" aria-live="polite">
            {result || 'Nothing changed yet.'}
          </p>
        </div>

        <Dialog
          open={active === 'rename'}
          onClose={close}
          origin={origin}
          title="Rename project"
          actions={
            <>
              <Button depth={1} onClick={close}>
                Cancel
              </Button>
              <Button depth={1} variant="strong" onClick={save}>
                Save
              </Button>
            </>
          }
        >
          <TextField label="Project name" value={draftName} onChange={setDraftName} />
        </Dialog>

        <Dialog
          open={active === 'delete'}
          onClose={close}
          origin={origin}
          title="Delete this project?"
          actions={
            <>
              <Button depth={1} onClick={close}>
                Cancel
              </Button>
              <Button depth={1} variant="danger" onClick={remove}>
                Delete
              </Button>
            </>
          }
        >
          <p>The 14 photos in this project will be deleted from this device. This cannot be undone.</p>
        </Dialog>

        <Dialog open={active === 'notice'} onClose={close} origin={origin} title="Export finished">
          <p>40 photos saved to Downloads.</p>
        </Dialog>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList<PropRow>
        caption="Props of Dialog"
        columns={PROP_COLUMNS}
        rows={PROPS}
        rowKey={(row) => row.prop}
      />
    </>
  );
}
