import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildSvgSprite(iconsDir) {
  const files = fs
    .readdirSync(iconsDir)
    .filter((f) => f.endsWith('.svg'))
    .sort();
  const symbols = files.map((f) => {
    const fp = path.join(iconsDir, f);
    const raw = fs.readFileSync(fp, 'utf8');
    const id = path.basename(f, '.svg');
    const vbMatch = raw.match(/viewBox="([^"]+)"/);
    const viewBox = vbMatch ? vbMatch[1] : '0 0 24 24';
    const inner = raw
      .replace(/<\?xml[\s\S]*?\?>/g, '')
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/gi, '')
      .trim();
    return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`;
}

function darkroomIconsSpritePlugin() {
  return {
    name: 'darkroom-icons-sprite',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.includes('/lib/js/core/bootstrap.js')) {
        return null;
      }
      const iconsDir = path.resolve(__dirname, 'lib/icons');
      const sprite = buildSvgSprite(iconsDir);
      return code.replace(
        "element.innerHTML = '<!-- inject:svg --><!-- endinject -->';",
        `element.innerHTML = ${JSON.stringify(sprite)};`,
      );
    },
  };
}

export default defineConfig({
  plugins: [darkroomIconsSpritePlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/entry-darkroom.js'),
      name: 'Darkroom',
      formats: ['iife'],
      fileName: () => 'darkroom.js',
    },
    outDir: 'build',
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {},
  },
});
