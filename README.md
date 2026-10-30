# Humane Design Language

Interface design principles derived from perceptual premises. Every rule names the premise it follows from. This repository holds the language, a React and TypeScript reference implementation, interactive documentation, and a demonstration mail app.

**Public alpha, 0.1.0.** Rules are frozen for 0.1. Values remain open.

- Site: https://humane.mercuriusdream.com
- Language and system docs: https://humane.mercuriusdream.com/docs/
- Letters demo: https://humane.mercuriusdream.com/flagship/
- LLM documentation index: https://humane.mercuriusdream.com/llms.txt
- Agent documentation map: [AGENT-MAP.md](AGENT-MAP.md)

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
