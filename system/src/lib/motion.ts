const FLOOR_MS = 48;
const CEILING_MS = 360;
const SCALE = 3;
const EXPONENT = 0.75;

/**
 * Duration grows with the change in pixels raised to 0.75, between a floor and a ceiling.
 * Small changes are near instant; a change ten times larger still takes about three times longer.
 */
export function morphDuration(sizePx: number): number {
  return Math.min(CEILING_MS, Math.round(FLOOR_MS + SCALE * Math.abs(sizePx) ** EXPONENT));
}

/**
 * Evaluates cubic-bezier(0.2, 0, 0, 1) at normalized time u in [0, 1].
 * Returns eased progress in [0, 1] and the derivative dY/du.
 */
export function morphBezier(u: number): { value: number; slope: number } {
  if (u <= 0) return { value: 0, slope: 0 };
  if (u >= 1) return { value: 1, slope: 0 };
  let s = u;
  for (let i = 0; i < 6; i++) {
    const x = ((1.6 * s - 1.2) * s + 0.6) * s - u;
    const dx = (4.8 * s - 2.4) * s + 0.6;
    s = Math.min(1, Math.max(0, s - x / dx));
  }
  const value = (3 - 2 * s) * s * s;
  const dy = 6 * s * (1 - s);
  const dx = (4.8 * s - 2.4) * s + 0.6;
  return { value, slope: dy / dx };
}

export type MorphChannel = {
  /** Offset at normalized time u in [0, 1], reaching 0 at u = 1. */
  at(u: number): number;
  /** Instantaneous velocity in units/ms at normalized time u in [0, 1]. */
  velocity(u: number): number;
};

/**
 * Builds a 1D trajectory from initial offset `from` (at u = 0) to 0 (at u = 1) over `durationMs`.
 * From rest (`velocityPerMs === 0`), follows cubic-bezier(0.2, 0, 0, 1).
 * When redirected mid-flight (`velocityPerMs !== 0`), follows a cubic Hermite spline that preserves
 * both initial position and initial velocity, settling at 0 with zero velocity.
 */
export function morphChannel(from: number, velocityPerMs: number, durationMs: number): MorphChannel {
  if (durationMs <= 0 || (from === 0 && velocityPerMs === 0)) {
    return { at: () => 0, velocity: () => 0 };
  }
  if (velocityPerMs === 0) {
    return {
      at: (u: number) => (u <= 0 ? from : u >= 1 ? 0 : from * (1 - morphBezier(u).value)),
      velocity: (u: number) => (u <= 0 || u >= 1 ? 0 : (-from * morphBezier(u).slope) / durationMs),
    };
  }
  const m0 = velocityPerMs * durationMs;
  return {
    at: (u: number) => {
      if (u <= 0) return from;
      if (u >= 1) return 0;
      const u2 = u * u;
      const h00 = (2 * u - 3) * u2 + 1;
      const h10 = (u - 2) * u2 + u;
      return h00 * from + h10 * m0;
    },
    velocity: (u: number) => {
      if (u <= 0) return velocityPerMs;
      if (u >= 1) return 0;
      const dh00 = 6 * u * (u - 1);
      const dh10 = (3 * u - 4) * u + 1;
      return (dh00 * from + dh10 * m0) / durationMs;
    },
  };
}
