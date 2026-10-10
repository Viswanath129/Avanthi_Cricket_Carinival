import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(__dirname, 'dist');

// The root standalone application is the production Avanthi player portal.
// Do not publish the unrelated React ACCA demo bundle that Vite builds first.
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const rootIndex = path.join(rootDir, 'index.html');
fs.copyFileSync(rootIndex, path.join(distDir, 'index.html'));
fs.copyFileSync(rootIndex, path.join(distDir, 'os.html'));

for (const asset of [
  'acc-logo.png', 'acc-logo.jpg', 'auction-hammer.svg',
  'Blue-sky-2048x1166.svg', 'Blue sky-2048x1166.svg',
  'Blue-sky.mp4', 'Blue sky.mp4',
]) {
  const source = path.join(rootDir, asset);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(distDir, asset));
}

console.log(`[sync-dist] Published the production Avanthi portal from ${rootIndex}.`);
