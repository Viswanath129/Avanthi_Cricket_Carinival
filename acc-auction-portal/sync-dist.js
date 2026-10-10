import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// Vite already creates the complete deployable bundle here. Replacing it with
// the legacy standalone HTML disconnected the live UI from callable functions.
console.log(`[sync-dist] Preserved Vite's Firebase-connected bundle in ${distDir}.`);
