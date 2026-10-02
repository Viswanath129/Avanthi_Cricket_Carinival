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

// Remove any React assets bundle directory to ensure zero external styles or scripts
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
}

// Remove any lingering portal.html or temporary bundles
const distPortal = path.join(distDir, 'portal.html');
if (fs.existsSync(distPortal)) {
  fs.rmSync(distPortal, { force: true });
}

// 1. Copy root index.html (Acc-Auction-Os.html) into dist
const rootIndex = path.join(rootDir, 'index.html');
const rootOs = path.join(rootDir, 'Acc-Auction-Os.html');

if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, path.join(distDir, 'index.html'));
  fs.copyFileSync(rootIndex, path.join(distDir, 'os.html'));
  console.log('[sync-dist] Synced primary ACC 2026 application into dist/index.html and dist/os.html');
}

if (fs.existsSync(rootOs)) {
  fs.copyFileSync(rootOs, path.join(distDir, 'Acc-Auction-Os.html'));
  console.log('[sync-dist] Synced Acc-Auction-Os.html into dist/');
}

// 2. Copy static media assets
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

// 3. Ensure public mirror directory is updated as well
const publicDir = path.join(distDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, path.join(publicDir, 'index.html'));
  fs.copyFileSync(distIndex, path.join(publicDir, 'Acc-Auction-Os.html'));
}

console.log('[sync-dist] Completed static asset & distribution sync: Acc-Auction-Os.html is the sole authoritative application!');
