import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// The whole project on one server: the landing at /, the language and system at /docs/, Letters at /flagship/.
// Each part still runs alone from its own folder.
const pages = {
  landing: resolve(import.meta.dirname, 'index.html'),
  docs: resolve(import.meta.dirname, 'docs/index.html'),
  flagship: resolve(import.meta.dirname, 'flagship/index.html'),
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
  plugins: [react(), trailingSlash],
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
