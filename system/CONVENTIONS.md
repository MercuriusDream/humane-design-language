# Humane Design System: component conventions

Components in `system/src/components/` follow these rules and the system specification in [README.md](README.md). They turn the language in [../LANGUAGE.md](../LANGUAGE.md) into code.

## Files

- One component per pair: `PascalName.tsx` and `kebab-name.css`, both in `system/src/components/`.
- The `.tsx` file imports its own stylesheet: `import './kebab-name.css';`.
- Named exports only. Export the component, its props type when callers need it, and any hook it needs.
- Export new public components from [`src/index.ts`](src/index.ts). Foundation changes in `src/styles/*` or `src/lib/*` require corresponding documentation and regression checks. Compose existing components where possible.
- React 19 function components, TypeScript strict. No new dependencies.
- Comments are sparse: a one-line doc comment on each export saying which rule it serves, and short comments only where the reason is not obvious.

## Class names

- Every class starts with `h-` and the component's kebab name: `h-dialog`, `h-dialog-title`.
- State goes in attributes, not extra classes: `data-open`, `data-depth`, `aria-expanded`, `aria-checked`.

## Tokens (from [`src/styles/tokens.css`](src/styles/tokens.css))

Use these custom properties (full tables and derivations in [README.md](README.md)). Never write a raw color, and never write a font size outside the type tokens.

- Planes: `--plane-sunken`, `--plane-base`, `--plane-raised`, `--plane-fill`, `--plane-control`, `--plane-control-hover`, `--plane-control-active`, `--plane-selected`.
- Ink: `--ink-1` (essential), `--ink-2` (supporting), `--ink-3` (tertiary), `--ink-boundary` (3:1 control boundary), `--ink-inverse` (text on ink fill).
- Signals: `--signal-focus`, `--signal-danger` (errors and destructive actions only).
- Strokes: `--line` (dense-repetition separator), `--stroke` (1px standard, 2px high contrast), `--focus-width` (2px standard, 3px high contrast).
- Radius and padding by depth: `--radius-root`, `--radius-floor`, `--radius-1`, `--radius-2`, `--radius-control-max`, and `--pad-0`, `--pad-1`, `--pad-2`.
- Spacing: `--space-1` (4px) through `--space-9` (96px), with named aliases `--gap-tight`, `--gap-within`, `--gap-between`, `--gap-heading-below`, and `--gap-section`. Every authored vertical gap, margin, and padding uses a scale step. Do not combine a parent's `gap` with a positive child `margin` for the same pair. Component-derived geometry (a choice row's height minus its line box, a mark's offset, or `CLOSED_CHROME` in [`src/components/Sidebar.tsx`](src/components/Sidebar.tsx)) stays in a local custom property and publishes any offset a consumer must cancel (`--h-choice-row-pad`, `--h-choice-mark-pad`, `--h-slider-row-pad`).
- Type: `font: var(--text-display | --text-title | --text-heading | --text-lead | --text-body | --text-small | --text-label)`, with `--tracking-display | --tracking-title | --tracking-heading` (all `0`) and `--font-code` for code. `font-weight: 600` is allowed only on a body or small role that names an action, a disclosure title, an unread item, or an in-frame heading; comment it. Never set a selected option to 600.
- Control tiers: standard (`--control-height`, `--text-body`, `--inset-control`) and compact (`--control-height-compact`, `--text-small`, `--inset-control-compact`). Controls that can sit in a panel take `size?: 'standard' | 'compact'` (`ControlSize` from [`src/components/Button.tsx`](src/components/Button.tsx)), rendered as `data-size`. Where a control pads around a line, pad by `calc((height - 1lh) / 2)` so a single line makes the exact tier height. Checkbox and RadioGroup share `--choice-mark` / `--choice-mark-compact` and `--choice-gap` / `--choice-gap-compact`.

## Shape

- Floating surfaces (dialog, menu, popover, sidebar) are roots: put `data-root` on them (`rootRadius.ts` caps their corner at 2px) and use `var(--pad-0)`.
- Surfaces inside a root take `depth?: 1 | 2` (`var(--radius-1)`, `var(--radius-2)`). `Surface` does not infer nesting: callers pass each nested depth.
- Corner shapes follow [README.md section 3](README.md#3-space): 2px on surfaces and independent controls, 0 on options and indicators inside a 2px track, `50%` on marks, and a pill only on the switch track.
- Insets are measured to the ink: set `text-box: trim-both cap alphabetic` on padded boxes whose edge text is in normal flow, and `trim-start` / `trim-end` on edge text inside grid or flex items.
- Separate regions with planes, not lines. Use `border-top: var(--stroke) solid var(--line)` only for dense repetition (tables and dense lists). Draw `box-shadow: inset 0 0 0 var(--stroke) var(--ink-boundary)` only where the boundary alone identifies the control (checkbox box, slider track).

## Motion

- Every visible change is a morph of the same element, never a swap.
- Durations come from [`morphDuration(pixels)`](src/lib/motion.ts) (48 ms floor, 360 ms ceiling, exponent 0.75). Pass `--dur` to CSS transitions (`calc(var(--dur) * var(--travel))`) so reduced motion (`--travel: 0`) removes spatial travel, and synchronize companion opacity fades to `var(--dur, var(--dur-fade))`.
- Use [`growFrom`](src/lib/morph.ts) for elements emerging from a trigger, [`moveFrom`](src/lib/morph.ts) for FLIP layout moves, and [`morphIndicator`](src/lib/morph.ts) for selection indicators in tracks. All three use [`morphChannel`](src/lib/motion.ts) to preserve both position and instantaneous velocity when retargeted mid-flight.
- Do not animate layout properties (`width`, `height`, `top`, `left`, `right`, `margin`, `padding`) on moving surfaces or indicators. Use `transform` and `clip-path` for spatial morphs, and `grid-template-rows: 0fr -> 1fr` for height disclosures.
- Standalone opacity fades use `var(--dur-fade)` and state colors use `var(--dur-feedback)`, both with `--ease-morph`. Read reduced motion in JS with `usePreferences().reducedMotion` from [`src/preferences.tsx`](src/preferences.tsx).
- No idle motion: no shimmer, pulse, or spinner that loops without reporting progress.

## Words

- Sentence case everywhere. No uppercase or letter-spaced labels. Monospace only for code.
- Use neutral, specific language. State what a control does or what a value means.
- Do not repeat location, category, or sequence labels above a title.
- No em-dashes in any string. Use a period, a colon, or a second sentence.
- No status pills or badges ("NEW", "LIVE", "WORKING"). A count is a plain number in `--ink-3`.
- Errors say what happened and what to do next.
- No explanatory paragraph below a component. A hint sits next to the control it explains.

## Agency and access

- Never move focus unless the user's own action calls for it (opening a dialog moves focus into it; closing returns focus to the trigger).
- Overlays always close on Escape and always have a visible close control.
- Expose every shown state: roles, `aria-expanded`, `aria-checked`, `aria-invalid` with `aria-describedby`, and a polite live region for asynchronous changes.
- Every interactive element is keyboard operable with a `:focus-visible` ring that fits the control (`outline-offset: calc(var(--focus-width) * -1)` on touching items).

## Checking your work

Run `bun run typecheck`, `bun test`, `bun run build:site`, and `bun run test:browser` from the repository root. See [AUDIT.md](../AUDIT.md) and [tests/README.md](../tests/README.md) for verification scope and manual review items.
