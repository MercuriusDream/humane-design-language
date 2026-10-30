# Humane Design System: component conventions

Components in `system/src/components` are expected to follow these rules; known gaps are recorded in the system specification. They turn the language in `../LANGUAGE.md` into code.

## Files

- One component per pair: `PascalName.tsx` and `kebab-name.css`, both in `system/src/components/`.
- The `.tsx` file imports its own stylesheet: `import './kebab-name.css';`.
- Named exports only. Export the component, its props type when callers need it, and any hook it needs.
- Keep changes scoped and coordinate shared-file ownership. Export new public components from `src/index.ts`. Foundation changes in `src/styles/*` or `src/lib/*` require corresponding documentation and regression checks; avoid unrelated component changes. Compose existing components where possible.
- React 19 function components, TypeScript strict. No new dependencies.
- Comments are sparse: a one-line doc comment on each export saying which rule it serves, and short comments only where the reason is not obvious.

## Class names

- Every class starts with `h-` and the component's kebab name: `h-dialog`, `h-dialog-title`.
- State goes in attributes, not extra classes: `data-open`, `data-depth`, `aria-expanded`, `aria-checked`.

## Tokens (from `src/styles/tokens.css`)

Use these custom properties. Never write a raw color, and never write a font size outside the type tokens.

- Planes: `--plane-sunken`, `--plane-base`, `--plane-raised`, `--plane-fill`, `--plane-control`, `--plane-control-hover`, `--plane-control-active`, `--plane-selected` (the selected option on a control track).
- Ink: `--ink-1` (essential text), `--ink-2` (supporting), `--ink-3` (tertiary), `--ink-boundary` (an edge that alone identifies a control), `--ink-inverse` (text on an ink fill).
- Signals, the only saturated colors: `--signal-focus`, `--signal-danger`. Use danger only for errors and destructive actions.
- Strokes: `--line` (color of a dense-repetition line), `--stroke` (1px, 2px in high contrast), `--focus-width`. Edges are drawn only where the edge alone identifies the control (the checkbox box, the slider track). Buttons, fields, selects, tracks, tabs, and switches are identified by their words or fill and draw no edge.
- Radius: every corner is 2px or less. A root surface (dialog, menu, popover, sidebar, depth 0 surface) carries `data-root`; `rootRadius.ts` caps its corner at 2px. `--radius-1` (depth 1), `--radius-2` (depth 2), and `--radius-control-max` all resolve to the same 2px `--radius-floor` (2px). Nesting never adds rounding.
- Padding by depth: `--pad-0`, `--pad-1`, `--pad-2`.
- Spacing: `--space-1` (4) through `--space-9` (96): 4, 8, 12, 16, 24, 32, 48, 64, 96. Every authored vertical gap, margin, and padding is one of these; control-derived geometry (a row's height minus its line box, a mark's offset) is the explicit exception. The named gaps are aliases: `--gap-tight` (`--space-1`), `--gap-within` (`--space-2`, also a label to its control), `--gap-between` (`--space-5`). The only values below the vertical scale are the 2px plane gap between list rows and the 3px between an inner piece and its holder. The closed sidebar's 18px label-side inset, 10px icon gap, and 14px icon-side inset are fixed horizontal chrome, not vertical rhythm steps; `Sidebar.tsx` defines them once and sets them as inline custom properties, with `sidebar.css` repeating them only as fallbacks.
- Spacing composition: express one interval with one mechanism. Do not combine a parent's `gap` with a positive child `margin` for the same pair. A negative cancellation margin is allowed when an existing group gap cannot be scoped to one pair, and must be commented. A gap between content blocks uses a named gap; a value derived from control height, the line box, a mark, or a holder's padding is geometry, stays in a component-local custom property computed with `calc()`, and carries a comment naming its derivation. Publish geometry a consumer must cancel (for example `--h-choice-row-pad`, `--h-choice-mark-pad`, `--h-slider-row-pad`) instead of restating its formula in docs.
- Type: `font: var(--text-display | --text-title | --text-heading | --text-lead | --text-body | --text-small | --text-label)`. Do not introduce raw `font-size`, `line-height`, or `letter-spacing` overrides outside the type tokens. `font-weight: 600` is allowed only on a body or small role that names an action, an unread item, or a heading one level below `--text-heading`; comment it. The three heading roles use normal spacing; their zero-valued tracking tokens may be referenced beside the shorthand: `letter-spacing: var(--tracking-display | --tracking-title | --tracking-heading)`. `--font-code` for code only.
- Rhythm: a heading has less space below it than above it. `--text-heading` sits `--space-8` below what precedes it and `--space-2` above its text; a `--text-label` sits `--space-5` below the previous group and `--space-2` above its control.
- Ink by role: headings, labels, and body `--ink-1`; lead text and hints `--ink-2`; meta such as counts and timestamps `--ink-3`.
- Control text: one role per kind of text. Control labels `--text-body` (600 only for a Button, a Disclosure title, and an unread list title). Option and value labels `--text-body` 400 in `--ink-1` (on a control track, an unselected option is `--ink-2`). Field and group labels `.h-field-label`. Hints `--text-small` in `--ink-2`, `--gap-tight` under their label. Errors `--text-label` in `--signal-danger`, `--gap-within` under the control, in a live region. A compact control uses `--text-small` in place of `--text-body`. Checkbox and RadioGroup share the choice tokens: `--choice-mark` / `--choice-mark-compact` for the mark and `--choice-gap` / `--choice-gap-compact` for the mark-to-label gap. Do not restate those values in a component.
- Selection is shown by plane and ink, never by weight. Never set a selected option to 600.
- Control sizes are tiers: standard is `--control-height` (2.75rem, 44px), `--text-body`, `--inset-control` (16); compact is `--control-height-compact` (2.25rem, 36px), `--text-small`, `--inset-control-compact` (12). A control that can sit in a panel takes `size?: 'standard' | 'compact'` (the `ControlSize` type from `Button.tsx`), rendered as `data-size`, and sets its height, inset, and text from it in one place, as local custom properties on its root (`--h-field-height`, `--h-list-inset`). Every control in one panel shares a tier.
- A single-line control is exactly its tier's height, not at least it. Check that the line box fits: where a control pads around a line, pad by `calc((height - 1lh) / 2)` rather than a fixed step, so a 21px compact line in 8px padding does not make a 37px row.
- Inner pieces (an option or a tab in a track, a thumb, a clear control, a trailing action in a row) are the tier's height less 3px on each side (38, 30), 3px from their holder's edges, with side padding one step of the scale below the tier's inset (`--space-3`, `--space-2`).
- States step one plane from where the control rests. No plane: hover `--plane-control`, press `--plane-control-hover`. On `--plane-control`: hover `--plane-control-hover`, press `--plane-control-active`. On ink: hover `--ink-2`, press `--ink-1`. Selected (`--plane-selected`): no change. Disabled: `--ink-3` on the resting plane, no hover or press. Hover never changes ink, shows anything, moves anything, or sets `cursor`.
- Motion: `--ease-morph`, `--dur-feedback` (hover and press color), `--dur-fade` (opacity), `--travel` (1, or 0 under reduced motion).

## Shape

- A component that floats (dialog, menu, popover) is a root: put `data-root` on it and set no corner of your own; padding `var(--pad-0)`. Things inside it take the same 2px corner (`var(--radius-1)`).
- A component that sits inside a surface takes the 2px corner of its explicit depth. Accept a `depth?: 1 | 2` prop when it can sit at either. `Surface` does not infer nesting: callers pass each nested depth; omitted depth creates a root.
- No element renders a corner larger than 2px, and no component chooses one. There are no pills: the switch is the one exception, because its track, its tier's height tall, rounds at half its height around a circular thumb. Do not extend the exception to any other control. A track takes the 2px corner; the indicator and options inside it take 0, so the inside is sharper than its holder. Marks are circles (`border-radius: 50%`): a status dot, a radio mark, a switch thumb, a slider thumb. A mark holds no content; anything that holds a label or text is a surface or a control and takes the 2px corner, except a piece inside a track, which takes 0.
- Insets are measured to the ink. A padded box whose edge text is in normal flow sets `text-box: trim-both cap alphabetic`; text that meets an edge inside a grid or flex item trims itself (`trim-start`, `trim-end`). Pad a surface the same on every side using its depth token. Control insets are the explicit height/text-metric exception below. Verify ink alignment in supported browsers; line-box fallbacks are not exact ink trimming.
- A control's inset comes from its height: `--inset-control` (16) for 44px with body text, `--inset-control-compact` (12) for 36px with small text.
- Separate content regions with planes of different lightness, not lines. Structural separator lines are only for dense repetition; control boundaries and focus indicators are exceptions. For table rows: `border-top: var(--stroke) solid var(--line)`.
- An edge that alone identifies a control (a checkbox box, a slider track) meets 3:1: draw it as `box-shadow: inset 0 0 0 var(--stroke) var(--ink-boundary)`. A control identified by its words or fill (a button, field, select, track, tab, switch track) draws no edge.

## Motion

- Every visible change is a morph of the same element, never a swap. Something that appears because something was pressed grows from it: use `growFrom(el, originElement, reducedMotion)` from `../lib/morph`.
- Durations come from size: `morphDuration(pixels)` from `../lib/motion` (40 ms floor, 300 ms ceiling, exponent 0.75). Pass the result through a CSS custom property, for example `style={{ '--dur': `${morphDuration(h)}ms` }}`, and use `calc(var(--dur) * var(--travel))` in the transition so reduced motion removes travel.
- Use CSS transitions or Web Animations. Both can be interrupted: a CSS transition retargets from its current value, and a Web Animation can be `.reverse()`d mid-flight. Never wait for an animation to finish before accepting input. Position-based retargeting does not establish velocity continuity: the language's stronger requirement remains an open system gap.
- Opacity fades use `var(--dur-fade) linear` and stay on under reduced motion. Travel and size changes use `calc(... * var(--travel))`.
- No idle motion: no shimmer, pulse, or spinner that loops without reporting progress.
- Read reduced motion in JS with `usePreferences().reducedMotion` from `../preferences`.

## Words

- Sentence case everywhere. No uppercase or letter-spaced labels. Monospace only for code.
- Use neutral, specific language. Prefer established terms over slogans, metaphors, personality claims, and newly branded vocabulary. State what a control does or what a value means.
- Do not repeat location, category, or sequence labels above a title. A menu or dropdown icon must add information not already conveyed by the control and its native affordance.
- No em-dashes in any string. Use a period, a colon, or a second sentence.
- No status pills or badges ("NEW", "LIVE", "WORKING"). A count is a plain number in `--ink-3`.
- Errors say what happened and what to do next.
- No explanatory paragraph below a component. A hint sits next to the control it explains.

## Agency and access

- Never move focus unless the user's own action calls for it (opening a dialog moves focus into it; closing returns focus to the trigger).
- Overlays always close on Escape and always have a visible close control.
- Every state change that is shown is also exposed: correct roles, `aria-expanded`, `aria-checked`, `aria-invalid` with `aria-describedby`, and a polite live region for changes the user did not directly cause.
- Every interactive element is reachable and operable by keyboard, with a `:focus-visible` ring that fits the control it marks: the global ring by default, or the same ring moved onto the part that identifies the control (a field's box, a switch track, a slider thumb, a checkbox box). Pieces that touch or stack closely (options, tabs, menu items, nav items, list rows) draw it inside their own edge: `outline-offset: calc(var(--focus-width) * -1)`.
- Every standalone single-line control and selection row is exactly `--control-height` tall, or `--control-height-compact` when compact, unless it sits in dense repetition; a label that wraps grows it. Segmented and tab tracks meet the group height; their inset options are an explicit shorter-target exception. Tab labels wrap at larger text sizes. Only dense two-dimensional data may use a labeled local horizontal scrolling region; the page must reflow.

## Checking your work

Run `npm run typecheck`, `npm test`, and `npm run build` from the repository root; run `npm run test:browser` for the covered browser scenarios. Record results rather than treating compilation as conformance. Fix regressions introduced by your changes and report unrelated failures to their owner. Manually review screen-reader behavior, forced colors, ink insets, signal counts, and interruption where automation does not establish the language requirement. Follow the signal-region and counting rule in `LANGUAGE.md`: repeated marks for one error count together, concurrent actionable errors remain exposed, and focus is always visible and exempt from the signal budget.
