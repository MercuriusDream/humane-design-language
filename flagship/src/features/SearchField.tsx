import { useEffect, useRef, useState } from 'react';
import { TextField } from 'humane-system';
import { lettersIn, useMail } from '../store';
import './search-field.css';

/** Pause after typing before the count is announced. */
const ANNOUNCE_DELAY_MS = 400;

/** The result count in words. Serves: Words are for intent, commands, and errors. */
function matchMessage(count: number): string {
  if (count === 0) return 'No letters match';
  return `${count} letters match`;
}

/**
 * Searches the current mailbox in place. The list filters as the user types, and the count is
 * announced politely once typing pauses. Serves: Arrive quietly, Show and expose.
 */
export function SearchField() {
  const { state, dispatch } = useMail();
  const count = lettersIn(state, state.mailbox).length;
  const [announcement, setAnnouncement] = useState('');
  // The query the user typed last. Set only by typing, so a mailbox change or an arrival never
  // announces a count: the query no longer matches what was typed, or nothing was typed.
  const typedQuery = useRef<string | null>(null);

  useEffect(() => {
    if (typedQuery.current === null || typedQuery.current !== state.query) return;
    const timer = setTimeout(() => {
      typedQuery.current = null;
      setAnnouncement(matchMessage(count));
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.query, count]);

  const onChange = (query: string) => {
    typedQuery.current = query;
    dispatch({ type: 'setQuery', query });
  };

  return (
    <div className="search-field" role="search">
      {/* The label is hidden by search-field.css. It stays in the tree, so the field keeps its name. */}
      <TextField
        label="Search letters"
        type="search"
        value={state.query}
        onChange={onChange}
        placeholder="Search"
        autoComplete="off"
      />
      {/* Always mounted, so each announcement is a change in a live region. */}
      <p className="search-field-visually-hidden" role="status">
        {announcement}
      </p>
    </div>
  );
}
