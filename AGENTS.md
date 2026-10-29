# AGENTS.md

Guidance for agents working in this repository.

## Layout

- `system/` is `humane-system`, the reference implementation. Component rules live in [system/CONVENTIONS.md](system/CONVENTIONS.md); the system specification is [system/README.md](system/README.md). The package is private and exports source TypeScript.
- `docs/`, `landing/`, and `flagship/` are the three site entry points, built together by the root Vite config into `dist/`.
- `tests/` holds the node tests (`*.test.mjs`) and `browser.mjs`, the headless Chrome suite.
- `LANGUAGE.md` is the normative language text. The docs site parses it at build time via `docs/src/language.ts`; edit the markdown, never the rendered output.

## Commands

- `npm ci`, `npm run dev`, `npm run build:site`, `npm run typecheck`, `npm test`, `npm run test:browser`.
- `test:browser` uses a local Chrome or Chromium (`CHROME_PATH` overrides discovery) and runs in CI.
- `test:safari` drives real Safari over safaridriver (macOS only, needs "Allow remote automation" in Safari Settings > Developer). It checks the production site; `SMOKE_BASE` overrides the target.

## Rules

- Follow `system/CONVENTIONS.md` for components, tokens, class names, and spacing. No raw colors, no font sizes outside type tokens, no new dependencies.
- Interface copy follows the language: no em-dashes, no tracked or uppercase or monospace labels, no text badges for state.
- Verify with `npm run typecheck && npm test`, plus `npm run test:browser` for interaction or visual changes. Compilation is not conformance.

## Deploy

- `npm run build:site`, then `wrangler pages deploy dist --project-name humane-design-language --branch main`. Wrangler is authenticated to the account that owns the Pages project.
- The custom domain `humane.mercuriusdream.com` resolves in a different Cloudflare account. DNS writes need `CLOUDFLARE_ACCOUNT_ID=7f26317dfae4c25fc83faf797acac2d4`; Pages commands need `d08e3b08410e67ef303952f97ec11235`.
