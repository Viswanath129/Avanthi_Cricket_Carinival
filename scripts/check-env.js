import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const portalDir = path.resolve(rootDir, 'acc-auction-portal');

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL'
];

function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, missing: REQUIRED_KEYS };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const foundKeys = new Set();

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (val && !val.includes('your-') && !val.includes('000000')) {
        foundKeys.add(key);
      }
    }
  }

  const missing = REQUIRED_KEYS.filter(k => !foundKeys.has(k) && !process.env[k]);
  return { exists: true, missing };
}

console.log('[check-env] Validating ACC 2026 environment configuration...');

// Check process.env first or check .env in portal directory
const targetEnv = path.join(portalDir, '.env');
const result = checkEnvFile(targetEnv);

if (!result.exists && !REQUIRED_KEYS.every(k => process.env[k])) {
  console.error(`[check-env] ERROR: Missing .env file at ${targetEnv}`);
  console.error(`[check-env] Create .env from .env.example before building.`);
  process.exit(1);
}

if (result.missing.length > 0) {
  console.error('[check-env] ERROR: The following required environment variables are missing or have placeholder values:');
  result.missing.forEach(k => console.error(`  - ${k}`));
  process.exit(1);
}

console.log('[check-env] Environment validation passed: All required Firebase variables configured.');
process.exit(0);
