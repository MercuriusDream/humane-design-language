# Humane Design Language

*A humane perception.*

A design language derived from perceptual premises: every rule names the premise it follows from. This repository holds the language, a reference implementation, and the site that documents them.

**Public alpha, 0.1.0.** Rules are frozen for 0.1. Values remain open.

- Site: https://humane.mercuriusdream.com
- Language and system docs: https://humane.mercuriusdream.com/docs/
- Letters demo: https://humane.mercuriusdream.com/flagship/

The site uses Cloudflare Web Analytics.

## The language

[LANGUAGE.md](LANGUAGE.md) is the normative text. It defines relationships rather than fixed values, in three layers: premises, rules, and signature. The docs site parses this file at build time, so the page cannot drift from it.

## Repository

| Path | Contents |
| --- | --- |
| `system/` | `humane-system`, the React and TypeScript reference implementation. Private until packaged. |
| `docs/` | The docs app: the language rendered, plus system component documentation. |
| `landing/` | The landing page. |
| `flagship/` | Letters, the flagship demonstration. |
| `tests/` | Node tests and the headless Chrome browser suite. |
| `public/` | Host files shipped with the build. |

## Develop

```sh
npm ci
npm run dev
npm run build:site
npm run typecheck
npm test
npm run test:browser
```

Deploy steps live in [DEPLOY.md](DEPLOY.md). The release audit is [AUDIT.md](AUDIT.md). Upstream sources are credited in [REFERENCES.md](REFERENCES.md).

## License

[MIT](LICENSE).
