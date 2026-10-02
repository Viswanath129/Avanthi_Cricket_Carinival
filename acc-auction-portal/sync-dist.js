import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Maintain React bundle as the primary SPA index.html
// The React build outputs to dist/index.html. We will also alias it to portal.html for backward compatibility if needed, though all firebase rewrites will point to index.html anyway.
const distIndex = path.join(distDir, 'index.html');
const distPortal = path.join(distDir, 'portal.html');
if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, distPortal);
  console.log('[sync-dist] Maintained React bundle as dist/index.html and dist/portal.html');
}

// 2. Sync standalone legacy OS to dist/os.html and dist/Acc-Auction-Os.html (DO NOT overwrite dist/index.html!)
const rootOs = path.join(rootDir, 'Acc-Auction-Os.html');
if (fs.existsSync(rootOs)) {
  fs.copyFileSync(rootOs, path.join(distDir, 'os.html'));
  fs.copyFileSync(rootOs, path.join(distDir, 'Acc-Auction-Os.html'));
  console.log('[sync-dist] Synced standalone legacy OS into dist/os.html and dist/Acc-Auction-Os.html');
}

// 3. Copy static assets
const assetsToCopy = [
  'acc-logo.png',
  'acc-logo.jpg',
  'auction-hammer.svg',
  'Blue-sky-2048x1166.svg',
  'Blue sky-2048x1166.svg',
  'Blue-sky.mp4',
  'Blue sky.mp4'
];

for (const asset of assetsToCopy) {
  const src = path.join(rootDir, asset);
  const dest = path.join(distDir, asset);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// 4. Ensure public mirror directory is updated as well
const publicDir = path.join(distDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (fs.existsSync(distIndex)) {
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(publicDir, 'index.html'));
  fs.copyFileSync(distPortal, path.join(publicDir, 'portal.html'));
}

console.log('[sync-dist] Completed static asset & distribution sync!');
