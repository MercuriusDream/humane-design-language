# Documentation map for coding agents

Use this map to find the authoritative source before reading or editing implementation files.

## Authority and scope

- [LANGUAGE.md](LANGUAGE.md) is normative for the design language.
- Component `Props` types and implementations in `system/src/` are authoritative for the public API and runtime behavior. Their matching pages in `docs/src/system-docs/` document that API.
- [system/README.md](system/README.md) specifies the reference system's tokens, values, and known limits. Where a token or duration differs, `system/src/styles/tokens.css` and `system/src/lib/motion.ts` are authoritative.
- [system/CONVENTIONS.md](system/CONVENTIONS.md) governs contributions to `system/src/components/`.
- [AUDIT.md](AUDIT.md), [DEPLOY.md](DEPLOY.md), and [tests/README.md](tests/README.md) describe verification and operations, not additional design rules.

When sources disagree, identify the conflict rather than silently inventing a third contract.

## Task router

| Task | Read and edit |
| --- | --- |
| Implement or change a component | [system/CONVENTIONS.md](system/CONVENTIONS.md), the component and stylesheet in `system/src/components/`, its `Props` type, and its page in `docs/src/system-docs/` |
| Change a token or motion value | The source in `system/src/styles/` or `system/src/lib/`, the matching specification table in [system/README.md](system/README.md), and the relevant tests |
| Change a language rule | [LANGUAGE.md](LANGUAGE.md), its parser in `docs/src/language.ts`, and its example in `docs/src/examples/` |
| Add a language rule | Follow the parser contract below, add the example named by the rule slug, and run the documentation tests |
| Change site copy | The relevant entry in `landing/src/`, `docs/src/`, or `flagship/src/`; use [LANGUAGE.md](LANGUAGE.md) only for normative wording |
| Change verification or deployment | [tests/README.md](tests/README.md), [AUDIT.md](AUDIT.md), or [DEPLOY.md](DEPLOY.md) as applicable |
| Change machine-readable documentation | `public/llms.txt`, `llms.manifest.mjs`, and the canonical Markdown source. Never edit generated copies in `dist/`. |

## Language parser contract

`docs/src/language.ts` reads `LANGUAGE.md` directly. Preserve these structures:

- Section and group headings must match the regular expressions in `GROUPS`, `INTENT`, and `CONFORMANCE`.
- A rule begins with a bold name, such as `**Rule name.**`, followed by its text.
- A rule's premise citation ends the paragraph in the form `*(Premise name.)*`.
- Bullet lines immediately following a rule belong to that rule.
- Each rule name produces a unique kebab-case slug. Its example lives at `docs/src/examples/<slug>.tsx` and is registered by `import.meta.glob`.
- `<Serves>` references in system documentation must resolve to those slugs.

A heading or rule-name change is a coupled change to parsing, examples, citations, and tests. Do not rename only the Markdown heading.

## Package facts

`system/` is the private `humane-system` package. It exports React 19 source TypeScript and CSS, not a prebuilt runtime. Consumers need a TypeScript and CSS-aware bundler. Wrap applications using preferences or motion in `PreferencesProvider`. The package also exports `./styles.css` for consumers that need only the foundation styles.

## Verify

Run `npm run typecheck && npm test`. Run `npm run test:browser` for interaction or visual changes and `npm run build:site` before deployment. Compilation alone does not establish conformance.
