import type { ReactNode } from 'react';
import { Surface } from './Surface';
import './notice.css';

/** Tone of a notice: neutral by default, danger for an error. Serves: Words are for intent, commands, and errors. */
export type NoticeTone = 'neutral' | 'danger';

/** Props of Notice. Serves: Words are for intent, commands, and errors. */
export type NoticeProps = {
  /** neutral: the default. danger: the title alone is set in the signal color, for an error. */
  tone?: NoticeTone;
  /** What happened, in words. */
  title: string;
  /** The body: what happened and what the user can do next. */
  children?: ReactNode;
  /** An action placed under the words, such as a Button. */
  action?: ReactNode;
};

/**
 * An inline message in words. A depth 1 plane is the only boundary: no icon, badge, or colored block.
 * Serves: Arrive quietly. It is announced politely, without taking focus or interrupting input.
 */
export function Notice({ tone = 'neutral', title, children, action }: NoticeProps) {
  // Empty slots render no wrapper, so they add no gap.
  const hasBody = children != null && children !== false && children !== '';
  const hasAction = action != null && action !== false && action !== '';
  return (
    <Surface depth={1} plane="raised" role="status" aria-live="polite" className="h-notice" data-tone={tone}>
      <div className="h-notice-title">{title}</div>
      {hasBody && <div className="h-notice-body">{children}</div>}
      {hasAction && <div className="h-notice-action">{action}</div>}
    </Surface>
  );
}
