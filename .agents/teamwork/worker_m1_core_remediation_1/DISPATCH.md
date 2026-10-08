## 2026-10-07T17:23:26Z
You are the Implementation Worker (worker_m1_core_remediation_1) for Milestone 1 of the ACC 2026 Cricket Auction Platform.
Your working directory is: B:\projects\ACC\.agents\teamwork\worker_m1_core_remediation_1

MANDATORY FIRST STEP:
Read the authoritative user request at:
B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md

READ CONTEXT AND SPECIFICATIONS:
- Project Plan: B:\projects\ACC\PROJECT.md
- Sync Architecture Report: B:\projects\ACC\.agents\teamwork\explorer_survey_sync_1\handoff.md
- Feature Defect Report: B:\projects\ACC\.agents\teamwork\explorer_survey_features_1\handoff.md
- Deployment & Test Infra Report: B:\projects\ACC\.agents\teamwork\explorer_survey_deploy_infra_1\handoff.md

WRITE OWNERSHIP:
You have exclusive write ownership of B:\projects\ACC\Acc-Auction-Os.html.
DO NOT modify files outside your boundary without orchestrator instruction.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A forensic auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OBJECTIVES FOR MILESTONE 1 (Core Platform Remediation & Real-Time Live Sync):

1. REAL-TIME LIVE SYNCHRONIZATION ENGINE (Features 1–7):
   - Fast Pipe: Implement/wire Firebase Realtime Database WebSocket channel (`fbRtdb.ref("auctionState/live")`) for ultra-low latency (<100ms) live updates: lotId, lotIndex, currentBid, leadingBidderId, timerDeadline, timerDuration, timerRunning, auctionPaused, timerVersion, timestamp. Both broadcast and listen on this path. Fallback to Firestore merge for persistence.
   - Granular Reactive DOM Patching: Replace destructive `main.innerHTML` re-parsing on live snapshots with fine-grained element patching (`updateLiveAuctionDOM`, `updateTimerDOM`). Update `#liveCurrentBidText`, `#liveLeadingBidderName`, `#liveNextLegalBid`, `#liveBidIncrement`, and franchise cards in-place without losing input focus, closing keyboards, or resetting scroll positions.
   - Timer Clock Sync: Enforce server-time offset (`ClockSync.getServerNow()`) across all clients so timer countdown remains within ±1s on all devices. Maintain first-bid activation (30s poised -> 20s active countdown) and 20s reset on counter-bids.
   - SVG Timer Ring Selector: In `AuctionTimerEngine.updateDOM()`, update selector to match both `stroke-dasharray="327"` (Admin Console circle) and `stroke-dasharray='157'`, animating the admin countdown ring properly.
   - Franchise Directory & Mutation Sync: Add `onSnapshot` listener on `fbDb.collection("franchises")` and handle `FRANCHISE_STATE_MUTATION` in `BroadcastChannel.subscribeMultiTab()`.
   - Tri-State Connection Badges: Render dynamic indicators (`LIVE` green, `RECONNECTING` amber, `OFFLINE` red) with explicit IDs (`#adminLiveConnectionBadge`, `#franchiseConnectionBadge`, etc.) on Admin, Franchise, Projector, and Public views. Ensure offline text displays "OFFLINE", never "LIVE" in red.
   - Network Reconnect Fix: Fix `window.addEventListener("online")` to call `window.RealtimeManager.subscribeAuctionState()`.

2. ALL-ROLE FEATURE DEFECT REMEDIATION (Features 8–20):
   - Auth Route Query Isolation: Read URL `mode` query parameter (`/login?mode=player`, `/login?mode=franchise`, `/login?mode=admin`) and render strictly the requested persona's login interface.
   - Secure Session & Logout Loop Fix: When `logoutUser()` executes, clear `acc_last_active_view` and `acc_current_user_2026`. Remove automatic Super Admin bypass when navigating to `#admin`.
   - Direct Assign & Undo Sale Integrity: In `executeDirectAssign`, populate `player.soldTo`, `player.soldPrice`, `player.salePrice`, and `player.price`. Preserve alphanumeric roll numbers without `parseInt` truncation. In `executeUndoSale`, properly locate franchise by `soldTo || franchiseName`, refund purse, remove player from squad, and reset status to 'AVAILABLE'.
   - Manual Lot Modal String ID Syntax Fix: Quote player IDs in `revealAndStartAuctionLot('${p.id}')` preventing SyntaxError on alphanumeric roll numbers.
   - Quick Lot Call Mapping: Correctly map entered Lot # to catalog lot index rather than searching by player ID.
   - Draw Mode Toggle: Fix `toggleDrawMode` so it cycles between `'AUTO'` and `'MANUAL'`, making manual lot selection accessible.
   - Photo Cropper Canvas Fill: Replace dark `#0b0f19` canvas fill with transparent/clean fill preserving PNG transparency.
   - Franchise Approval Dual Accounts: In `adminApproveFranchise`, create both `COORDINATOR` and `TEAM_LEADER` (Captain) accounts in `users`.
   - Scoped Keyboard Shortcuts & Timer Modal: Gate keyboard shortcuts (H, S, P, U, B, A, D, N, R, Space) strictly to authenticated Admins in AUCTION tab. Restrict auto-popup of `openHammerConfirmModal()` at timer zero strictly to admin view.
   - Franchise Terminal Pass Button: Wire PASS button to `passLot(myFranchise.id)`.
   - Public View Lot Index: Ensure public view renders the active auction lot rather than using an offset filtered index.
   - Franchise Status Badges: Dynamically display franchise status (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) on public cards.
   - Typo Fix: Fix `window.RealtimeManager.publishAuctionState` typo in franchise registration.

3. BUILD & TEST VERIFICATION:
   - Run acceptance tests via `node`:
     - `node tests/test_timer_and_bid_sync.js`
     - `node tests/test_auction_timer_root_cause.js`
     - `node tests/test_part_d_and_dashboard_acceptance.js`
     - `node tests/test_section52_acceptance.js`
     - `node tests/test_appendix_a_official.js`
     - `node tests/test_timer_franchiseref_photo_admin_fixes.js`
   - Ensure all existing test suites continue to pass with 0 regressions.
   - Author a comprehensive handoff report at `B:\projects\ACC\.agents\teamwork\worker_m1_core_remediation_1\handoff.md`.
   - Send completion message to parent when done.
