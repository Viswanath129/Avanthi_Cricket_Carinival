# Dispatch Log

## 2026-10-07T16:39:31Z

You are the Project Orchestrator (orchestrator_4) for the ACC 2026 Cricket Auction Platform.

Your working directory is: B:\projects\ACC\.agents\teamwork\orchestrator_4
Project root is: B:\projects\ACC
Authoritative user request file: B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md

The user has submitted the following request:
"Perform a comprehensive end-to-end verification of the ACC 2026 Cricket Auction Platform, covering every feature surface (Admin Console, Franchise Registration, Player Registration, Auction Mechanics, Photo Editor, Auth Flows, Live/Projector Views), and implement true cross-device real-time live synchronization so that timer countdowns, bid amounts, lot changes, squad updates, and auction state propagate instantly to all connected clients without any page reload — similar to how Google Maps, Rapido, or stock-market trading terminals push live data.

Working directory: B:\projects\ACC
Integrity mode: development

The application is a single-file HTML app (`Acc-Auction-Os.html`, ~17,000 lines) deployed to Firebase Hosting at `https://studio-6471864054-30ce7.web.app`. It uses Firebase Auth, Firestore, and Realtime Database. Three copies must always remain byte-identical: `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html`.

## Requirements

### R1. Full Feature Verification & Flaw Discovery
Systematically test every user-facing feature across all roles (Player, Franchise, Admin/Super Admin, Public Visitor). For each feature, verify it works correctly end-to-end. Document any flaws found (broken flows, dead buttons, incorrect calculations, styling issues, auth leaks, missing validations) and fix them. Key surfaces to verify:
- **Admin Console**: All tabs (PLAYERS, FRANCHISES, AUCTION, SETTINGS, ADMIN_ACCOUNTS), player approval/reject/block/archive workflow, franchise approval, credential generation, bucket management, lot draw modes (Auto/Manual/Quick Call), hammer sale confirmation, undo sale, skip/unsold, behalf bid, direct assign, pause/resume.
- **Player Registration**: Multi-step form, photo editor (4:3 crop, zoom, pan, rotation), field validations, duplicate roll detection, submission to pending approval.
- **Franchise Registration**: Multi-step form, logo upload with photo editor, member management, coordinator/captain identity selection.
- **Auth Flows**: Player login, Franchise login (Coordinator + Captain), Admin Email/Password login, route isolation (`/login?mode=player|franchise|admin`), session persistence, logout cleanup.
- **Auction Mechanics**: Bid increment tiers, purse calculations, slot protection, max legal bid enforcement, timer activation on first bid only (30s poised → 20s active), bucket quota enforcement.
- **Public & Live Views**: Player roster, franchise cards, live auction projector view, public live stream view.

### R2. Cross-Device Real-Time Live Sync (Zero-Reload Architecture)
Implement true real-time synchronization so that ALL connected clients (Admin on laptop, Franchise terminals on phones, Projector on TV, Public viewers on any device) see auction state updates instantly without page reload. This must work like stock-market tickers or ride-hailing apps:
- **Timer countdown**: All devices must show the same countdown in sync (using server-time-offset corrected deadlines, not client-local intervals).
- **Bid amounts & leading bidder**: When any franchise bids, every other device must reflect the new price and leader within 1-2 seconds.
- **Lot transitions**: When admin draws a new player or hammers a sale, all views update instantly.
- **Squad & purse changes**: Franchise terminals must reflect purse deductions and squad additions in real-time.
- **Connection status**: Show live/offline/reconnecting indicators on every view.
- The existing Firestore `onSnapshot` listeners and BroadcastChannel infrastructure should be leveraged and completed — the foundation exists but the reactive UI re-render pipeline on incoming snapshots needs to be verified and fixed so every view actually updates its DOM when state changes arrive, without requiring the user to navigate away and back.

### R3. Regression Defense & Deployment Parity
All fixes and real-time sync additions must preserve the existing auction logic, bidding rules, purse calculations, and security model. After all changes:
- The three HTML files must remain byte-identical (SHA256 parity).
- Deploy to Firebase Hosting and verify HTTP 200 on the live URL.
- No existing keyboard shortcuts, modal flows, or admin workflows may break.

## Acceptance Criteria

### Feature Verification
- [ ] Every admin action (approve, reject, block, archive, restore, edit player/franchise) completes without JS errors and updates the UI correctly.
- [ ] Player registration form submits successfully with photo crop, validates required fields, and rejects duplicate roll numbers.
- [ ] Franchise registration form submits with logo upload, adds members, and creates the franchise in PENDING_APPROVAL state.
- [ ] Admin login via Email/Password authenticates without `auth/configuration-not-found` errors.
- [ ] Auth route isolation works: `/login?mode=player` shows only player auth, `/login?mode=franchise` shows only franchise auth, `/login?mode=admin` shows only admin auth.
- [ ] Auction flow: Draw lot → first bid starts 20s timer → counter-bids reset timer → hammer confirms sale → purse deducted → player added to squad.
- [ ] All keyboard shortcuts (H, S, P, U, B, A, D, N, R, Space, ?, Ctrl+E, Ctrl+S, Esc) function correctly on the Auction tab.

### Real-Time Live Sync
- [ ] Open Admin Console on one browser and Franchise Terminal on another browser/device. Place a bid from the franchise — the admin view updates bid amount and leading bidder within 2 seconds without any page reload or manual refresh.
- [ ] Open Projector View on one screen and Admin Console on another. Draw a new lot from admin — the projector view shows the new player within 2 seconds.
- [ ] Timer countdown on Franchise Terminal and Projector View stays within ±1 second of the Admin Console's timer at all times.
- [ ] When admin hammers a sale, the franchise terminal's purse and squad roster update within 2 seconds.
- [ ] Connection status badge accurately reflects LIVE/OFFLINE state on all views.
- [ ] Closing and reopening a browser tab restores the current auction state from Firestore without requiring admin to re-broadcast.

### Regression & Deployment
- [ ] SHA256 hash of `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html` are identical after all changes.
- [ ] `firebase deploy --only hosting` succeeds and `curl -I https://studio-6471864054-30ce7.web.app` returns HTTP 200.
- [ ] No JavaScript console errors on any view during normal operation flow.
