import { useEffect, useId, useLayoutEffect, useRef, type PointerEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { growFrom } from '../lib/morph';
import { usePreferences } from '../preferences';
import { Button } from './Button';
import './dialog.css';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Rendered at the end of the dialog, in a row. */
  actions?: ReactNode;
  /** The trigger. The dialog grows out of it on open, shrinks back into it on close, and focus returns to it. */
  origin?: HTMLElement | null;
};

const isEmpty = (node: ReactNode) => node == null || typeof node === 'boolean';

/**
 * A modal that grows out of the control that opened it and returns into it. It is one object in both
 * states, so the user can follow where it came from. Escape and the close button always dismiss it.
 */
export function Dialog({ open, onClose, title, children, actions, origin = null }: DialogProps) {
  const { reducedMotion } = usePreferences();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);
  const pressOnScrimRef = useRef(false);
  const titleId = useId();

  // Effects read the latest props here, so they run only when `open` changes.
  const latest = useRef({ open, origin, reducedMotion });
  useLayoutEffect(() => {
    latest.current = { open, origin, reducedMotion };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;

    if (open) {
      if (dialog.open) {
        // Still closing: play the morph back to open from wherever it is. Already open is a no-op,
        // which also covers effects that React runs twice in development.
        if (closingRef.current) {
          closingRef.current = false;
          animationRef.current?.reverse();
        }
        return;
      }
      dialog.showModal();
      closingRef.current = false;
      animationRef.current = growFrom(panel, latest.current.origin, latest.current.reducedMotion);
      return;
    }

    if (!dialog.open || closingRef.current) return;
    closingRef.current = true;

    const finish = () => {
      // A reversal interrupted by re-opening must not close the dialog.
      if (latest.current.open || !closingRef.current) return;
      closingRef.current = false;
      animationRef.current = null;
      dialog.close();
      latest.current.origin?.focus();
    };

    const animation = animationRef.current;
    if (animation) {
      animation.onfinish = finish;
      animation.reverse();
    } else {
      finish();
    }
  }, [open]);

  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // Escape always reaches the parent, which decides to close by setting open to false.
    event.preventDefault();
    onClose();
  };

  // A close the parent did not request (for example a form inside the dialog) is still reported.
  const onNativeClose = () => {
    if (latest.current.open) onClose();
  };

  // The dialog element is the full-viewport scrim. A drag that starts in the panel and ends on the
  // scrim is not a backdrop click, so the press must also start on the scrim.
  const onBackdropPointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    pressOnScrimRef.current = event.target === event.currentTarget;
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (pressOnScrimRef.current && event.target === event.currentTarget) onClose();
    pressOnScrimRef.current = false;
  };

  return (
    <dialog
      ref={dialogRef}
      className="h-dialog"
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClose={onNativeClose}
      onPointerDown={onBackdropPointerDown}
      onClick={onBackdropClick}
    >
      <div className="h-dialog-panel" data-root ref={panelRef}>
        <div className="h-dialog-header">
          <h2 className="h-dialog-title" id={titleId}>
            {title}
          </h2>
          <Button variant="quiet" className="h-dialog-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </Button>
        </div>
        {!isEmpty(children) && <div className="h-dialog-body">{children}</div>}
        {!isEmpty(actions) && <div className="h-dialog-actions">{actions}</div>}
      </div>
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg className="h-dialog-close-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
