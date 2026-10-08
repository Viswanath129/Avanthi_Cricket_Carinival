# Handoff Report: Real-Time Live Synchronization Architecture & Flaw Survey

**Agent**: `explorer_survey_sync_1`  
**Working Directory**: `B:\projects\ACC\.agents\teamwork\explorer_survey_sync_1`  
**Target Files**: `B:\projects\ACC\Acc-Auction-Os.html`, `index.html`, `acc-auction-portal/dist/index.html`, `database.rules.json`, `firestore.rules`  
**Date**: 2026-10-07  

---

## 1. Observation

### File & Repository Layout
- The primary application file is `B:\projects\ACC\Acc-Auction-Os.html` (17,079 lines, 966,068 bytes).
- All three HTML distribution files are currently byte-identical (SHA256: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`):
  - `B:\projects\ACC\Acc-Auction-Os.html`
  - `B:\projects\ACC\index.html`
  - `B:\projects\ACC\acc-auction-portal\dist\index.html`
- Firebase SDKs loaded via CDN compat scripts (`Acc-Auction-Os.html:2320-2323`):
  - `firebase-app-compat.js` (v10.13.2)
  - `firebase-firestore-compat.js` (v10.13.2)
  - `firebase-database-compat.js` (v10.13.2)
  - `firebase-auth-compat.js` (v10.13.2)

---

### Code Findings for Key Questions

#### Q1: Firestore onSnapshot Listeners & BroadcastChannel Setup
1. **Firestore Listeners**: Exactly 3 `onSnapshot` listeners are configured in `window.RealtimeManager` (`Acc-Auction-Os.html:15896-16137`):
   - **Current User Document**: `Acc-Auction-Os.html:15925`
     ```javascript
     this.unsubUserDoc = fbDb.collection("users").doc(currentUser.uid).onSnapshot((docSnap) => { ... });
     ```
     Listens to account locks (`LOCKED`, `DISABLED`, `BLOCKED`) and role mutations.
   - **Players Directory Collection**: `Acc-Auction-Os.html:15963`
     ```javascript
     this.unsubPlayers = fbDb.collection("players").onSnapshot((snapshot) => { ... });
     ```
     Listens to docChanges (`added`, `modified`, `removed`), merges into client `players` array, calls `saveDatabase()`, `renderCurrentView()`.
   - **Auction State Document**: `Acc-Auction-Os.html:16128`
     ```javascript
     auctionDocRef = fbDb.collection("acc_auctions").doc("acc_main_2026");
     this.unsubAuction = auctionDocRef.onSnapshot((docSnap) => {
       if (docSnap.exists) {
         applyAuthoritativeAuctionState(docSnap.data(), false);
       }
     });
     ```
     Listens to single master auction document.
   - **CRITICAL GAP**: There is **NO `onSnapshot` listener on `collection("franchises")`**. Changes to franchises made outside `broadcastAuthoritativeState` (such as admin approvals, member additions, or registrations) do not trigger reactive updates on any client.

2. **Realtime Database Listeners (`.on("value")`)**:
   - `fbRtdb.ref(".info/connected").on("value", (snap) => { ... })` (`Acc-Auction-Os.html:16075`)
   - `fbRtdb.ref(".info/serverTimeOffset").on("value", (snap) => { ... })` (`Acc-Auction-Os.html:16093`)
   - `fbRtdb.ref("presence").on("value", (snapshot) => { ... })` (`Acc-Auction-Os.html:16206`, Admin only)
   - `fbRtdb.ref("publicStats/liveUsers").on("value", (snap) => { ... })` (`Acc-Auction-Os.html:16265`, Non-admin)
   - **CRITICAL GAP**: Realtime Database is **completely bypassed for live auction state**, despite `database.rules.json:22-25` explicitly provisioning `"auctionState": { ".read": true, ".write": true }`.

3. **BroadcastChannel Setup**:
   - Initialized in `RealtimeManager.subscribeMultiTab()` (`Acc-Auction-Os.html:16023-16065`):
     - `broadcastChannel = new BroadcastChannel("acc_auction_sync_channel");`
     - `meshChannel = new BroadcastChannel("acc_auction_mesh_2026");`
   - Handles:
     - `AUCTION_STATE_UPDATE` / `STATE_UPDATE` (`Acc-Auction-Os.html:16031-16032`): calls `applyAuthoritativeAuctionState(event.data.payload || event.data.state, false)`.
     - `PLAYER_STATE_MUTATION` (`Acc-Auction-Os.html:16033-16058`): mutates local `players` array, calls `saveDatabase()`, `renderCurrentView()`.
   - **CRITICAL GAP**: `syncFranchiseToFirebase` (`Acc-Auction-Os.html:2889-2898`) posts `{ type: "FRANCHISE_STATE_MUTATION" }`, but `subscribeMultiTab()` has **zero code handling `FRANCHISE_STATE_MUTATION`**. The event is silently ignored across browser tabs.

---

#### Q2: Auction Timer Mechanics, Server-Time-Offset, and Cross-Device Synchronization
1. **Clock Synchronization Engine (`ClockSync`)**: `Acc-Auction-Os.html:3047-3106`
   - Collects samples of `{ offset, rtt, t }`. Discards high-latency jitter samples where `rtt > 500ms` (`Acc-Auction-Os.html:3055-3058`).
   - Computes the median offset of the last 8 samples (`Acc-Auction-Os.html:3066-3069`).
   - If already synced and jitter <= 500ms, applies Exponential Moving Average:
     `this.currentOffset = Math.round(0.7 * this.currentOffset + 0.3 * median);` (`Acc-Auction-Os.html:3080`).
   - `getServerNow()` returns `Date.now() + this.getOffset()` (`Acc-Auction-Os.html:3103`).
   - Fed continuously by RTDB `.info/serverTimeOffset` (`Acc-Auction-Os.html:16093-16099`).

2. **AuctionTimerEngine Execution**: `Acc-Auction-Os.html:6182-6445`
   - **Deadline Computation**: The timer **does NOT decrement a local counter** (`timerSeconds--`).
     Instead, it calculates remaining time from absolute millisecond timestamps:
     `remainingMs = Math.max(0, timerDeadline - sNow)` (`Acc-Auction-Os.html:6201`).
     `remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))` (`Acc-Auction-Os.html:6206`).
   - **Loop Mechanism**: Dual-engine loop (`Acc-Auction-Os.html:6307-6322`):
     - `requestAnimationFrame(loop)` for active, visible tabs.
     - `setInterval(..., 250)` as a fallback for backgrounded or throttled tabs.
   - **Pause/Resume**:
     - Pausing captures exact remaining milliseconds: `pausedRemainingMs = timerDeadline ? Math.max(0, timerDeadline - sNow) : (timerSeconds * 1000)` (`Acc-Auction-Os.html:6242`).
     - Resuming computes a new deadline: `timerDeadline = sNow + dur` (`Acc-Auction-Os.html:6254`).
   - **First Bid Activation Rule**: When a lot is opened, `timerMode = 'FIRST_BID'`, `timerDuration = 30000`, `timerDeadline = null`, `timerRunning = false` (`Acc-Auction-Os.html:6531-6536`). The countdown starts only upon the first valid bid via `AuctionTimerEngine.onBid()` (`Acc-Auction-Os.html:6280-6295`), resetting to 20s.

3. **Timer Synchronization Gaps**:
   - **Admin Console SVG Ring Bug**: In `AuctionTimerEngine.updateDOM()` (`Acc-Auction-Os.html:6399`):
     ```javascript
     document.querySelectorAll("svg circle[stroke-dasharray='157']").forEach(circle => { ... });
     ```
     The Admin Console countdown circle (`Acc-Auction-Os.html:13765`) has:
     ```html
     <circle cx="60" cy="60" r="52" stroke="..." stroke-width="8" fill="none" stroke-dasharray="327" ... />
     ```
     Because the selector explicitly queries `stroke-dasharray='157'`, the circular countdown ring in the Admin Console **never updates or animates during timer ticks**.
   - **Stale timerVersion Invalidation on Lot Draw**:
     `selectPlayerForAuction` (`Acc-Auction-Os.html:6516-6545`) **does not increment `timerVersion`**. If an incoming Firestore packet has an older `timerVersion`, `applyAuthoritativeAuctionState` drops the entire update (`Acc-Auction-Os.html:16404-16406`):
     ```javascript
     if (data.timerVersion < timerVersion) {
       console.warn("[AuctionTimer] Dropped stale update. Current:", timerVersion, "Received:", data.timerVersion);
       return;
     }
     ```
     If an admin resets state or opens lots without incrementing `timerVersion`, connected clients can reject authoritative updates.

---

#### Q3: Bid Placement Lifecycle Trace
1. **UI Click**:
   - User taps `BID <nextBid>C` on Franchise Terminal (`Acc-Auction-Os.html:9779`): `onclick="placeBid(${myFranchise.id})"`.
2. **Local Execution (`placeBid`)**: `Acc-Auction-Os.html:6094-6161`
   - Validates identity: `getCurrentUserContext()` checks franchise workspace isolation.
   - Validates eligibility: `checkSlotProtection(franchiseId, cur.bucket)` (`Acc-Auction-Os.html:6115`).
   - Computes increment: `getBidIncrement(currentBid)` (`Acc-Auction-Os.html:6121`).
   - Verifies purse limit: `calculateMaxBid(franchiseId, cur.bucket)` (`Acc-Auction-Os.html:6123`).
   - Updates local state: `currentBid = nextBid`, `leadingBidderId = franchiseId`.
   - Starts local timer: `AuctionTimerEngine.onBid(franchiseId)` sets `timerDeadline = sNow + 20000`, `timerVersion++`.
   - Writes to `auditLog.unshift(...)` (`Acc-Auction-Os.html:6148`).
   - Saves local DB: `saveDatabase()` (`Acc-Auction-Os.html:6158`).
   - Dispatches broadcast: `broadcastAuthoritativeState()` (`Acc-Auction-Os.html:6159`).
   - Re-renders local UI: `renderCurrentView()` (`Acc-Auction-Os.html:6160`).
3. **Outbound Write (`broadcastAuthoritativeState`)**: `Acc-Auction-Os.html:16341-16397`
   - Posts to local BroadcastChannels: `broadcastChannel.postMessage(...)` and `meshChannel.postMessage(...)`.
   - Performs Firestore set:
     `auctionDocRef.set(payload, { merge: true }).catch(...)` (`Acc-Auction-Os.html:16395`) targeting `acc_auctions/acc_main_2026`.
4. **Inbound Processing on Other Devices**:
   - Firestore listener triggers: `this.unsubAuction = auctionDocRef.onSnapshot(...)` (`Acc-Auction-Os.html:16128`).
   - Calls `applyAuthoritativeAuctionState(docSnap.data(), false)` (`Acc-Auction-Os.html:16399`).
   - Re-synchronizes `timerDeadline`, `currentBid`, `leadingBidderId`.
   - Starts `AuctionTimerEngine.start(timerDeadline, timerDuration, timerVersion)` (`Acc-Auction-Os.html:16466`).
   - Updates `RealtimeStore.state.auction` (`Acc-Auction-Os.html:16548-16563`).
   - Triggers `renderConnectionBadge("LIVE")` (`Acc-Auction-Os.html:16569`).
   - Triggers `renderHeaderNav()` (`Acc-Auction-Os.html:16575`).
   - Triggers `renderCurrentView()` (`Acc-Auction-Os.html:16576`), which overwrites `appMain.innerHTML`.

---

#### Q4: Lot Drawing, Changing, and Hammering Lifecycle Trace
1. **Drawing a Lot**:
   - Entry points: `autoSelectNextPlayer(bucket)` (`Acc-Auction-Os.html:6641`), `revealAndStartAuctionLot(playerId)` (`Acc-Auction-Os.html:6548`), or manual number click (`Acc-Auction-Os.html:13627`).
   - Invokes `selectPlayerForAuction(playerId)` (`Acc-Auction-Os.html:6516`):
     - Sets `lotIndex = pIndex`, `currentBid = p.basePrice || 60`, `leadingBidderId = null`, `passedFranchiseIds = []`.
     - Sets `timerMode = 'FIRST_BID'`, `timerSeconds = 30`, `timerDeadline = null`, `timerRunning = false`.
     - Stops timer engine: `AuctionTimerEngine.stopLoop(); AuctionTimerEngine.renderTick();`.
     - Calls `saveDatabase()`, `broadcastAuthoritativeState()`, `renderCurrentView()`.
2. **Changing / Skipping a Lot**:
   - `skipPlayer()` (`Acc-Auction-Os.html:6682`) advances to next player in bucket without modifying player status.
   - `executeHammerUnsold()` (`Acc-Auction-Os.html:6949`): marks `cur.status = "UNSOLD"`, logs audit event, saves DB, calls `broadcastAuthoritativeState()`, and auto-draws next player after 800ms.
3. **Hammering a Lot (Sale Confirmation)**:
   - Triggered manually via `openHammerConfirmModal()` (`Acc-Auction-Os.html:6857`) or on timer expiry when a leader exists (`Acc-Auction-Os.html:6348-6350`).
   - Admin confirms in modal: `executeHammerSale()` (`Acc-Auction-Os.html:6882-6947`):
     - Sets `cur.status = "SOLD"`, `cur.soldTo = leader.name`, `cur.price = currentBid`.
     - Mutates franchise: `leader.purse -= currentBid`, `leader.squad.push({ ...cur })`.
     - Displays modal strike animation (`modalContainer`, `Acc-Auction-Os.html:6901-6923`).
     - Logs `PLAYER SOLD` audit event.
     - Calls `saveDatabase()`, `broadcastAuthoritativeState()`.
     - Automatically calls `drawNextPlayer()` after 2100ms timeout (`Acc-Auction-Os.html:6943-6946`).

---

#### Q5: Squad and Purse Propagation to Franchise Terminals
1. **Mutation Origin**:
   - During `executeHammerSale()` (`Acc-Auction-Os.html:6893-6894`), `leader.purse` is deducted and `leader.squad` gains the new player.
2. **Payload Serialized**:
   - `broadcastAuthoritativeState()` (`Acc-Auction-Os.html:16367`) writes the entire `franchises` array to `acc_auctions/acc_main_2026`.
3. **Receiving on Franchise Terminal**:
   - `auctionDocRef.onSnapshot` fires on the franchise device.
   - In `applyAuthoritativeAuctionState()` (`Acc-Auction-Os.html:16495-16512`):
     ```javascript
     data.franchises.forEach(f => {
       const key = String(f.id || f.franchiseId || '').toUpperCase();
       if (key && !dfSet.has(key) && f.status !== 'DELETED' && f.status !== 'ARCHIVED') {
         const existing = fMap.get(key);
         fMap.set(key, existing ? { ...existing, ...f } : f);
       }
     });
     franchises = Array.from(fMap.values());
     ```
   - Sets `RealtimeStore.state.franchise = franchises;` (`Acc-Auction-Os.html:16566`).
   - Calls `renderCurrentView()`, executing `renderFranchiseTerminalView()` (`Acc-Auction-Os.html:9627`).
   - Updates remaining purse: `myFranchise.purse` (`Acc-Auction-Os.html:9726`).
   - Updates squad count: `myFranchise.squad.length / 18` (`Acc-Auction-Os.html:9730`).
   - Re-evaluates max legal bid: `calculateMaxBid(myFranchise.id, cur.bucket)` (`Acc-Auction-Os.html:9671`).
   - Renders acquired squad list from `myFranchise.squad` (`Acc-Auction-Os.html:9801-9825`).

---

#### Q6: Reactive UI Pipeline Assessment & DOM Re-Render Gaps
The current reactive pipeline has **7 major architectural defects**:
1. **Massive Over-Sized Document Payload**:
   In `broadcastAuthoritativeState()` (`Acc-Auction-Os.html:16353-16375`), every single state change serializes:
   - Full `players` array (all 200+ player objects, avatars, bios).
   - Full `franchises` array (all 11 teams, members, rosters).
   - Full `auditLog` array.
   - `deletedPlayers` and `deletedFranchises`.
   Firestore documents have a **hard limit of 1,048,576 bytes (1 MB)**. If photo data URLs or audit history cause this document to exceed 1MB, Firestore writes fail with `InvalidArgumentError`. No snapshot is emitted; all client views freeze and remain permanently stale.
2. **Violent `innerHTML` Replacement on Every Snapshot**:
   When an incoming snapshot arrives, `renderCurrentView()` (`Acc-Auction-Os.html:16645-16661`) executes:
   ```javascript
   main.innerHTML = renderLiveAuctionView(); // or renderAdminConsoleView(), etc.
   ```
   - This destroys and re-parses the entire DOM tree inside `appMain`.
   - **Input Focus Loss**: Any input field being typed in (e.g. search filter in Admin Console `Acc-Auction-Os.html:14407`) loses focus, virtual keyboard closes on mobile, and caret position is lost.
   - **Scroll Position Reset**: List scroll positions (player tables, franchise rosters) reset to top.
   - **Mobile UI Jank**: Re-parsing 30KB of HTML strings on every counter-bid introduces visual stutter and battery drain.
3. **Admin Console Countdown Ring Disconnect**:
   As identified in Q2, `AuctionTimerEngine.updateDOM()` queries `svg circle[stroke-dasharray='157']` (`Acc-Auction-Os.html:6399`), while the Admin Console circle has `stroke-dasharray="327"` (`Acc-Auction-Os.html:13765`). The admin's SVG ring never updates during ticks.
4. **Silent Crash in Franchise Public Registration**:
   At `Acc-Auction-Os.html:9994`:
   ```javascript
   if (window.RealtimeManager) window.RealtimeManager.publishAuctionState();
   ```
   `window.RealtimeManager` does **not** have a `publishAuctionState` method! When a public user submits franchise registration, this call throws a runtime `TypeError: window.RealtimeManager.publishAuctionState is not a function`.
5. **Reconnection Handler Typo (Dead Re-subscription)**:
   At `Acc-Auction-Os.html:6467-6469`:
   ```javascript
   window.addEventListener("online", () => {
     AuctionTimerEngine.renderTick();
     if (window.RealtimeStore && typeof window.RealtimeStore.subscribeAuctionState === 'function') {
       window.RealtimeStore.subscribeAuctionState();
     }
   });
   ```
   `subscribeAuctionState` lives on `window.RealtimeManager`, **not** on `window.RealtimeStore`! When network drops and recovers, the client fails to re-subscribe to auction state.
6. **Franchise Directory Changes Unsubscribed**:
   `fbDb.collection("franchises")` has no snapshot listener. If an admin edits a franchise's name, logo, or status in the background, other terminals never hear about it until an auction state is broadcast.
7. **BroadcastChannel Ignores Franchise Mutations**:
   `subscribeMultiTab()` (`Acc-Auction-Os.html:16029-16059`) handles only `AUCTION_STATE_UPDATE` and `PLAYER_STATE_MUTATION`, discarding `FRANCHISE_STATE_MUTATION`.

---

#### Q7: Connection Status Handling
1. **Current Mechanism**:
   - `isDatabaseWorking()` (`Acc-Auction-Os.html:15833-15837`) checks `navigator.onLine && RealtimeStore.state.connection.status === "CONNECTED"`.
   - `renderConnectionBadge(overrideText)` (`Acc-Auction-Os.html:15839-15893`) queries:
     - `#liveHeaderBadge` (Master header)
     - `#liveAuctionFloorBadge` (Live Auction view)
     - `#liveAuctionEngineBadge` (Live Auction view)
     - `#liveProjectorBadge` (Projector view)
   - Listens to RTDB `.info/connected` (`Acc-Auction-Os.html:16075-16087`):
     - `true` -> sets `CONNECTED`, calls `renderConnectionBadge("LIVE")`.
     - `false` -> sets `OFFLINE`, calls `renderConnectionBadge("OFFLINE")`.
2. **Deficiencies & Gaps**:
   - **Misleading Offline Text**: When offline, line 15863 sets:
     ```javascript
     badge.innerHTML = `<span class="live-dot" style="...background:var(--color-red)..."></span>LIVE`;
     ```
     The text still reads **"LIVE"**, but with a red dot! Users see a red badge that says "LIVE" instead of "OFFLINE".
   - **Missing Element IDs on Franchise & Admin Views**:
     - Franchise Terminal (`Acc-Auction-Os.html:9696`) renders a hardcoded `<span class="status-badge status-connected">CONNECTED</span>` with no ID.
     - Franchise Terminal (`Acc-Auction-Os.html:9796`) renders a hardcoded `<span class="status-indicator status-live"></span>Live Synchronized` with no ID.
     - Admin Console (`Acc-Auction-Os.html:13540-13547`) renders hardcoded badges with no IDs.
     `renderConnectionBadge()` **never updates connection status on Franchise Terminal or Admin Console views**.
   - **No Visual "RECONNECTING" State**: If network flaps, there is no intermediate badge or spinner indicating reconnection attempts.

---

## 2. Logic Chain

1. **Observation**: Firestore write payload in `broadcastAuthoritativeState` contains the entire `players` array with images, all 11 `franchises`, and the full `auditLog`.
   **Inference**: As player photos and audit logs accumulate, the document approaches Firestore's 1MB cap. If it exceeds 1MB, writes fail silently, starving all connected clients of state snapshots.
2. **Observation**: `database.rules.json` configures read/write on `/auctionState`, and `fbRtdb` is initialized, but `RealtimeManager` only reads/writes presence and offset on RTDB.
   **Inference**: Live bidding relies solely on Firestore document writes, which suffer 300ms–1500ms latency and 1 write/sec contention limits, rather than RTDB's sub-50ms WebSocket push.
3. **Observation**: On every incoming snapshot, `applyAuthoritativeAuctionState` calls `renderCurrentView()`, replacing `appMain.innerHTML`.
   **Inference**: Full-page string re-renders destroy active form focus, wipe text input carets, cause mobile layout thrashing, and reset list scroll positions.
4. **Observation**: `AuctionTimerEngine.updateDOM()` uses `stroke-dasharray='157'`, whereas the Admin Console countdown circle uses `stroke-dasharray="327"`.
   **Inference**: The admin's SVG countdown ring is completely decoupled from the timer tick loop and stays frozen during the auction countdown.
5. **Observation**: `selectPlayerForAuction()` does not increment `timerVersion`.
   **Inference**: If an admin calls a new lot, the payload carries the old `timerVersion`. Clients enforcing `data.timerVersion < timerVersion` may discard legitimate lot transitions.
6. **Observation**: `window.addEventListener("online")` calls `window.RealtimeStore.subscribeAuctionState()`, but that function is defined on `window.RealtimeManager`.
   **Inference**: On reconnect after tab sleep or wifi interruption, the application never re-attaches its Firestore auction listener.
7. **Observation**: The Franchise Terminal connection indicators have no HTML element IDs.
   **Inference**: When internet connectivity drops on a franchise phone, the terminal continues displaying green "CONNECTED" and "Live Synchronized".

---

## 3. Caveats
- No source files were modified during this investigation (strict read-only audit).
- Firestore document size at initial seed data is currently ~120KB (under 1MB), so the document-size failure mode manifests primarily as players upload full photos or after prolonged bidding sessions with bloated `auditLog` arrays.
- The three HTML files currently have 100% SHA256 parity. Any subsequent remediation must preserve identical byte parity across `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html`.

---

## 4. Conclusion
The ACC 2026 platform has a functional algorithmic core for timer calculation (`ClockSync` with median offset filter) and auction state machines, but its **cross-device live synchronization pipeline suffers from five major architectural bottlenecks**:
1. **Transport Inefficiency**: Live bids travel over Firestore document writes with multi-megabyte payloads instead of lean, low-latency WebSocket packets via Realtime Database (`fbRtdb.ref("auctionState")`).
2. **DOM Thrashing**: Incoming snapshots destroy and recreate the entire view DOM (`main.innerHTML`), breaking input focus and causing mobile jank.
3. **Broken Re-subscription**: Online event listener targets the wrong global object (`RealtimeStore` instead of `RealtimeManager`), preventing automatic recovery after network sleep.
4. **Timer UI Decoupling**: Admin console countdown SVG ring uses `327` stroke-dasharray, but the tick updater only queries `157`, leaving the admin ring frozen.
5. **Partial Tenancy Reactivity**: No `onSnapshot` listener on `franchises`, and `FRANCHISE_STATE_MUTATION` is ignored by BroadcastChannel.

---

## 5. Verification Method

### Step 1: Run Existing Automated Test Suites
Run all existing verification suites to confirm baseline behavior:
```powershell
node tests/test_timer_and_bid_sync.js
node tests/test_auction_timer_root_cause.js
node tests/test_page_reload_view_persistence.js
node tests/test_player_visibility_and_realtime.js
pnpm --dir acc-auction-portal test
```

### Step 2: Code Inspection Verification Points
Inspect the following locations in `B:\projects\ACC\Acc-Auction-Os.html`:
- Line `6399`: Verify selector `stroke-dasharray='157'` vs Line `13765` `stroke-dasharray="327"`.
- Line `6467`: Verify broken call `window.RealtimeStore.subscribeAuctionState()`.
- Line `9994`: Verify runtime error `window.RealtimeManager.publishAuctionState()`.
- Line `16029-16059`: Verify absence of `FRANCHISE_STATE_MUTATION` handler.
- Line `16353-16375`: Verify monolithic payload serialization in `broadcastAuthoritativeState`.
- Lines `9696` & `9796`: Verify absence of element IDs on Franchise Terminal connection badges.

---

## Technical Architecture Proposal for True Zero-Reload Live Sync (Question 8)

To achieve stock-market / ride-hailing grade real-time synchronization (<100ms latency across devices, zero reload, zero input disruption), implement the following 5-layer architecture:

### 1. Dual-Channel Transport Engine (RTDB Fast Pipe + Firestore Persistence)
- **Fast Pipe (RTDB WebSocket)**:
  - Route all high-frequency live operational events through `fbRtdb.ref("auctionState/live")`.
  - Lean live payload (<1 KB):
    ```json
    {
      "lotId": 14,
      "lotIndex": 13,
      "currentBid": 120,
      "leadingBidderId": 3,
      "timerDeadline": 1730000020000,
      "timerDuration": 20000,
      "timerRunning": true,
      "auctionPaused": false,
      "pausedRemainingMs": null,
      "timerVersion": 42,
      "timestamp": 1730000000150
    }
    ```
  - Subscribed by ALL connected clients via `fbRtdb.ref("auctionState/live").on("value", ...)`. Propagation latency: **30ms–80ms**.
- **Persistence Pipe (Firestore Document)**:
  - Keep `fbDb.collection("acc_auctions").doc("acc_main_2026")` as authoritative cold-start state and audit ledger.
  - Write to Firestore on lot transitions (draw, hammer sale, unsold, pause) and debounced on bids.

### 2. Granular Reactive DOM Patching (Zero `innerHTML` Thrashing)
- Replace full-page re-renders with targeted DOM mutators:
  - Create `updateLiveAuctionDOM(state)`:
    - Update `#liveCurrentBidText` with counter animation.
    - Update `#liveLeadingBidderName` and emblem.
    - Update `#liveNextLegalBid` and `#liveBidIncrement`.
    - Update franchise status cards by querying `#franchise_status_${id}`.
  - Timer Ticker:
    - Update `.timer-countdown-number` across all views.
    - Update `.admin-timer-text`.
    - Update SVG circles with query selector: `document.querySelectorAll("svg circle[data-timer-ring], svg circle[stroke-dasharray='157'], svg circle[stroke-dasharray='327']")`.
- Preserve form inputs, focus, and scroll position during live floor events.

### 3. Server-Time Offset NTP Median Synchronization
- Continue using `ClockSync` with median-of-8 samples from `fbRtdb.ref(".info/serverTimeOffset")`.
- Implement HTTP timestamp fallback via `fetch("/__ping", { method: "HEAD" })` if RTDB is blocked by restrictive firewalls.
- Absolute deadline formula enforced on all writes: `deadline = serverNow + duration`.

### 4. Reactive Franchise & Roster Subscriptions
- Add `RealtimeManager.subscribeFranchisesDirectory()`:
  - Subscribes to `fbDb.collection("franchises").onSnapshot(...)`.
  - Reactively updates franchise names, logos, purses, and squad rosters.
- Handle `FRANCHISE_STATE_MUTATION` in `subscribeMultiTab()`.

### 5. Resilient Connection Lifecycle & Dynamic Badges
- Fix `window.addEventListener("online")` to call `window.RealtimeManager.subscribeAuctionState()`.
- Add distinct tri-state visual indicators (`LIVE` green pulse, `RECONNECTING` amber spinner, `OFFLINE` red solid) on:
  - Header: `#liveHeaderBadge`
  - Admin Console: `#adminLiveConnectionBadge`
  - Franchise Terminal: `#franchiseConnectionBadge`
  - Projector: `#liveProjectorBadge`
  - Public Live: `#liveAuctionFloorBadge`
- When offline, display explicit text: `"OFFLINE"` or `"RECONNECTING"` (never the word "LIVE" in red).
