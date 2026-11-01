# Regression checks

Run from the repository root after `bun install`:

```sh
bun run typecheck
bun test
bun run build
bun run build:site
bun run test:browser
```

`bun run build:site` writes the combined landing/docs/flagship MPA to `dist/`. The tests add no package dependencies. `bun test` runs the unit and documentation suites directly. The browser runner uses the installed Vite and Chrome DevTools Protocol through the runtime's WebSocket API.

`bun run test:browser` needs a local Chrome or Chromium installation and a free port **4179**. Common macOS/Linux locations are detected. Override the executable if necessary:

```sh
CHROME_PATH=/path/to/chromium bun run test:browser
```

Chrome runs headlessly in a **new temporary browser profile**. Your normal browser data is not read or changed. Vite and Chrome are stopped after the run, and the temporary profile is removed. On failure, a screenshot is written to the OS temporary directory as `humane-browser-failure.png`.

## Scope

- `foundations.test.mjs`: actual-color WCAG calculations, all four token palettes, normal heading tracking, duration/radius relationships, bezier and Hermite velocity continuity, validation of stored preferences, and first-paint/provider agreement.
- `documentation.test.mjs`: an example for every language entry, resolvable premise/component citations, palette-table agreement, and reproducible documented contrast ratios.
- `llms.test.mjs`: canonical document presence, unique index links, mirrored relative-link integrity, and no duplicated Markdown sources in `public/`.
- `mail-storage.test.mjs`: versioned snapshot round trips, invalid-data rejection, archive provenance, recipient validation, and arrival-announcement policy.
- `browser.mjs`: loading geometry, independent row actions, media-query changes, arrival announcements/focus, notice/choice spacing and 200% row geometry, the 2px corner cap and switch pill, forced-colors choice and switch geometry, semantic docs definition lists, disabled variants, reversible removal, FLIP interruption, sRGB canvas-rendered token contrast and strokes in all four modes, checkbox boundary thickening without optional control edges, menu top-layer positioning and Escape, 200% text reflow, overlay focus recovery, stable docs scroll chrome, landing analytics-notice persistence, in-place reader selection, live demo readouts, single-pane navigation, draft/settings persistence, recipient errors, archive restoration, send timing/failure recovery, preservation of unsupported stored mail, and rejection of stale-session writes after an external snapshot change.

The app reflow scenarios use **390px and 1440px viewports** and a **32px browser default font** (200% of 16px), not just a CSS zoom transform. Component scenarios exercise ordinary and reduced-motion paths, but do not exhaust every state of every component.

These checks are not a screen-reader certification, a full screenshot comparison, or proof of every conformance rule. They do not establish cross-browser ink-inset equality, actual forced-colors environments (the emulated fallback geometry is covered), or signal-budget compliance. See [`../AUDIT.md`](../AUDIT.md).
