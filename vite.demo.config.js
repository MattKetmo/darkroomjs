import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Static server for `demo/` (run `npm start` or `npm run build && npm run sync:demo` first). */
export default defineConfig({
  root: path.resolve(__dirname, 'demo'),
  server: {
    port: 2222,
    strictPort: true,
  },
});
