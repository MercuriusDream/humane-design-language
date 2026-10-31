import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Surface, growFrom, usePreferences } from 'humane-system';
import './analytics-notice.css';

const DISMISSED_KEY = 'humane-analytics-notice-dismissed';

/** Site analytics disclosure. It never takes focus or presents dismissal as a privacy choice. */
export function AnalyticsNotice() {
  const { reducedMotion } = usePreferences();
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) !== 'true'; } catch { return true; }
  });
  const [closing, setClosing] = useState(false);
  const noticeRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reopen = useRef(false);

  useLayoutEffect(() => {
    const notice = noticeRef.current;
    if (!visible || closing || !notice) return;
    const morph = growFrom(notice, reopen.current ? triggerRef.current : null, reducedMotion);
    reopen.current = false;
    return () => morph?.cancel();
    // A preference change does not replay an already visible notice.
  }, [visible, closing]);

  const dismiss = () => {
    if (closing) return;
    try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* The notice still closes for this session. */ }
    const notice = noticeRef.current;
    if (!notice) return setVisible(false);
    const returnFocus = notice.contains(document.activeElement);
    setClosing(true);
    const fade = notice.animate(
      [{ opacity: getComputedStyle(notice).opacity }, { opacity: 0 }],
      { duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
    fade.onfinish = () => {
      if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
      setVisible(false);
      setClosing(false);
    };
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, closing]);

  return (
    <>
      <footer className="landing-foot">
        <Button ref={triggerRef} variant="quiet" size="compact" onClick={() => {
          reopen.current = true;
          setVisible(true);
        }}>
          Analytics information
        </Button>
      </footer>
      {visible && <div className="landing-analytics-reserve" aria-hidden="true" />}
      {visible && (
        <Surface ref={noticeRef} className="landing-analytics" depth={0} plane="raised" aria-label="Analytics">
          <h2 className="landing-analytics-title">Analytics</h2>
          <p className="landing-analytics-text">
            We use <a href="https://developers.cloudflare.com/web-analytics/">Cloudflare Web Analytics</a>.
          </p>
          <Button size="compact" onClick={dismiss} disabled={closing}>Dismiss</Button>
        </Surface>
      )}
    </>
  );
}
