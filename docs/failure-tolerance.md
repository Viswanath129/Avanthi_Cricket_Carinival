# ACC 2026 — Disaster Recovery & Failure Tolerance Specification

This operational policy outlines failure modes, automatic mitigations, and manual operator playbooks for high-pressure live auction hall scenarios.

---

## 1. Scenario A: Admin Laptop Closes / Crashes Mid-Lot

### Behavior
- The auction engine runs server-authoritatively in Firebase Cloud Functions and Firestore.
- Closing the Admin laptop does NOT pause the server clock or erase lot state.
- Bids from franchise devices continue processing until the server `timerDeadline` expires or the lot is paused/hammered.
- Hall Projector and Public Spectator screens continue rendering live bidding seamlessly.

### Recovery Steps
1. Re-open the Admin laptop or open the Admin dashboard URL (`/admin`) on any backup tablet/laptop.
2. Sign in with Super Admin or Floor Operator credentials.
3. The Admin dashboard automatically reads the authoritative `auction/state` and `lots/{lotId}` snapshots within <1 second.
4. If timer reached 0 without a hammer commit, no sale occurred (`test_dash_5`); Admin may either confirm Hammer (if bids exist), tap Skip to recall, or re-open the lot.

---

## 2. Scenario B: Franchise Device Loses Cellular / Wi-Fi Network

### Behavior
- The franchise terminal immediately detects disconnect via RTDB `.info/connected` and browser network lifecycle listeners.
- The bidding button disables with a yellow banner: `⚠️ CONNECTION LOST — AUCTION STATE MAY BE STALE`.
- In-flight bids not acknowledged by the server are discarded without risk of corrupted state.

### Recovery Steps
1. Device automatically attempts exponential reconnect.
2. Upon network return, the screen renders `🟢 CONNECTED — SYNCING STATE` and updates to the latest server bid within 300ms.
3. **Emergency Operator Fallback (Floor Proxy)**:
   - If a franchise coordinator's phone experiences total hardware battery death or carrier outage:
   - The coordinator signals the Floor Operator on the hall floor.
   - The Floor Operator uses `[B] BID ON BEHALF` in the Admin Console.
   - The operator selects the franchise, inputs the legal increment, and submits.
   - The audit log immutably records the bid with `operatorProxy: true` and the operator's authenticated UID.

---

## 3. Scenario C: Hall Wi-Fi Router Drops Entirely

### Behavior
- Devices on hall Wi-Fi drop presence; local displays pause countdown progression at last acknowledged server timestamp.
- Cloud databases preserve complete financial purses, lot rosters, and immutable audit trails without data loss.

### Recovery Steps
1. Floor Operator immediately switches Admin laptop to 5G / 4G cellular hotspot.
2. Floor Operator taps `[P] PAUSE AUCTION`.
3. Pausing sets `auctionState.status = 'PAUSED'` and freezes remaining timer milliseconds server-side.
4. Hall announcer notifies franchises to enable cellular data or connect to backup router.
5. Once franchise presence indicators show active status on Admin Console, operator clicks `RESUME AUCTION`.
6. Timers resume counting down from the frozen remaining duration.

---

## 4. Scenario D: Firestore Outage or Transient Unreachability

### Behavior
- Local IndexedDB / Firestore offline persistence maintains cached state.
- Write attempts that fail transient network connectivity reject gracefully with actionable error toasts rather than crashing the interface.

### Recovery Steps
1. All critical state is backed up locally every 10 lots via automated JSON snapshot generator.
2. If cloud connection drops, Super Admin can trigger `[EXPORT DB]` to download an instant local JSON + CSV snapshot of current rosters, purses, and audit logs.
3. System can be run in Standalone Local Hall Mode (`Acc-Auction-Os.html`) using browser LocalStorage and WebSockets if wide-area cloud access is severed.

---

## 5. Scenario E: Erroneous Hammer / Accidental Misallocation

### Behavior & Mitigation
- ACC 2026 includes an immutable compensating transaction engine (`undoSale`).
- Even if a lot was sold 40 lots ago:
  1. Super Admin opens `[U] UNDO SALE`.
  2. Selects the lot from the complete dropdown of completed lots.
  3. Provides mandatory audit reason.
  4. Server atomically refunds the exact credits to the winning franchise's purse, returns the player to the auction pool, adjusts squad count, recalculates bucket minimums, and writes a compensating audit record.
  5. The same sale cannot be undone twice (double-undo rejected).
