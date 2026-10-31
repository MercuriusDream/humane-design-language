# Humane Design System

This is the specification of the Humane Design System. It turns the relationships in the [Humane Design Language](../LANGUAGE.md) into values and components. Each value below names the language relationship it satisfies. The values are the ones in `src/styles/tokens.css` and `src/lib/motion.ts`. Where this document and those files disagree, the files are correct and this document must be updated.

Contributors who write components read [CONVENTIONS.md](CONVENTIONS.md) next.

## 1. What it is and how it relates to the language

The language defines premises and rules. It leaves system values open while requiring twice-default text support and a duration exponent between one half and one. The system is one set of answers to those rules for one medium, the web. It chooses a root radius, a padding scale, a palette, a type scale, durations, and a layout. It also provides components built from those choices.

Two documents define the system. The language says why. This document says what the values are and which rule each one satisfies. A different design system could choose other values and still satisfy the same language. Every value here is a choice made for this system.

Each value in this document is tagged with the rule it serves. When a value changes, its rule must still hold. When a rule cannot hold with the current values, the value changes or the gap is recorded in section 9.

## 2. Using it

The system is the workspace package `humane-system` (`system/package.json`). Import components, hooks, and helpers from `'humane-system'`. The package entry is `src/index.ts`, which exports every public module. The foundations in `src/styles/index.css` load with that entry, so importing the package applies the tokens.

The web implementation uses native dialog and Popover top layers, `inert`, ResizeObserver, Web Animations, OKLCH, and `light-dark()`. Use a browser supporting these features; no legacy overlay fallback is supplied. The browser suite records its tested engine, not a cross-browser certification. `text-box` has an explicit line-box fallback limitation below.

### Browser baseline

Requires `light-dark()`, OKLCH, native `dialog` and Popover, `:has()`, container queries, and `text-box`. Chrome 156 is the tested engine. Browsers without `text-box` keep the layout but lose exact ink trimming; browsers without native Popover have no menu fallback. Safari and Firefox are not certified by the browser suite.

Wrap the application in `PreferencesProvider` once, at the root. The provider reads and writes the viewer's display settings, and sets the document attributes that the tokens respond to. Read a setting with `usePreferences()`. The hook throws when it is used outside the provider.

Three applications use the system:

- The landing page in `../landing`. It imports `PreferencesProvider` and the shared language text, so the front door uses the same display preferences and copy as the docs.
- The documentation site in `../docs`. Its root (`src/App.tsx`) imports `AppShell`, `PreferenceControls`, `PreferencesProvider`, and `useScrollSpy`. Each page in `src/system-docs` imports the components it documents, and `src/sections.tsx` imports `Button` and `usePreferences`.
- The flagship application in `../flagship` composes the shell, fields, lists, dialogs, display preferences, loading and progress primitives into a local mail demonstration. Its versioned storage, autosave, recovery, and notification policy belong to the application rather than the design system.

## 3. Space

### Radius

Every corner is 2px or less. A root's corner is capped at 2px, and every nested surface and control takes that same cap. The 2px floor keeps a press target from reading as a raw rectangle; nesting never adds rounding. There are no pills, except the switch: its track is its control height tall (44 standard, 36 compact) and five thirds as wide, rounded at half its height around a circular thumb, because its shape is its function. The slider's track is a line and has no corner. Marks are circles.

| Token | Value | Derivation | Relationship |
| --- | --- | --- | --- |
| `--radius-root` | 2px cap | `rootRadius()` (`lib/rootRadius.ts`) computes min(2px, 5% of the root's shorter side) and sets it in px on every `[data-root]` element: the sidebar, a dialog, a menu, a depth 0 `Surface`, a docs example frame. Outside any root the default is 2px. | Sharp corners, round marks. Corners are small, never chosen. |
| `--radius-floor` | 2px | Chosen. | Anything the user presses keeps a visible corner. |
| `--radius-1` | max(floor, root - 16) = 2px | `--pad-0` is 16. Redeclared on each root. | Every depth takes the same corner. |
| `--radius-2` | max(floor, radius-1 - 12) = 2px | `--pad-1` is 12. | Every depth takes the same corner. |
| `--radius-control-max` | 2px | Chosen. | A control never rounds past the surface corner. |

Every surface and control takes the 2px corner. The segmented and tabs tracks take 2px; their indicator and options take 0, so the inside is sharper than its holder. The checkbox box takes 2px. The closed sidebar is a root `--control-height-compact` tall and takes the same 2px corner in both its open and closed forms. The switch track is the one pill. The slider's track is a line and has no corner.

Marks are circles: the radio mark, the switch thumb, the slider thumb, and status dots. A mark holds no content and sits inside a control or a row, so it takes no corner from a surface.

### Insets

Insets are measured to the ink: from a surface's edge to the cap height of its first line, the baseline of its last, and the edge of any control. A padded `Surface`, a `ProgressSurface`, a dialog panel, a disclosure's content, and table cells set `text-box: trim-both cap alphabetic`, so the leading outside their first and last line does not add to the padding. Text inside a grid or flex item at the edge trims itself the same way (`.h-trim`, or `text-box` in the component's CSS). Browsers without `text-box` fall back to the line box, which adds about 8px above and below body text.

A control's inset is set by its height, not its depth: half of what remains after the cap height. `--inset-control` is 16px for a 44px control with body text, and `--inset-control-compact` is 12px for a 36px control with small text. Buttons, text fields, selects, menu items, disclosure headers and their content, navigation items, and list rows use it on every side. A piece inside a control (see Controls) takes one step of the scale less, since it already sits 3px in.

### Controls

Sizes are tiers, and a tier fixes every dimension of a control at once. There are two:

| Tier | Height | Inner piece | Text | Side inset | Inner piece side padding | Choice mark |
| --- | --- | --- | --- | --- | --- | --- |
| Standard | `--control-height`, 2.75rem (44px) | 38px | `--text-body` (17px) | `--inset-control` (16px) | `--space-3` (12px) | `--choice-mark` (20px), `--choice-gap` (12px) |
| Compact | `--control-height-compact`, 2.25rem (36px) | 30px | `--text-small` (14px) | `--inset-control-compact` (12px) | `--space-2` (8px) | `--choice-mark-compact` (16px), `--choice-gap-compact` (8px) |

Standard is the default for every control. Every control that can sit in a panel takes `size?: 'standard' | 'compact'`, rendered as `data-size`: `Button`, `Switch`, `Segmented`, `Tabs`, `TextField`, `Select`, `Menu` (its trigger and its items), `Disclosure`, `Checkbox`, `RadioGroup`, `List` (its rows), `Slider`, `Arrivals` (its slot and button), and `UndoableList` (each row's label and its action share the tier). Compact is for the whole sidebar, toolbars of actions on an object, `PreferenceControls`, and the controls column of a docs example. `Sidebar` and `PreferenceControls` are compact throughout and take no size. Surfaces that hold controls (`Surface`, `Notice`, `Dialog`, `ProgressSurface`) are not controls and take no tier; what they hold does.

The rules of a tier:

- **One height.** The visible box of every single-line control is exactly its tier's height, not at least it: a button, a text field, a select, a menu item, a navigation item, a disclosure header, a list row, a segmented or tab track, a switch track, a slider's input, the closed sidebar. Rows that hold a control (checkbox, radio, switch rows) are that height too: a checkbox or radio row puts half of what its height leaves around one line above and below it (8.4px standard, 7.5px compact), and a text field's input does the same, so a single line makes the height exactly and a second line grows the row. Multi-line rows, such as a letter in a list or a wrapped label, are exempt; their inset is the tier's inset.
- **One inner height.** A piece inside a track or a row (a segmented option and its indicator, a tab, a switch thumb, a text field's clear control, a list row's trailing action) is the tier's height less 3px on each side: 38px standard, 30px compact. It sits 3px from the edges of what holds it. Its side padding is one step of the scale below the tier's inset, so with those 3px its label's ink sits within a pixel of the tier's inset.
- **One size per panel.** Every control in one panel, toolbar, or form shares a tier, so a row of controls has one height and one text size. A panel may hold a heading or a name in a larger role (the sidebar's title keeps `--text-body` at 600); it may not mix control tiers. A list's trailing actions take the list's size.
- **One edge per side.** In a panel, all ink starts on one line: the panel's padding plus the tier's inset. Text, labels, tracks, fields, counts, and icons start and end there. Only the hover and selection planes of navigation items, list rows, and menu items reach out to the panel's padding, since they hold text inside them.

Measured in Chrome at default text size, every single-line control in the docs renders at exactly 44px standard and 36px compact, and every inner piece at 38px and 30px. Segmented and tab groups meet the tier height at the outer track; their inset options are shorter by the track's padding and are an explicit target-size exception.

A button keeps the action weight (600) in both tiers, and a disclosure title the title weight (600); every other control label is 400. Segmented options share the track's width equally unless a label needs more: each grows from nothing by an equal share, with its label's width as its minimum, and an option that cannot fit moves to a new line whole.

Selection is shown by plane and ink, never by weight. The selected option of a segmented control and the selected tab sit on `--plane-selected` in `--ink-1`; the others are `--ink-2` on the track. Under high contrast the track keeps its fill and the checkbox and slider boundaries thicken. A sidebar's current item and a selected list row take `--plane-selected`, as a segmented control's chosen option does.

Hover and press change a plane and nothing else: nothing appears or moves, no ink changes, and the pointer stays the arrow. Each state is one step from where the control rests:

| A control that rests on | Hover | Press | Disabled |
| --- | --- | --- | --- |
| No plane: a quiet button, a menu item, a list row that is an action, a navigation item, the sidebar toggle, a disclosure (from its own base or raised plane) | `--plane-control` | `--plane-control-hover` | No plane, `--ink-3` |
| `--plane-control`: a button, a text field, a select, a switch track that is off, an unselected segmented option or tab (on its track) | `--plane-control-hover` | `--plane-control-active` | `--plane-control`, `--ink-3` |
| `--plane-raised`: an empty checkbox box, a radio ring | `--plane-control` | `--plane-control-hover` | `--ink-3` edge, `--ink-3` label |
| Ink: a strong button, a switch that is on, a checked checkbox | `--ink-2` | `--ink-1` | A strong button takes `--plane-control` and `--ink-3`; a checked checkbox a flat `--ink-3` fill with no edge |
| `--plane-selected`: a selected option, tab, list row, the current navigation item | No change | No change | |

A text field's clear control sits on the field, which is on its hover plane while the pointer is over it, so the clear takes `--plane-control-active`. A typed-in field returns to its resting plane, so the focus ring alone marks it. A list row of plain content is not an action and does not change under the pointer. `Button`, `Menu` items, and `Checkbox` have a disabled state; the other controls do not.

Field anatomy is one pattern for `TextField` and `Select`, in both tiers: the label (`.h-field-label`, `--text-label`, `--ink-1`); an optional hint 4px under it (`--text-small`, `--ink-2`); the control 8px below the label block; and the error 8px under the control (`--text-label`, `--signal-danger`), in a polite live region that is always mounted. Text fields and selects are control planes with no outline in either contrast; their labels, placeholders, or glyphs identify them. A search field adds a search mark at its start, sized to the field's text (1.0625em). A select's 12px chevron ends on the tier's inset, with a gap of the same inset before it. An invalid control draws an edge in `--signal-danger`. Checkbox and radio rows share one geometry: the mark centered on the first line of the label, a hint 4px under the label in `--text-small` `--ink-2`, and the tier's `--choice-mark` and `--choice-gap`. Radio options sit `--gap-within` apart, as a stack of checkboxes does. Each row publishes `--h-choice-row-pad` (the padding below its first line) and `--h-choice-mark-pad` (the space below its mark), so a consumer can cancel the row at a frame edge without restating either formula. A notice follows the same message rhythm: title to body `--gap-tight`, and an action `--gap-within` below the words; independent notices sit `--gap-between` apart. Slider publishes `--h-slider-track`, `--h-slider-thumb`, and `--h-slider-row-pad` for the same edge cancellation; its track is 4px in standard contrast and 5px in high, following `--stroke`.

Focus rings fit the control they mark. A text field draws its ring on the field, not the bare input, so the ring follows the field's radius. A switch draws it on the track, a slider on the thumb, and a checkbox or radio on its mark. Pieces that touch or stack closely draw the ring inside their own edge, so it never covers a neighbour: a segmented option, a tab, a menu item, a navigation item, and a list row, which also rises above its neighbours.

### Padding

Surface padding follows depth and never follows container size. Control insets are the explicit height/text-metric exception described above.

| Token | Value | Depth |
| --- | --- | --- |
| `--pad-0` | 16px | Root surfaces |
| `--pad-1` | 12px | Depth 1 |
| `--pad-2` | 8px | Depth 2 |

Padding decreases with depth and stays small, so the room it frees goes to text. It is measured to the ink (see Insets), so these values are what the eye sees on every side. This satisfies Padding follows depth, not size, and Padding is small, text is large.

### Spacing scale

Every authored vertical gap, margin, and padding is a step of one scale, so every page shares one rhythm. Control-derived geometry, such as a choice row's height minus its line box, is the explicit exception described under Controls.

| Token | Value |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 96px |

Two values sit outside the scale on purpose: the 2px plane gap between rows of a list (a row separation, not a group gap), and the 3px between an inner piece and what holds it (the padding of a switch, segmented, or tab track; a list row's trailing action; a text field's clear control), which separates the piece from its holder. The closed sidebar's 18px label-side inset, 10px icon gap, and 14px icon-side inset are fixed horizontal chrome, not vertical rhythm steps; `Sidebar.tsx` defines them once and sets them as custom properties so the measured closed width and the rendered chrome cannot drift.

### Grouping

Whitespace groups content when lines are absent. Each gap has one meaning. The named gaps are aliases of the scale.

| Token | Value | Relationship |
| --- | --- | --- |
| `--gap-tight` | `--space-1` (4px) | Items in one tight group, such as placeholder lines, a notice title and its body, or a label and its hint. |
| `--gap-within` | `--space-2` (8px) | Items within one group, a label to the control it labels, a notice's words to its action, and the rows of a choice group. |
| `--gap-between` | `--space-5` (24px) | The gap between groups. It is 3 times `--gap-within`, which exceeds the language's illustrative 2 times ratio. Satisfies Whitespace is syntax. |
| `--gap-heading-below` | `--space-6` (32px) | The gap from a section title (or its lead) to the first subsection. |
| `--gap-section` | `--space-9` (96px) | The gap that separates sections. |

### Heading rhythm

Every heading has less space below it than above it, so it visibly belongs to what follows. Satisfies A heading sits closer to what it introduces.

| Level | Above | Below | Where |
| --- | --- | --- | --- |
| Page title (`--text-display`) | The page padding | `--space-3` (12px) to its lead, then `--space-9` (96px) to the first section | The docs page header. |
| Section title (`--text-title`) | `--space-9` (96px); `--space-8` (64px) below 1000px wide | `--space-3` (12px) to its lead; `--space-6` (32px) from the title or lead to the first subsection | Docs sections. In the flagship, the mailbox name and Settings, with `--space-6` to the content. |
| Subsection title (`--text-heading`) | `--space-8` (64px); `--space-7` (48px) below 1000px wide | `--space-2` (8px) to its text, `--space-2` from text to the "Follows from" line, `--space-4` (16px) to its example frame | Each rule and each component in the docs. In the flagship, Settings groups sit `--space-7` apart with `--space-3` (12px) from a group heading to its controls. |
| Label (`--text-label`) | `--space-5` (24px) between groups | `--space-2` (8px) to the control it labels | Field and group labels, preference groups in the sidebar. |

The docs example frame has `--pad-0` on every side and nothing else at the frame level, so its controls column and its specimen start at the same top and left inset, `--space-5` apart. Inside a frame, groups sit `--space-5` apart and rows of a list 2px apart.

The sidebar is compact throughout: the open title row is a control like the navigation items: `--control-height-compact` tall, `--pad-0` from the panel's top and sides, `--inset-control-compact` inside, so its 1.25rem icon lines up with the navigation counts; its title keeps `--text-body` at 600 as the panel's name and wraps when it does not fit. `--gap-within` (8px) from the title row to the navigation, navigation items `--control-height-compact` tall with `--inset-control-compact` side padding and `--text-small`, preferences pinned to the bottom of the panel at least `--space-6` (32px) below the navigation and `--pad-0` above the panel's edge, `--space-5` between preference groups, `--gap-within` from a group label to its control, and `--gap-within` (8px) between switches, which are items of one group.

### Strokes and lines

| Token | Standard contrast | High contrast | Relationship |
| --- | --- | --- | --- |
| `--stroke` | 1px | 2px | Structure strengthens with contrast. |
| `--focus-width` | 2px | 3px | Focus is a signal. It stays visible in both contrasts. |
| `--line` | `--plane-control-active` | `--ink-boundary` | Lines are for dense repetition only. The color of a line is a plane or an edge, not a new hue. |

Structural separator lines appear only in dense repetition: table rows and dense lists. Every other structural separation uses planes. Control boundaries and focus indicators are explicit exceptions. Edges remain only where the edge alone identifies the control: the checkbox box and the slider track. Buttons, fields, selects, segmented tracks, tabs, and switch tracks are identified by their words or their fill, so they draw no edge in either contrast.

## 4. Color

### Planes, ink, and signals

Every color is an OKLCH value. Lightness (L) is perceptual, as the language requires. Each value below shows L and chroma (C). Neutral values have hue 250. Signal values have the hue given in their own description.

The scheme (light or dark) and the contrast (standard or high) are separate. The four combinations are built separately with `light-dark()`. Standard contrast is the default and applies on `:root` and on `[data-contrast='standard']`. High contrast applies on `:root[data-contrast='high']` and `[data-contrast='high']`. Any element can set its own contrast with `data-contrast`, and its own scheme with `color-scheme`.

Planes are the surfaces that create structure. Raised is lighter than base in both schemes.

| Token | Light standard | Dark standard | Light high | Dark high |
| --- | --- | --- | --- | --- |
| `--plane-sunken` | L 0.935, C 0.004 | L 0.17, C 0.004 | L 0.88, C 0.003 | L 0.06, C 0.003 |
| `--plane-base` | L 0.965, C 0.003 | L 0.2, C 0.004 | L 0.97, C 0.002 | L 0.16, C 0.003 |
| `--plane-raised` | L 0.995, C 0.002 | L 0.245, C 0.005 | L 1, C 0 | L 0.26, C 0.004 |
| `--plane-fill` | L 0.9, C 0.006 | L 0.32, C 0.006 | L 0.82, C 0.004 | L 0.4, C 0.005 |
| `--plane-control` | L 0.9, C 0.005 | L 0.3, C 0.006 | L 0.82, C 0.004 | L 0.36, C 0.005 |
| `--plane-control-hover` | L 0.865, C 0.006 | L 0.355, C 0.006 | L 0.78, C 0.004 | L 0.41, C 0.005 |
| `--plane-control-active` | L 0.85, C 0.006 | L 0.395, C 0.007 | L 0.74, C 0.005 | L 0.46, C 0.006 |
| `--plane-selected` (a selected option on a control track) | L 0.995, C 0.002 | L 0.4, C 0.007 | L 1, C 0 | L 0.5, C 0.006 |

Ink is the text and boundary color. Ink steps are ordered by lightness: `--ink-1` is the most contrasting, then `--ink-2`, then `--ink-3`.

| Token | Light standard | Dark standard | Light high | Dark high |
| --- | --- | --- | --- | --- |
| `--ink-1` (essential text) | L 0.24, C 0.01 | L 0.95, C 0.004 | L 0.14, C 0.008 | L 0.99, C 0.002 |
| `--ink-2` (supporting text) | L 0.42, C 0.01 | L 0.8, C 0.006 | L 0.26, C 0.008 | L 0.92, C 0.004 |
| `--ink-3` (tertiary text, counts) | L 0.45, C 0.01 | L 0.78, C 0.008 | L 0.32, C 0.008 | L 0.91, C 0.005 |
| `--ink-boundary` (an edge that alone identifies a control) | L 0.55, C 0.01 | L 0.67, C 0.01 | L 0.38, C 0.008 | L 0.79, C 0.006 |
| `--ink-inverse` (text on an ink fill) | L 0.985, C 0.002 | L 0.2, C 0.004 | Same as standard | Same as standard |

Signals are the only colors above the neutral chroma ceiling. Their chroma is bounded by sRGB gamut and the contrast floor; high-contrast dark text needs less chroma to retain both. Signal chroma ranges from 0.035 to 0.18.

| Token | Light standard | Dark standard | Light high | Dark high |
| --- | --- | --- | --- | --- |
| `--signal-focus` (hue 255) | L 0.55, C 0.18 | L 0.74, C 0.13 | L 0.45, C 0.14 | L 0.8, C 0.1 |
| `--signal-danger` (hue 27) | L 0.47, C 0.16 | L 0.8, C 0.11 | L 0.38, C 0.13 | L 0.93, C 0.035 |

Relationships for this block:

- Luminance carries structure. Planes and ink differ in lightness, and the hierarchy holds in grayscale.
- Measure lightness perceptually. All values are OKLCH L.
- Neutral chroma ceiling: 0.012. Every neutral value in the table is between 0 and 0.010.
- Saturation belongs to state. `--signal-focus` marks the focus position. `--signal-danger` marks errors and destructive actions. Brand identity does not use saturation.
- Every mode is built, not inverted. Each of the four combinations has its own values above.

### Contrast floors

- Text meets 4.5:1 on every plane it sits on.
- An edge that alone identifies an interactive control, such as a switch track, a slider track, or an input border, meets 3:1.

The system measures opaque CSS color pairs with `colorContrast` in `src/lib/color.ts`, using `relativeLuminance` after conversion to linear sRGB. Resolve transparency against its backdrop before measuring. `neutralContrast` uses L cubed and is only an ideal achromatic (C = 0) reference, not a measurement of this hue-bearing palette. Equal OKLCH step distances do not guarantee a contrast ratio.

The following sample pair ratios were computed from the current `tokens.css` OKLCH values with `colorContrast`, rounded to one decimal. They are not a claim about every rendered state or arbitrary token pairing. Browser gamut mapping and compositing require rendered-color checks too.

| Pair | Light standard | Dark standard | Light high | Dark high | Floor |
| --- | --- | --- | --- | --- | --- |
| `--ink-1` on `--plane-base` | 14.9:1 | 15.6:1 | 18.3:1 | 18.9:1 | 4.5:1 |
| `--ink-2` on `--plane-control` | 6.3:1 | 7.3:1 | 8.9:1 | 8.6:1 | 4.5:1 |
| `--ink-3` on `--plane-control-active` | 4.7:1 | 4.7:1 | 5.5:1 | 5.5:1 | 4.5:1 |
| `--ink-1` on `--plane-selected` | 16.2:1 | 8.0:1 | 19.9:1 | 5.8:1 | 4.5:1 |
| `--ink-2` on `--plane-selected` | 8.3:1 | 4.9:1 | 15.5:1 | 4.7:1 | 4.5:1 |
| `--ink-boundary` on `--plane-raised` | 4.8:1 | 5.4:1 | 10.0:1 | 8.0:1 | 3:1 |
| `--ink-boundary` on `--plane-control` | 3.6:1 | 4.6:1 | 5.7:1 | 5.6:1 | 3:1 |

The first five rows show text pairs, and the last two show boundary pairs. All listed sample pairs exceed their stated floor. Recompute these rows whenever either token changes; test actual foreground/background uses rather than assuming every ink token is valid on every fill.

### Contrast and scheme settings

The viewer's settings decide the combination. `PreferencesProvider` sets `data-contrast` on the document element to `high` when the viewer chooses high contrast, or when the viewer chooses system contrast and the operating system asks for more contrast. It sets `color-scheme` from the viewer's theme choice (system, light, or dark). The two settings are independent. Choosing dark does not select high contrast, and choosing high contrast does not select dark.

## 5. Type

The type scale has four levels of hierarchy and three supporting roles. Hierarchy comes from size and weight. Text color is a second tool and is applied after size and weight. Weights are 400, 600, and 700 only.

| Role | Token | Size | Weight | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `--text-display` | 3rem (48px) | 700 | 1.08 | `--tracking-display` (0) | The page title. |
| Subtitle | `--text-title` | 2.125rem (34px) | 700 | 1.15 | `--tracking-title` (0) | Section titles; app page titles such as a mailbox name or Settings. |
| Sub-subtitle | `--text-heading` | 1.5rem (24px) | 600 | 1.3 | `--tracking-heading` (0) | Subsections: each rule and each component in the docs, groups in Settings, the subject of an open letter, a dialog title. |
| Lead | `--text-lead` | 1.25rem (20px) | 400 | 1.5 | 0 | Only directly under a title or subtitle, in `--ink-2`. |
| Body | `--text-body` | 1.0625rem (17px) | 400 | 1.6 | 0 | All running text, in `--ink-1`. Standard controls use it too: option and value labels at 400, weight 600 only where they name an action (a button), a title (a disclosure), an unread item, or a heading inside an example frame. |
| Small | `--text-small` | 0.875rem (14px) | 400 | 1.5 | 0 | Meta, hints, timestamps, "Follows from" lines, and the text of compact controls: `--ink-2` for hints, `--ink-3` for meta. |
| Label | `--text-label` | 0.875rem (14px) | 600 | 1.4 | 0 | Field and group labels (`.h-field-label`), table headers, and a props heading below a component name, in `--ink-1`. Error messages, in `--signal-danger`. |

The levels are 48, 34, 24, and 17 px: each is about 1.41 (the square root of 2) times the one below, which exceeds the illustrative 1.2 ratio in Levels are far apart. `--text-small` and `--text-label` share a size and differ by weight. Tracking is set with the `--tracking-*` tokens beside the `font` shorthand; all heading and text roles keep normal spacing.

Text color roles: headings and body `--ink-1`, lead and hints `--ink-2`, meta `--ink-3`.

Typefaces:

- `--font` is the system UI stack: `system-ui`, `-apple-system`, `'Segoe UI'`, `Roboto`, `sans-serif`.
- `--font-code` is the monospace stack: `ui-monospace`, `'SF Mono'`, `Menlo`, `Consolas`, `monospace`. It is used only for code and for data that must align by character.

Relationships for this block:

- Type hierarchy comes from size and weight first.
- Text size belongs to the user. Sizes are set in rem, so the browser's text setting applies. Twice-default reflow requires browser validation; section 9 defines the verification scope.
- Labels are set like text. Every label uses a token above, in sentence case, with normal letter spacing. No token sets tracking, uppercase, or monospace for a label. The three heading tracking tokens are also zero.

Every component uses a step of the scale, one role per kind of control text. Standard control labels (buttons, switches, segmented options, tabs, text fields, selects, menu items, disclosure headers, checkbox and radio labels, list titles) use `--text-body`, with weight 600 only for a button, a disclosure title, and an unread list title. Compact controls use `--text-small` with the same weights, so in `PreferenceControls` and the sidebar the group labels (`--text-label`, 600) are never quieter than their options. The sidebar's items are compact; its title keeps `--text-body` at 600 as the app name. A selected option is never heavier than the others. The sidebar's current-section label uses `--text-label`. No component, example, or page sets a font size, weight, line height, or letter spacing outside these tokens, apart from inline `code`, which takes 0.875 of the surrounding text so it sits inside any role.

## 6. Time

### Duration from size

Duration grows with the size of the change. The function is in `src/lib/motion.ts`:

    duration (ms) = min(360, round(48 + 3 × size^0.75))

where size is the change in pixels, measured as the component defines it.

| Parameter | Value | Meaning |
| --- | --- | --- |
| Floor | 48 ms | The shortest duration. Any change, however small, takes at least this long. |
| Ceiling | 360 ms | The longest duration. Changes from about 490 px upward reach the 360 ms ceiling. |
| Scale | 3 | Multiplies the power term. |
| Exponent | 0.75 | Between one half and one, as Duration grows with scale requires. |

Worked examples:

- A change of 8 px. 8^0.75 is 4.76. Multiplied by 3, it is 14.3. Adding the floor gives 62.3, which rounds to **62 ms**.
- A change of 300 px. 300^0.75 is 72.1. Multiplied by 3, it is 216.2. Adding the floor gives 264.2, which rounds to **264 ms**.

A change of 300 px takes about four times as long as a change of 8 px. The gap is wide enough to notice, and the timing can be predicted from the size of the change.

The size used for each morph is the component's own measure:

- `growFrom` uses the largest of three values: the distance between the origin and the element, the change in width, and the change in height.
- `moveFrom` uses the distance the element travels.
- The sidebar's nav indicator uses the vertical distance it covers.
- The sidebar as a whole uses the viewport height. Opening and closing use the same measure at a given viewport; sufficiently tall viewports reach the duration ceiling.
- `Disclosure` uses the height that changes.
- `ProgressSurface` multiplies the change in completion ratio by its measured track width in pixels. Under reduced motion, the fill updates without travel and gives 120ms opacity feedback in place.
- `Placeholder` crossfades opacity without animating height. Callers provide final-geometry children from the start or an authoritative fixed height.
- `UndoableList` measures each row's height for settlement timing. `UNDO_ROW_HEIGHT` (68px, a standard row at default text size) is a fallback, not a fixed row-height guarantee. A returning pointer or focus calls `hold()` to cancel timers and reverse leaving rows.

Fixed durations that do not come from size:

| Token | Value | Use |
| --- | --- | --- |
| `--dur-feedback` | 140ms | Hover and press color. |
| `--dur-fade` | 180ms | Opacity. Fades are never removed under reduced motion. |

State transitions (color and opacity) use the morph curve so a change settles smoothly instead of snapping. The switch thumb is a fixed 85 ms standard and 81 ms compact, `morphDuration(29)` and `morphDuration(24)` for its 29 px and 24 px travel. Its CSS value is written as a constant.

### Curve and interruption

`--ease-morph` is `cubic-bezier(0.2, 0, 0, 1)`. `EASE_MORPH` in `src/lib/morph.ts` has the same value.

Every morph can be interrupted. A CSS transition retargets from its current value when the target changes. A Web Animation returned by `growFrom` or `moveFrom` can be reversed mid-flight with `.reverse()`, so the element returns along the path it took. No component waits for a morph to finish before it accepts input. This supports interruption from the current position, but does not satisfy the language's stronger velocity-continuity requirement. That remains an implementation gap (section 9).

The system defines no spring parameters. Interruption comes from retargeting and reversing, not from a spring model.

### Reduced motion

Reduced motion follows the viewer's operating system setting unless the viewer chooses otherwise in `PreferencesProvider`. When it is on, the document sets `data-motion='reduced'`, which sets `--travel` to 0.

- Every travel and size transition uses `calc(<duration> * var(--travel))`. With `--travel` at 0, these transitions take no time, so the change happens at once.
- Opacity fades keep their duration under reduced motion.
- `growFrom` under reduced motion does not move or scale the element. It fades it in place over 120 ms, linear.
- `moveFrom` under reduced motion places the element at its destination without travel and gives 120ms opacity feedback in place.
- JavaScript reads the setting with `usePreferences().reducedMotion`, and passes it to `growFrom` and `moveFrom`.

No component loops. The system has no shimmer, pulse, or spinner that runs without reporting progress. This satisfies Nothing moves idle.

## 7. Layout

| Token or value | Value | Relationship |
| --- | --- | --- |
| `--sidebar-width` | min(19rem, 100vw - 2 * var(--sidebar-inset)) | The open sidebar's width: 304px at default text size, wide enough for a three-word title on one line beside its icon, growing with the user's text size, never wider than the screen. |
| `--sidebar-inset` | `--pad-0` (16px) | The floating sidebar's distance from the screen edge, on all sides: closed, and open over the content. Docked, it has none. |
| `--sidebar-closed-height` | `--control-height-compact` (2.25rem) | The closed sidebar's height, 36px at default text size: the panel is compact, so its closed form is a compact control. |
| Closed width | widest possible label + icon width + 42px, capped to the viewport | The closed toggle reserves the widest of the title and all item labels, so changing the current section never moves or resizes it. The hidden measurement labels follow font and text-size changes. 42px is the fixed horizontal chrome: 18px padding on the label side, 10px gap, and 14px on the icon side, with the label first and the icon at the end. `Sidebar.tsx` defines the three values once for measurement and sets them on the surface as inline custom properties; `sidebar.css` repeats them only as fallbacks for the standalone stylesheet. The 10px gap also applies while open. This is an explicit exception to the control-inset rule. The icon is 1.25rem (20px at default text size). |
| Open title row | `--control-height-compact`, `--pad-0` from the top and sides | As the panel opens the toggle moves `--pad-0` in from the panel's top and sides and takes `--radius-1` up to `--radius-control-max`, in the same morph as the surface. The title comes first with `--inset-control-compact` before it, so it starts on the navigation text's edge; the icon is at the row's end, centered in a square as tall as the row. Every line of text in the panel, including labels under the navigation, starts on that edge; planes start at `--pad-0`. |
| Overlay breakpoint | viewport width below 62.5em (1000px at the default 16px browser font) | Below this text-relative width the sidebar opens over the content. It is closed by default. Satisfies "Where the screen is too narrow to keep it open, it stays a toggle and grows over the content when asked." |
| `--column-width` | 760px | The reading column's maximum width. |
| `--column-width-wide` | 1120px | The wide column's maximum width, used for lists and panes. |

The sidebar is a root surface on the left by default. Docked, it is a section of the window: flush with the window's top, bottom, and side, full height, square where it meets those edges, and set apart from the page by its plane (`--plane-sunken`) alone. Closed, or open over the content, it floats: `--sidebar-inset` from the edges and takes the 2px corner. The morph between the two moves its edges and size together. The viewer can move it to the right, and when the side changes it travels across the screen rather than jumping. Navigation is never placed across the top of the screen.

The page keeps its content centered in the space beside the sidebar.

- Docked (viewport width at least 62.5em, sidebar open): the page's side padding is 328px on the sidebar's side at default text size. That is `--sidebar-width` plus `--space-5`.
- Full (`column="full"`): the content is itself a set of sections that fill the window beside the sidebar, edge to edge, and scroll on their own; the page has no padding and does not scroll. Content in it keeps its first line below the floating closed sidebar with `--shell-clear`, which is zero while docked.
- Page padding otherwise: `--space-9` (96px) top, `--space-5` (24px) sides, `--space-9` plus `--space-8` (160px) bottom. Below the text-relative dock breakpoint the top padding clears the closed sidebar by `--space-5` (`--sidebar-inset` plus `--sidebar-closed-height` plus `--space-5`, 76px at default text size), the sides are `--space-4` (16px), and the bottom is `--space-9` plus `--space-5` (120px).

The reading column is centered and its text is aligned to the start of each line. This satisfies Content is centered.

## 8. Components

Every component lives in `system/src/components/` and is expected to follow `CONVENTIONS.md`. The rules column names the intended relationships, not a certification of complete conformance; see section 9 for gaps and verification scope.

| Component | What it is for | Rules it serves |
| --- | --- | --- |
| `Surface` | A plane at a depth. Sets the 2px corner and padding for that depth. It is the base of other containers. | Divide with planes. Padding follows depth, not size. Sharp corners, round marks. Corners are small, never chosen. |
| `AppShell` | The page frame: a sidebar on one side, and a centered column beside it. | Navigation is a sidebar that morphs. Content is centered. |
| `Sidebar` | Primary navigation. One root surface, open as a panel and closed as a small surface that names the current section. | Navigation is a sidebar that morphs. Continuity saves effort. Never take control from the user (the overlay closes on Escape and on a press outside it). |
| `Button` | An action identified by its label. Variants: default, strong (ink fill), quiet (no plane until hover), and danger. Sizes: standard and compact. | Interactive boundaries meet a contrast floor. Saturation belongs to state (danger only). Equal consequence, equal weight. |
| `Switch` | A setting that is on or off, standard or compact, drawn as a pill track holding a circular thumb, the system's one pill. The thumb travels between the ends: boundary ink at the start when off; on, the track takes full ink and the thumb the inverse. | Continuity saves effort. The thumb meets 3:1 against the track. |
| `Segmented` | A choice among a few short options, standard or compact. Options share the width equally unless a label needs more, and wrap when they cannot fit; one indicator on `--plane-selected`, measured from the active option, travels between them. | Continuity saves effort. The track takes the 2px control corner; the indicator and options take 0, so the inside is sharper than its holder. Text scaling: the track never scrolls. |
| `Slider` | A value along a range, standard or compact. The track identifies the control. | Interactive boundaries meet a contrast floor. |
| `PreferenceControls` | Controls for the display preferences the system honors: theme, contrast, side, and reduced motion. Grayscale is added when `showGrayscale` is set. | Scheme and contrast are separate choices. Structure strengthens with contrast. Perception varies. |
| `TextField` | A text input, search field, password field, or textarea, standard or compact. Has a label, an optional hint under the label, and an error under the field. | Interactive boundaries meet a contrast floor. Explain at the point of action. Errors say what happened and what to do next. |
| `Checkbox` | A binary choice, standard or compact. The whole row is the target. The check draws in. | Continuity saves effort. Interactive boundaries meet a contrast floor. Keyboard focus is visible. |
| `RadioGroup` | One choice from several, standard or compact. Every option has the same style. The selected dot grows in place. | Equal consequence, equal weight. Continuity saves effort. Native radios keep group semantics and arrow-key movement. |
| `Select` | A native select drawn as a control plane, standard or compact. Same anatomy as `TextField`: a hint under the label and an error in words under the control. | Words identify the field. Errors say what happened. |
| `Disclosure` | A row that opens in place to reveal its content. Its header is a control of its tier, standard or compact. | Continuity saves effort. Duration comes from the height that changes. |
| `Dialog` | A modal that grows out of the control that opened it and returns into it. Focus moves in on open and returns to the trigger on close. | Continuity saves effort. Never take control from the user. Escape and a visible close control always dismiss it. |
| `Menu` | A set of actions that grows from its trigger. Its items take the trigger's tier, standard or compact. Opening moves focus to the first item. | Continuity saves effort. Never take control from the user. Only a destructive item is set in saturated text. |
| `Tabs` | Switch between panels, standard or compact. One raised plane morphs between tabs, and only the active panel renders. Its `label` is the tablist's accessible name, not a visible field label. | Continuity saves effort. The indicator is placed without travel for layout changes the user did not cause. |
| `ProgressSurface` | A surface whose own plane fills to show progress. | State lives on the object. No text badge stands in for progress. |
| `Notice` | An inline message in words. Neutral by default. Danger sets the title in the signal color. | Words are for intent, commands, and errors. Arrive quietly. |
| `List` | Rows on planes, standard or compact; trailing actions are inner pieces of their row. Dense lists separate rows with a line. | Divide with planes. Lines are for dense repetition only. Renders as buttons when rows are actions. |
| `UndoableList` (with `useUndoableList`) | A list where removal has no confirmation. Each removal stays in place with Undo until the list settles. | Prefer undo to confirmation. Removed things go somewhere. Never move what the user is about to touch. |
| `Placeholder` | Crossfades over mounted final-geometry children, or keeps an explicit height authoritative before and after loading with internal scrolling. Unknown dimensions require caller-provided geometry. | Reserve space for what is loading. Continuity saves effort. |
| `Arrivals` | A reserved slot, as tall as a control of its tier, where new items wait until the user asks for them; count announcements are debounced and a stable content region provides a focus destination. | Arrive quietly. Reserve space for what is loading. Never move what the user is about to touch. |
| `Table` | Dense data with lines between rows. No stripes and no outer border. The wrapper scrolls sideways, so the page never does. | Lines are for dense repetition only. Text scaling: dense two-dimensional data may scroll within a labeled local region, never the page. |
| `Operator` | States who runs a service and who is signed in. | Say who is behind it. Explain at the point of action, or not at all. |

Shared helpers, exported from the same entry:

| Export | Module | Purpose |
| --- | --- | --- |
| `PreferencesProvider`, `usePreferences`, `useMedia` | `src/preferences.tsx` | Display settings, the document attributes that set them, and media queries as hooks. |
| `morphDuration` | `src/lib/motion.ts` | The duration function in section 6. |
| `growFrom`, `moveFrom` | `src/lib/morph.ts` | Grow an element from its origin, and move an element from where it was. Both are interruptible and respect reduced motion. |
| `oklchLightness`, `relativeLuminance`, `colorContrast`, `neutralContrast` | `src/lib/color.ts` | Read perceptual lightness, compute relative luminance and contrast from opaque CSS colors, or calculate an ideal C = 0 reference ratio. |
| `useScrollSpy` | `src/lib/useScrollSpy.ts` | The section being read. It follows the viewer's scrolling, and holds a jump target until a link's scroll ends. |

## 9. Verification scope and open requirements

Run these commands from the repository root. The audit run passed the checks below in Node 26.8.2 and Chrome 156.0.8078.48. This records the covered assertions, not complete language conformance. See [the audit report](../AUDIT.md) and [test instructions](../tests/README.md) for scope and limitations; rerun after changes.

| Command | What its result establishes | Current documentation status |
| --- | --- | --- |
| `npm test` | Foundation calculations, documentation/token agreement, rule coverage, preference bootstrap, and persisted-mail validation. | 19 tests passed. |
| `npm run typecheck` | Type compatibility across all four workspaces and the browser fixture, not behavioral conformance. | Passed. |
| `npm run build` | The workspace production builds complete, not visual or accessibility correctness. | Passed. |
| `npm run build:site` | The combined landing, docs, and flagship MPA writes to `dist/`. | Passed. |
| `npm run test:browser` | Covered component, color, reflow, focus, demo, and mail-recovery scenarios in `tests/browser.mjs`. | 31 checks passed in Chrome 156.0.8078.48. |

Browser review must cover all four scheme/contrast combinations, normal and reduced motion, keyboard operation, and twice-default text at desktop and narrow widths. Record actual colors and states when checking contrast. Page content must reflow without horizontal page scrolling; dense two-dimensional tables may scroll in a labeled local region, but tab labels must wrap. Height tokens describe minimum outer targets, not a guarantee that every wrapping row has a fixed height. Segmented and tab options are inset within their group's target.

Open requirements and manual limitations:

- Screen readers: verify meaningful state exposure, focus transitions, and asynchronous announcements with named browser/assistive-technology combinations. Automated DOM checks do not prove what is spoken.
- Forced colors: review native/system color mappings, boundaries, focus, and selected states in an actual forced-colors environment. Emulation and standard high-contrast tokens are not a substitute for this review.
- Insets: measure against rendered ink for the active font and browser. `text-box` support and font metrics vary; line-box fallbacks do not satisfy exact ink-inset equality. Do not claim cross-browser equality from token padding alone.
- Signal budget: review each region under the counting rule below. There is no automatic enforcement or blanket pass claim.
- Velocity continuity: current CSS transitions and Web Animations support position-based retargeting or reversal but do not guarantee continuous velocity under redirection. The language still requires it; this remains a conformance gap, not a waived requirement.

### Signal review rule

A region is an independently actionable task group: one dialog, one menu, one form section with its own heading, or one separately actionable card or pane. Define those boundaries before reviewing; do not subdivide a group merely to evade the budget. Review each region independently, including nested task groups.

The default budget is one independent saturated state signal per region. Repeated marks conveying the same error on the same object (its edge, error text, and icon) count as one signal. Distinct actionable errors count separately and must remain exposed even when they exceed the default budget; record this necessary exception rather than hiding errors or delaying their disclosure. Keyboard focus is a separate, mandatory interaction indicator and is exempt from the budget. Never remove or weaken focus to satisfy a signal count. Avoid additional decorative or redundant saturated signals.

## 10. For contributors

Use the conventions in [CONVENTIONS.md](CONVENTIONS.md) when contributing components. That file covers file layout, class names, which tokens to use, the shape and radius rules, the motion rules, the words rules, and the agency and access rules. Read it before writing or changing a component.
