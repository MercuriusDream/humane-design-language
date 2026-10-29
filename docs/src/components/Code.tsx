import { Fragment } from 'react';

/** A prop name or type from a props table. A long token without spaces, such as HTMLAttributes<HTMLElement> or
 *  useUndoableList(initial), may break after "<" and before "(" when the line is too narrow, never inside a word. */
export function TypeCode({ children }: { children: string }) {
  const parts = children.split(/(?<=\w<)|(?<=\w)(?=\()/);
  return (
    <code>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </code>
  );
}

/** An attribute or class name in prose, such as aria-invalid. It never breaks at its hyphen. */
export function Name({ children }: { children: string }) {
  return <code className="doc-name">{children}</code>;
}
