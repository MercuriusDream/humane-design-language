import { Button, UndoableList, useUndoableList } from 'humane-system';
import { Example } from '../components/Example';

const INITIAL = [
  { id: 'plants', name: 'Water the plants' },
  { id: 'letter', name: 'Reply to the landlord' },
  { id: 'film', name: 'Drop off two rolls of film' },
  { id: 'bike', name: 'Fix the back brake' },
  { id: 'call', name: 'Call about the lease' },
];

/** The production undo primitive keeps each target stable and reverses settlement when interaction returns. */
export default function UndoList() {
  const list = useUndoableList(INITIAL);
  return (
    <Example
      hint="Remove a few tasks in a row. The list does not shift until you move away from it."
      controls={<Button size="compact" onClick={() => list.restoreAll()}>Restore all</Button>}
    >
      <UndoableList label="Tasks" {...list} renderLabel={(task) => task.name} empty="No tasks." />
    </Example>
  );
}
