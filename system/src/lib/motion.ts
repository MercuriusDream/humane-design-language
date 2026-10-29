const FLOOR_MS = 40;
const CEILING_MS = 300;
const SCALE = 2.4;
const EXPONENT = 0.75;

/**
 * Duration grows with the change in pixels raised to 0.75, between a floor and a ceiling.
 * Small changes are near instant; a change ten times larger still takes about three times longer.
 */
export function morphDuration(sizePx: number): number {
  return Math.min(CEILING_MS, Math.round(FLOOR_MS + SCALE * Math.abs(sizePx) ** EXPONENT));
}
