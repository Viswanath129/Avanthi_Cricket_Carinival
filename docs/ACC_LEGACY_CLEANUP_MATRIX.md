# ACC 2026 Legacy Cleanup Matrix

| FILE | PURPOSE | REFERENCED BY | DEPLOYED | RUNTIME USED | BLUE BACKGROUND DEPENDENCY | STATUS | DELETE SAFE? | EVIDENCE |
|------|---------|---------------|----------|--------------|----------------------------|--------|--------------|----------|
| `index.html` (root) | Monolithic shell | Firebase hosting `**` rewrite | Yes (`/` catch-all) | Used as legacy shell | Contains `.opal-bg-root` HTML | [LEGACY] | YES (after extracting blue bg) | Replaced by `acc-auction-portal` |
| `Acc-Auction-Os.html` | Monolithic OS copy | Build tests, sync-dist | Yes (via dist) | Direct access | Contains `.opal-bg-root` HTML | [DUPLICATE] | YES | Identical SHA256 to `index.html` |
| `acc-auction-portal/client/index.html` | React portal shell | Vite build | Yes | Yes (auth routes) | None (currently) | [ACTIVE] | NO | Core React entry point |
| `acc-auction-portal/dist/index.html` | React built output | Hosting | Yes | Yes | N/A | [BUILD-GENERATED] | NO | Vite build output |
| `acc-auction-portal/dist/portal.html` | React app fallback | Hosting (`/portal` etc) | Yes | Yes | N/A | [BUILD-GENERATED] | YES (via sync-dist tweak) | Will be deprecated for `/index.html` |
| `acc-auction-portal/dist/os.html` | Monolithic OS copy | None | Yes | No | N/A | [BUILD-GENERATED] | YES (via sync-dist tweak) | Extraneous |
| `acc-auction-portal/dist/Acc-Auction-Os.html`| Monolithic OS copy | None | Yes | No | N/A | [BUILD-GENERATED] | YES (via sync-dist tweak) | Extraneous |
| `Blue-sky-2048x1166.svg` | Background | `index.html`, `sync-dist.js` | Yes | Yes | Source file | [ACTIVE] | NO | Required by requirements |
| `Blue-sky.mp4` | Background video | `index.html`, `sync-dist.js` | Yes | Yes | Source file | [ACTIVE] | NO | Required by requirements |
