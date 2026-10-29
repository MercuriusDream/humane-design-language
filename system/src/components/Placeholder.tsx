import { useEffect, useState, type ReactNode } from 'react';
import './placeholder.css';

export type PlaceholderProps = {
  ready: boolean;
  /** Decorative bars over the reserved footprint. */
  lines?: number;
  /** Authoritative viewport height in both states; overflowing content remains scrollable. */
  height?: number;
  /** Keep final-geometry children mounted while loading, or provide height when dimensions are unknown. */
  children?: ReactNode;
  /** Optional polite completion announcement. */
  readyAnnouncement?: string;
};

/** Reserves known content geometry; unknown dimensions require an explicit reserved height from the caller. */
export function Placeholder({ ready, lines = 3, height, children, readyAnnouncement }: PlaceholderProps) {
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => setAnnouncement(ready ? readyAnnouncement ?? '' : ''), [ready, readyAnnouncement]);
  const count = Number.isFinite(lines) ? Math.max(1, Math.round(lines)) : 3;
  return (
    <div className="h-placeholder-field">
      <div className="h-placeholder" aria-busy={!ready} data-fixed={height !== undefined || undefined} style={{ height }}>
        <div className="h-placeholder-content" data-ready={ready} inert={!ready} aria-hidden={!ready} tabIndex={height !== undefined && ready ? 0 : undefined} role={height !== undefined ? 'region' : undefined} aria-label={height !== undefined ? 'Loaded content' : undefined}>
          {children}
        </div>
        <div className="h-placeholder-shape" data-ready={ready} aria-hidden="true">
          <div className="h-placeholder-lines">
            {Array.from({ length: count }, (_, i) => <div key={i} className="h-placeholder-line" />)}
          </div>
        </div>
      </div>
      <span className="h-placeholder-sr" role="status">{announcement}</span>
    </div>
  );
}
