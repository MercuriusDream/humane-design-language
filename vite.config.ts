import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { LLM_DOCS } from './llms.manifest.mjs';

// The whole project on one server: the landing at /, the language and system at /docs/, Letters at /flagship/.
// Each part still runs alone from its own folder.
const pages = {
  landing: resolve(import.meta.dirname, 'index.html'),
  docs: resolve(import.meta.dirname, 'docs/index.html'),
  flagship: resolve(import.meta.dirname, 'flagship/index.html'),
};

/** Publish canonical Markdown under mirrored /llms/ paths, in development and in the deploy artifact. */
const llms: Plugin = {
  name: 'llms',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      const source = LLM_DOCS.find((file) => path === `/llms/${file}`);
      if (!source) return next();
      res.setHeader('Content-Type', source.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8');
      res.end(readFileSync(resolve(import.meta.dirname, source)));
    });
  },
  generateBundle() {
    for (const source of LLM_DOCS) {
      this.emitFile({ type: 'asset', fileName: `llms/${source}`, source: readFileSync(resolve(import.meta.dirname, source)) });
    }
  },
};

/** /docs and /flagship, typed without the slash, go to their pages rather than a blank 404. */
const trailingSlash: Plugin = {
  name: 'trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const [path, query = ''] = (req.url ?? '').split('?');
      if (path === '/docs' || path === '/flagship') {
        res.writeHead(301, { Location: `${path}/${query ? `?${query}` : ''}` });
        res.end();
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), llms, trailingSlash],
  appType: 'mpa',
  // The vendored KRDS reference and old example hold their own HTML; only these pages are crawled for dependencies.
  optimizeDeps: { entries: Object.values(pages) },
  server: {
    watch: { ignored: ['**/krds/**', '**/example/**', '**/dist/**'] },
  },
  build: {
    outDir: 'dist',
    rollupOptions: { input: pages },
  },
});
