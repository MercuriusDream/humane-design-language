import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, EASE_MORPH, Surface, growFrom, usePreferences } from 'humane-system';
import './analytics-notice.css';

const DISMISSED_KEY = 'humane-analytics-notice-dismissed';

/** Site analytics disclosure: one pop-up at the bottom, gone once dismissed. It never takes focus or presents dismissal as a privacy choice. */
export function AnalyticsNotice() {
  const { reducedMotion } = usePreferences();
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) !== 'true'; } catch { return true; }
  });
  const [closing, setClosing] = useState(false);
  const noticeRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const notice = noticeRef.current;
    if (!visible || closing || !notice) return;
    const morph = growFrom(notice, null, reducedMotion);
    return () => morph?.cancel();
    // A preference change does not replay an already visible notice.
  }, [visible, closing]);

  const dismiss = () => {
    if (closing) return;
    try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* The notice still closes for this session. */ }
    const notice = noticeRef.current;
    if (!notice) return setVisible(false);
    setClosing(true);
    const styles = getComputedStyle(notice);
    const fade = notice.animate(
      [{ opacity: styles.opacity }, { opacity: 0 }],
      // A standalone fade: --dur-fade on the system's curve, read from the tokens.
      { duration: parseFloat(styles.getPropertyValue('--dur-fade')) || 180, easing: EASE_MORPH },
    );
    fade.onfinish = () => {
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
