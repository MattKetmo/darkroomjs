/**
 * Copy repo-root build/ into demo/build/ so demo relative URLs keep working
 * without symlinks (Windows-friendly, static hosting friendly).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'build');
const demoBuild = path.join(root, 'demo', 'build');

if (!fs.existsSync(buildDir)) {
  console.warn(
    'sync-demo-build: skip — build/ missing (run npm run build:js && npm run build:css first)',
  );
  process.exit(0);
}

fs.rmSync(demoBuild, { recursive: true, force: true });
fs.mkdirSync(demoBuild, { recursive: true });
fs.cpSync(buildDir, demoBuild, { recursive: true });
