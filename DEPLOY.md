# Deploying the site

The public site is three static entry points built by the root Vite config:

- `/` is the landing page.
- `/docs/` is the language, system, and component documentation.
- `/flagship/` is the local Letters demonstration.

## Build

From the repository root:

```sh
npm ci
npm run build:site
```

Upload the contents of `dist/` to the host. Keep the `docs/` and `flagship/` directories as directories; assets are versioned under `assets/`.

Do not deploy `system/`, `docs/src/`, `flagship/src/`, `krds/`, or `example/`. `npm run build` builds the workspace outputs separately; `build:site` is the combined deploy artifact.

## Production routes

The app is a static MPA at the origin root. The host must serve:

- `/docs` and `/flagship` as redirects to `/docs/` and `/flagship/`. The `trailingSlash` middleware in `vite.config.ts` is development-only. The checked-in `public/_redirects` file ships those 301s with the build; Cloudflare Pages and Netlify read it. Configure the same redirect at any other host.
- `index.html` for each entry at its directory root.
- Hashed files under `assets/` with a long cache lifetime.
- HTML with a short cache lifetime and revalidation.

If the site is served below a path prefix, set Vite's `base` and the corresponding redirects before building. The checked-in config assumes the origin root.

## Smoke test after deploy

1. Open `/`, `/docs/`, and `/flagship/` directly, then reload each one.
2. Open a deep docs URL with a hash, such as `/docs/#sharp-corners-round-marks`, and confirm the page loads and scrolls.
3. Confirm the docs examples load their styles and the flagship opens its mailboxes.
4. Check the console for missing assets or uncaught errors.
5. Run the same page at 390px and 1440px, then at 200% browser text size, and confirm the page does not scroll horizontally.
6. Check all four scheme/contrast combinations from the sidebar preferences.

## Browser baseline

Requires `light-dark()`, OKLCH, native `dialog` and Popover, `:has()`, container queries, and `text-box`. Chrome 156 and Safari 27 are tested engines (`tests/browser.mjs` and `tests/safari.mjs`). Browsers without `text-box` keep the layout but lose exact ink trimming; browsers without native Popover have no menu fallback. Firefox is not certified by the suites.

## Package release is separate

`system/package.json` is `private` and exports source TypeScript from the workspace. It is not an npm-publishable package as configured. The repository is MIT-licensed; before publishing `humane-system` to npm, also establish a versioned release record, compiled JavaScript and type declarations (or a documented source-consumer contract), and an install test outside this workspace.

## Manual checks that remain

Automated checks cover Chrome and Safari, token contrast, reflow, focus paths, forced-colors emulation, and core interactions. Static verification covers programmatic exposure: live regions, control names, and focus targets.

Not yet verified:

- VoiceOver and NVDA reading of the docs definition lists, forms, dialogs, menus, and announcements. Static checks passed; no end-to-end screen-reader pass.
- A real forced-colors environment. Only emulation is verified.
- Firefox rendering, especially `text-box`, OKLCH gamut mapping, and popover positioning.
- A visual pass over the complete docs and flagship at 200% text.
