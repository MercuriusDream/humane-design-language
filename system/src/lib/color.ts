type RGB = [number, number, number];

/** OKLCH lightness of an opaque computed CSS color, or null for an unsupported format. */
export function oklchLightness(color: string): number | null {
  const parsed = components(color);
  if (parsed && (parsed.space === 'oklch' || parsed.space === 'oklab')) {
    return channel(parsed.values[0], 1);
  }
  const rgb = linearRGB(color);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

/** WCAG ratio for ideal achromatic colors (chroma zero), not for hue-bearing palette colors. */
export function neutralContrast(a: number, b: number): number {
  return luminanceContrast(a ** 3, b ** 3);
}

/** WCAG luminance after conversion and clipping to linear sRGB. For out-of-gamut colors, also check browser-rendered pixels. Resolve transparency first. */
export function relativeLuminance(color: string): number | null {
  const rgb = linearRGB(color);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => Math.max(0, Math.min(1, c)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast of two opaque CSS colors, or null rather than certifying an unsupported color. */
export function colorContrast(a: string, b: string): number | null {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return first === null || second === null ? null : luminanceContrast(first, second);
}

function luminanceContrast(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function channel(value: string, percentScale: number): number {
  return value.endsWith('%') ? Number(value.slice(0, -1)) * percentScale / 100 : Number(value);
}

function components(color: string) {
  const match = color.trim().toLowerCase().match(/^(oklch|oklab|rgba?|color)\((.+)\)$/);
  if (!match) return null;
  const values = match[2].trim().split(/[\s,/]+/);
  let space = match[1];
  if (space === 'color') space = values.shift() ?? '';
  // Transparent colors require a backdrop; ignoring their alpha would give a false pass.
  if (values.length === 4 && channel(values.pop()!, 1) !== 1) return null;
  if (values.length !== 3 || values.some((v) => !Number.isFinite(channel(v, 1)))) return null;
  return { space, values };
}

function linearRGB(color: string): RGB | null {
  const parsed = components(color);
  if (!parsed) return null;
  const { space, values } = parsed;
  if (space === 'rgb' || space === 'rgba') {
    return values.map((v) => toLinear(channel(v, 255) / 255)) as RGB;
  }
  if (space === 'srgb' || space === 'srgb-linear') {
    return values.map((v) => space === 'srgb' ? toLinear(channel(v, 1)) : channel(v, 1)) as RGB;
  }
  if (space !== 'oklch' && space !== 'oklab') return null;
  const L = channel(values[0], 1);
  let a = channel(values[1], 0.4);
  let b = channel(values[2], 0.4);
  if (space === 'oklch') {
    const hue = Number(values[2]) * Math.PI / 180;
    b = a * Math.sin(hue);
    a *= Math.cos(hue);
  }
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
