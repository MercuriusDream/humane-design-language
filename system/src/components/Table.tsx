import type { ReactNode } from 'react';
import './table.css';

/** One column of a dense table. Serves the line rule: lines only for repeated rows. */
export type TableColumn<T> = {
  key: string;
  header: string;
  /** end: numbers and other values that align by their last digit. */
  align?: 'start' | 'end';
  render: (row: T) => ReactNode;
  /** Any CSS width, for example "120px" or "30%". */
  width?: string;
};

/** Props for Table. Serves the grouping rule: rows are the repetition, so the table holds only rows and columns. */
export type TableProps<T> = {
  /** Visually hidden, but present for assistive technology. */
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
};

/**
 * Dense data, separated by lines because the rows repeat too densely for whitespace alone.
 * No stripes and no outer border. The wrapper scrolls sideways so the page never does.
 */
export function Table<T>({ caption, columns, rows, rowKey }: TableProps<T>) {
  return (
    <div className="h-table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="h-table">
        <caption className="h-table-caption">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                data-align={column.align ?? 'start'}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} data-align={column.align ?? 'start'}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
