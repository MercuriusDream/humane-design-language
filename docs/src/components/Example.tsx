import type { ReactNode } from 'react';
import './example.css';

type Props = {
  /** A short instruction placed beside the controls, never below the example. */
  hint?: string;
  controls?: ReactNode;
  /** No surface of its own, for examples whose specimen is itself a root. */
  bare?: boolean;
  children: ReactNode;
};

/** The frame every rule's example sits in. It is a root surface, so its children are at depth 1. */
export function Example({ hint, controls, bare = false, children }: Props) {
  const side = Boolean(hint || controls);
  return (
    <figure className="example" data-root={!bare || undefined} data-bare={bare || undefined} data-side={side || undefined}>
      {side && (
        <div className="example-controls">
          {hint && <p className="example-hint">{hint}</p>}
          {controls}
        </div>
      )}
      <div className="example-body">{children}</div>
    </figure>
  );
}
