import type { TableColumn } from 'humane-system';
import './prop-list.css';

type Props<T> = {
  /** Names the reference list for assistive technology. The visible "Props" heading sits above it. */
  caption: string;
  /** Prop, type, and meaning columns, in that order. */
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
};

/**
 * Props are definitions, not a data table. Each prop is one term with two definitions: its type and its meaning.
 * The visual order is prop and type on one line, meaning below; the DOM order is a real dl, dt, dd sequence.
 */
export function PropList<T>({ caption, columns, rows, rowKey }: Props<T>) {
  const [prop, type, meaning] = columns;
  if (!prop || !type || !meaning) throw new Error('PropList needs prop, type, and meaning columns.');

  return (
    <dl className="doc-definitions" aria-label={caption}>
      {rows.map((row) => (
        <div className="doc-definition" key={rowKey(row)}>
          <dt className="doc-definition-term">{prop.render(row)}</dt>
          <dd className="doc-definition-type">
            <span className="visually-hidden">Type: </span>
            {type.render(row)}
          </dd>
          <dd className="doc-definition-meaning">
            <span className="visually-hidden">Meaning: </span>
            {meaning.render(row)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
