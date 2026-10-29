# Humane Design Language audit

## Scope and method

Three independent subagents reviewed specification/documentation, shared components, and application/examples. Their findings were checked against source before implementation, followed by foundation tests, build/type checks, and real Chromium execution.

Coverage included:

- The complete language, system specification, and contributor conventions.
- All shared component TSX/CSS files and the system documentation pages.
- The complete flagship application source.
- Interactive examples for color measurement, loading, arrivals, undo, navigation, motion, timing, and text scaling.
- An automated check that every language premise/rule/signature has an example and all checked citations resolve.

Generated output, dependencies, and the vendored `krds/` reference were not audited as Humane implementation code. Not every static visual specimen was exercised in every state. This is a scoped audit, not proof that no further defects exist.

## Resolved findings

| Area | Findings and changes | Primary evidence |
| --- | --- | --- |
| Color contract | Separated perceptual lightness from WCAG relative luminance. Removed the false guarantee that equal step distances imply equal contrast. Added actual-color calculations, corrected failing text/boundary/danger pairs, and kept signal colors inside sRGB. | `README.md`, `system/src/lib/color.ts`, `system/src/styles/tokens.css`, foundation and rendered-pixel tests |
| Documentation accuracy | Reconciled illustrative versus normative numbers, structural-line exceptions, exposure versus announcement, local dense-data scrolling, explicit depth, radius clamping/superellipse limits, heading spacing, breakpoints, component behavior, and contributor ownership. Removed contradictory blanket verification claims. | `README.md`, `system/README.md`, `system/CONVENTIONS.md`, `docs/src/system-docs/`, documentation tests |
| Contrast scoping | Optional high-contrast control edges were removed in the shape pass; the remaining `--stroke` boundaries (checkbox box, slider track, structural lines) still follow the nearest contrast scope. | `--stroke` scoping, checkbox/slider CSS, browser contrast/edge check |
| Preference foundations | Validated persisted fields rather than spreading arbitrary storage data. First-paint scripts now agree with provider defaults, including invalid JSON. Media queries refresh when their query changes. | `preferenceStorage.ts`, `preferences.tsx`, both HTML entries, unit/browser tests |
| Loading geometry | Replaced loading-induced height interpolation with a crossfade over known, mounted content geometry. Explicit reserved height remains authoritative and overflowing content is accessible. The flagship no longer guesses its mailbox height. | `Placeholder.tsx`, `placeholder.css`, `MessageList.tsx`, stationary-anchor browser checks |
| Overlay agency | Sidebar closure restores focus before its body becomes inert and uses instance-specific controls IDs. Menus use the Popover top layer, flip/clamp to the viewport, scroll when needed, and preserve keyboard dismissal inside native dialogs. | `Sidebar.tsx`, `Menu.tsx`, browser focus/viewport checks |
| Selection and controls | Removed nested interactive ListRow actions. Long tab/segmented labels wrap. Disabled variants no longer retain active emphasis or hover feedback. Corrected control radius derivation/caps. | Shared component source, browser actions/reflow/disabled checks |
| Arrivals | Debounced current counts replace stale first-arrival announcements. User-requested insertion has a stable focus destination. The flagship's in-app announcement preference is connected to actual behavior. | `Arrivals.tsx`, flagship `App.tsx`, `mail-storage.ts`, announcement/focus tests |
| Undo and removal | Returning pointer/focus cancels settlement. Removed rows preserve their label/action geometry. Reduced-motion removal retains its footprint for the fade. Collapse timing uses measured row sizes. | `UndoableList.tsx`, flagship `MessageList.tsx`, removal demos, browser re-entry/fade checks |
| Motion and demonstrations | FLIP retargeting removes its old transform before measuring the new destination and starts at the actual on-screen position. Reduced FLIP uses opacity feedback. Progress uses physical width. Jump/duration/navigation demos measure responsive geometry. Scroll-spy jumps clean up prior listeners/timers. | `morph.ts`, `useScrollSpy.ts`, `ProgressSurface.tsx`, motion examples, browser interruption check |
| Live color examples | Swatches report per-color contrast; live tables refresh on both scheme and contrast changes; checkbox readings reflect its checked fill/mark. | Three color examples and browser readout refresh check |
| Drafts and settings | Added validated, versioned local persistence and identified autosave on edits. Reload retains work. Clearing an existing draft stays cleared. Signature and notification settings persist; signatures are initialized once, not duplicated when reopening drafts. | `flagship/src/mail-storage.ts`, `store.tsx`, `Compose.tsx`, `compose.tsx`, browser reload tests |
| Mail recovery | Archive retains original-mailbox provenance and has lasting Restore actions. Failed/cancelled sends retain a recoverable draft. Send timing no longer restarts on unrelated renders. Application-level outcomes remain available in Settings and reader-only views. | Flagship store/Outbox/Reader, browser recovery and active-typing tests |
| Mail correctness and focus | Recipient validation rejects incomplete addresses. Sent-mail replies address recipients, not the sender. Reader paragraphs preserve newlines. Single-pane reading and Back transfer focus deliberately. | Compose/Reader/App, unit and browser tests |
| Storage safety | Invalid/newer snapshots are preserved. Storage failures are exposed, replacement requires confirmation, and external snapshot changes stop stale-session writes instead of silently overwriting them. | Mail storage/provider/Outbox, malformed-storage and stale-session browser checks |

## Spacing normalization

A follow-up pass normalized component-internal gaps and paddings, then had three independent critics re-check the implementation and the documentation. Resolved findings:

| Area | Finding and change | Primary evidence |
| --- | --- | --- |
| Notice action | The parent flex `gap` (4) and the action's `margin-top` (8) both applied, so the action sat 12px below the body. The parent gap is gone; the body margin is `--gap-tight` and the action margin is `--gap-within`. | `system/src/components/notice.css`, browser spacing check |
| Choice rows | Checkbox and RadioGroup duplicated mark and gap values, RadioGroup options touched while checkbox stacks sat `--gap-within` apart, and edge-compensation formulas were restated in docs. Added `--choice-mark`, `--choice-mark-compact`, `--choice-gap`, `--choice-gap-compact`; RadioGroup options now use `--gap-within`; each row publishes `--h-choice-row-pad` and `--h-choice-mark-pad`. | `tokens.css`, `checkbox.css`, `radio-group.css`, docs component CSS |
| Named gap semantics | Tabs, Button, Switch, UndoableList, and sidebar internals now use `--gap-within` where the interval is within one group or from a label to its control. Same-value swaps leave layout unchanged; the Switch and UndoableList 24px minimum becomes 8px at cramped widths. | Component CSS, browser reflow checks |
| Geometry ownership | Closed-sidebar chrome (18/10/14) is defined once in `Sidebar.tsx` and set inline, with CSS fallbacks. Slider publishes `--h-slider-track`, `--h-slider-thumb`, and `--h-slider-row-pad`. Docs consume the published properties instead of restating formulas. | `Sidebar.tsx`, `sidebar.css`, `slider.css`, docs CSS |
| Independent messages | The Notice documentation stack now uses `--gap-between`, so two notices are farther apart than a notice's words and its action. | `docs/src/system-docs/notice.css` |

Critic review left these as documented limits: the adjacent-switch docs rule still uses a commented negative cancellation margin because the parent controls-column gap cannot be scoped to one pair; the choice mark stays a fixed 20/16px mark at larger text, so the mark-based frame inset is approximate at 200%; and the closed-sidebar chrome remains a deliberate horizontal exception to the vertical spacing scale.

## Shape pass

A follow-up shape pass replaced the derived intermediate radii with the language's sharp-corner direction and removed optional control-edge strokes. Resolved findings:

| Area | Finding and change | Primary evidence |
| --- | --- | --- |
| Radius | Root, depth 1, depth 2, and control corners are capped at 2px. `rootRadius()` caps the computed value; `--radius-floor`, `--radius-1`, `--radius-2`, and `--radius-control-max` resolve to 2px. The switch remains the one pill. Segmented and tab tracks take 2px; their indicators and options take 0. | `tokens.css`, `rootRadius.ts`, `base.css`, `segmented.css`, `tabs.css`, browser reflow |
| Language | Replaced "Rounded outside, sharper inside" and "Radius is derived, never chosen" with "Sharp corners, round marks" and "Corners are small, never chosen". Replaced the two signature examples with a shared-corner specimen and a resized-root specimen. | `README.md`, `docs/src/examples/sharp-corners-round-marks.*`, `docs/src/examples/corners-are-small-never-chosen.*`, documentation test |
| Edges | Removed the optional high-contrast control-edge strokes from buttons, fields, selects, segmented tracks, tabs, and switch tracks. The checkbox box and slider track remain the controls whose edge alone identifies them; their strokes still thicken. | Component CSS, `system/README.md`, browser contrast/edge check |
| Documentation | Updated token tables, prop meanings, hints, and examples that still described 5% roots, a 6px floor, concentric radii, or drawn control edges. | `system/README.md`, `system/CONVENTIONS.md`, docs system pages, examples |
| Docs reference tables | Props and conformance tables are now definition lists: each key and type share one line, the meaning takes the full width below, and a 12px block inset separates the text from the page edge. No columns, header band, separator lines, or alternating fills. The `Table` component and the line-removal example keep structural lines for dense numeric data. | `docs/src/components/PropList.tsx`, `docs/src/components/prop-list.css`, `docs/src/sections.tsx` |
| Verification | Root-radius unit expectation now asserts the 2px cap. Browser checks now assert the rendered 2px corner cap, the switch pill, checkbox boundary thickening, no optional button edge, forced-colors choice and switch geometry, and semantic docs definition lists. | `foundations.test.mjs`, `browser.mjs` |

Shape review left these as deliberate limits: a 2px corner is still a visible corner, so it is not a hard square; the switch is the only pill; and high contrast strengthens the remaining boundaries, lines, and focus rings rather than adding an outline to every control. The slider track follows `--stroke` (4px standard, 5px high).

## Verification

The final audited implementation passed:

- `npm run typecheck`: all four workspaces and the browser fixture.
- `npm test`: **19 tests**.
- `npm run build`: documentation and flagship production builds.
- `npm run build:site`: the combined landing, docs, and flagship MPA in `dist/`.
- `npm run test:browser`: **31 checks**, Chrome **156.0.8078.48**, Node **26.8.2**.

Browser coverage includes 390px and 1440px viewports at a 32px browser-default font (200% of 16px), actual sRGB canvas-rendered palette pairs in all four scheme/contrast modes, ordinary/reduced-motion component paths, semantic docs definition lists, forced-colors emulation, focus destinations, persistence/recovery, and an absence of uncaught JavaScript/React errors during those scenarios. Reflow assertions establish no horizontal page overflow in those scenarios, not a universal absence of clipping in every possible composition.

See [`tests/README.md`](tests/README.md) for reproduction, browser requirements, and coverage. No test dependencies were added.

## Release status

- **Site:** ready to stage from `npm run build:site` and `dist/`. See [`DEPLOY.md`](DEPLOY.md) for routes, redirects, smoke checks, and the browser baseline.
- **npm:** `humane-system` is `private`, exports source TypeScript, and is MIT-licensed. It is not an npm-publishable package as configured. Compiled distribution or tested source-consumer contract and a versioned release record remain a packaging decision, not a site blocker.
- **Provenance:** the working copy is initialized on `main` and the initial tree is staged. A commit, owner remote, annotated tag, and release notes are still required for a canonical public release.

## Compatibility notes

- `Placeholder.height` is now a persistent reserved viewport, not a temporary loading estimate. Without it, provide mounted content of the final geometry before readiness.
- `UndoableList` requires the hook's `hold` callback. Spreading the hook result supplies it. `settle` accepts measured heights.
- `ListRow` now uses a noninteractive row wrapper with a `.h-list-primary` button and sibling actions. Consumers styling the old button-wrapper structure should update their selectors.
- `Checkbox` accepts an optional explicit `depth`.
- `colorContrast` and `relativeLuminance` measure opaque CSS colors; transparency must be resolved first. `neutralContrast` is only an achromatic reference. Browser gamut mapping of arbitrary out-of-gamut colors still needs rendered-color checking.
- Menus require native Popover support; the implementation does not add a legacy overlay fallback.
- Radius tokens now resolve to 2px. `rootRadius` caps at 2px, and `--radius-control-max` is 2px. Consumers that read `--radius-1`, `--radius-2`, or `--radius-root` keep working; consumers that assumed a size-derived 5% root or a 6px floor must update. `--control-edge-width` is removed: high contrast no longer draws optional edges on buttons, fields, selects, tracks, tabs, or switch tracks. Checkbox and slider boundaries remain and still thicken with `--stroke`.
- The flagship now stores mail/settings locally under `humane-letters-v1`. It remains a local demonstration, not a mail transport or server-backed service.

## Remaining conformance limits

These are intentionally disclosed rather than hidden behind a passing build:

1. **Velocity continuity remains an implementation gap.** Retargeting/reversal preserves position and accepts input, but CSS/Web Animations do not guarantee continuous velocity under arbitrary redirection. The language still requires that stronger property.
2. **Manual accessibility/visual work remains.** Actual VoiceOver/NVDA speech, forced-colors behavior, perceived grayscale hierarchy, exact ink insets/font fallbacks, and per-region signal budgets require dedicated review. DOM assertions and one Chromium engine do not certify these.
3. **Unknown loading geometry cannot be inferred.** Callers must supply final geometry or a stable reserved viewport; changing hidden content dimensions asynchronously can still change natural layout.
4. **Persistence is not collaborative editing.** Snapshot guards stop detected stale writes; there is no cross-tab merge, server synchronization, or transactional guarantee for simultaneous writers. Preserve unsaved edits when a conflict is reported.
5. **Browser coverage is bounded.** Chrome was exercised. Safari, Firefox, operating-system accessibility tools, and every combination of application content/state were not independently tested.

## Working-copy safety

The working copy is now a Git repository on `main`. The initial tree is staged; no commit, remote, or tag exists yet. Dependencies, generated builds, Vite caches, `.DS_Store`, and the local KRDS reference are ignored. An earlier pre-edit snapshot remains outside the workspace at `/tmp/humane-audit-before.n9B9sW/source.tar.gz`.
