# Project: ACC 2026 Cricket Auction Platform - Live Sync & Feature Verification

## Architecture
- **Application Model**: Single-file Web OS (`Acc-Auction-Os.html`, ~17,000 lines) with matching mirrors (`index.html` and `acc-auction-portal/dist/index.html`).
- **Backend & Cloud Services**: Firebase Authentication, Cloud Firestore (`acc_auctions`, `players`, `franchises`, `users`), Firebase Realtime Database (`auctionState`, `presence`, `publicStats`, `.info`), Firebase Cloud Storage, and Firebase Hosting (`studio-6471864054-30ce7`).
- **Live Sync Dual-Channel Pipeline**:
  - **Fast Pipe**: Firebase Realtime Database WebSocket channel (`auctionState/live`) for ultra-low-latency (<100ms) bid, lot, timer deadline, and leading bidder state propagation across all connected devices (Admin, Franchise, Projector, Public).
  - **Persistence Pipe**: Firestore document `acc_auctions/acc_main_2026` for cold start, durable audit trail, and historical recovery.
  - **Zero-Reload Reactive DOM Engine**: Targeted element mutators (`updateLiveAuctionDOM`, `updateTimerDOM`) replacing full `innerHTML` re-parsing, eliminating input blur, form focus loss, and scroll jumps.
  - **Clock Synchronization**: Median-of-8 sample NTP filter using `.info/serverTimeOffset` ensuring all clients tick against identical server-corrected epoch deadlines (`sNow + remainingMs`).
  - **Connection State Machine**: Tri-state live indicators (`LIVE` green pulse, `RECONNECTING` amber spinner, `OFFLINE` red solid) with automatic resubscription on network wake.
- **Role Isolation & Security Boundaries**:
  - URL query mode isolation (`/login?mode=player|franchise|admin`) rendering dedicated authentication interfaces.
  - Removal of automatic `DEMO_MODE` Super Admin bypass on `#admin` hash navigation and elimination of post-logout auto-login loops.
  - Proper scoping of keyboard shortcuts (`H`, `S`, `P`, `U`, `B`, `A`, `D`, `N`, R, Space) and timer modals strictly to authenticated administrators.
- **3-File Byte Parity Invariant**:
  - `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html` MUST remain 100% bit-for-bit SHA-256 byte identical.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | RTDB Fast-Pipe Live Sync | Realtime Database WebSocket channel for sub-100ms bid, leader, and lot broadcasts | M1 | Survey Explorer Sync |
| 2 | Fine-Grained Reactive DOM Patching | Targeted DOM element updates avoiding page-level innerHTML thrashing and input blur | M1 | Survey Explorer Sync |
| 3 | Server-Time Offset Synchronized Timer | Cross-device timer countdown adhering to server deadlines within ±1 second | M1 | ORIGINAL_REQUEST §R2 |
| 4 | Admin SVG Timer Ring Selector Fix | Align SVG ring stroke-dasharray selector ('327' & '157') restoring countdown ring animation | M1 | Survey Explorer Sync |
| 5 | Reactive Franchise & Squad Sync | Add onSnapshot listener for franchises and handle FRANCHISE_STATE_MUTATION in BroadcastChannel | M1 | Survey Explorer Sync |
| 6 | Resilient Tri-State Connection Badges | LIVE/RECONNECTING/OFFLINE indicators across Admin, Franchise, Projector, and Public views | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Network Reconnect Auto-Resubscription | Fix online event listener to call RealtimeManager.subscribeAuctionState | M1 | Survey Explorer Sync |
| 8 | Auth Route Query Parameter Isolation | Support /login?mode=player, franchise, and admin rendering single-persona forms | M1 | ORIGINAL_REQUEST §R1 |
| 9 | Secure Session Lifecycle & Logout Loop Fix | Clear acc_last_active_view on logout and eliminate auto-login bypass on #admin | M1 | Survey Explorer Features |
| 10 | Direct Assign & Undo Sale Relational Integrity | Set soldTo, soldPrice on direct assign; fix alphanumeric roll truncation; support undo refund | M1 | Survey Explorer Features |
| 11 | Manual Lot Modal String ID Syntax Fix | Quote player IDs in revealAndStartAuctionLot('${p.id}') preventing JS syntax crashes | M1 | Survey Explorer Features |
| 12 | Quick Lot Call Number Mapping | Map Lot # correctly to catalog lots rather than searching by player ID | M1 | Survey Explorer Features |
| 13 | Draw Mode Toggle State Alignment | Fix toggleDrawMode to cycle AUTO <-> MANUAL properly, making manual lot selection accessible | M1 | Survey Explorer Features |
| 14 | Photo Cropper Clean Canvas Fill | Replace dark #0b0f19 fill with transparent/clean fill preserving PNG logos and photos | M1 | Survey Explorer Features |
| 15 | Franchise Approval Dual Account Creation | Provision both Coordinator and Team Leader (Captain) accounts upon franchise approval | M1 | Survey Explorer Features |
| 16 | Scoped Keyboard Shortcuts & Admin Modals | Gate keyboard shortcuts (H, S, P, U, B, A, D, N, R, Space) and timer zero modals strictly to Admin role | M1 | Survey Explorer Features |
| 17 | Franchise Terminal Pass Action Wiring | Connect PASS button to passLot(myFranchise.id) properly recording franchise pass status | M1 | Survey Explorer Features |
| 18 | Public View Lot Index Synchronization | Fix public view lot resolution using master players index rather than filtered subset | M1 | Survey Explorer Features |
| 19 | Franchise Cards Dynamic Status Badges | Reflect actual franchise status (ACTIVE, PENDING_APPROVAL, DISABLED) on public franchise cards | M1 | Survey Explorer Features |
| 20 | Franchise Public Registration Typo Fix | Correct RealtimeManager method call in franchise registration avoiding runtime TypeError | M1 | Survey Explorer Sync |
| 21 | End-to-End Automated Acceptance Verification | Comprehensive test suites validating all role workflows, real-time sync, and edge cases | M2 | ORIGINAL_REQUEST §R1 |
| 22 | Adversarial Stress & Chaos Verification | Boundary conditions, concurrent bidding, clock drift simulation, network toggle tests | M2 | Project Pattern Tier 5 |
| 23 | 3-File Bit-for-Bit SHA-256 Byte Parity | Exact byte parity across Acc-Auction-Os.html, index.html, and acc-auction-portal/dist/index.html | M3 | ORIGINAL_REQUEST §R3 |
| 24 | Firebase Hosting Production Deployment | Deploy to studio-6471864054-30ce7 and verify HTTP 200 on live web app | M3 | ORIGINAL_REQUEST §R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Platform Remediation & Live Sync Engine | Features 1–20: RTDB fast-pipe, granular DOM patching, timer clock sync, SVG ring fix, franchise sync, connection badges, reconnect, auth query isolation, logout fix, direct assign & undo, manual lot syntax, quick call, photo cropper fill, captain account, scoped shortcuts, pass button, public lot sync, registration typo | none | IN_PROGRESS |
| M2 | E2E Verification & Adversarial Testing | Features 21–22: Comprehensive automated acceptance testing, cross-device sync simulation, adversarial stress testing | M1 | PLANNED |
| M3 | 3-File Byte Parity & Production Deployment | Features 23–24: SHA-256 byte parity synchronization, Firebase Hosting deployment, live URL verification | M2 | PLANNED |

## Interface Contracts

### Live Sync State Contract (RTDB `/auctionState/live`)
- Path: `auctionState/live`
- Schema:
  ```json
  {
    "lotId": "string | number",
    "lotIndex": "number",
    "currentBid": "number",
    "leadingBidderId": "number | string | null",
    "timerDeadline": "number | null",
    "timerDuration": "number",
    "timerRunning": "boolean",
    "timerVersion": "number",
    "auctionPaused": "boolean",
    "pausedRemainingMs": "number | null",
    "timestamp": "number",
    "updatedBy": "string"
  }
  ```

### Reactive DOM Patching Contract
- `updateLiveAuctionDOM(state, isPartial)`:
  - Updates `#liveCurrentBidText`, `#liveLeadingBidderName`, `#liveNextLegalBid`, `#liveBidIncrement`.
  - Animates price badge if bid increased.
  - Does NOT rewrite `appMain.innerHTML`.
- `updateTimerDOM(remainingMs, remainingSeconds, isRunning, isPaused)`:
  - Updates all `.timer-countdown-number` and `.admin-timer-text`.
  - Updates SVG circles matching `svg circle[data-timer-ring], svg circle[stroke-dasharray='157'], svg circle[stroke-dasharray='327']`.

### Direct Assign & Undo Sale Contract
- Assigned Player Object:
  - `player.status = 'SOLD'`
  - `player.franchiseId = franchise.id`
  - `player.franchiseName = franchise.name`
  - `player.soldTo = franchise.name`
  - `player.soldPrice = price`
  - `player.salePrice = price`
  - `player.price = price`
- `executeUndoSale(playerId)`:
  - Finds franchise by `player.soldTo || player.franchiseName`.
  - Refunds `player.soldPrice || player.price || player.salePrice`.
  - Removes player from franchise squad.
  - Resets player status to `'AVAILABLE'`.

## Code Layout & Write Boundaries
- Core Application: `B:\projects\ACC\Acc-Auction-Os.html`
- Mirrors (Byte Parity):
  - `B:\projects\ACC\index.html`
  - `B:\projects\ACC\acc-auction-portal\dist\index.html`
- Sync Script: `B:\projects\ACC\acc-auction-portal\sync-dist.js`
- Test Suites:
  - `B:\projects\ACC\tests/`
