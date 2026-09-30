# ACC 2026 — Auction Concurrency & Race-Condition Policy

This document defines the authoritative engineering rules governing concurrent operations, simultaneous bids, synchronization guarantees, and dispute resolution for the Avanthi Cricket Carnival (ACC) 2026 Player Auction Portal.

---

## 1. Server Time Authority
- **Primary Source of Truth**: The central Firebase server time is the sole authoritative clock reference.
- **Clock Drift Compensation**: Every client surface (Super Admin Console, Hall Projector, 11 Franchise Bidding Terminals, Public Spectator Broadcast) synchronizes with Firebase Realtime Database `.info/serverTimeOffset` on mount and recomputes `offset = serverNow - clientNow`.
- **Absolute Deadlines**: All lot timers store absolute server timestamps (`timerDeadline`). Client countdowns strictly execute `ceil((timerDeadline - serverNow) / 1000)`. Local system clock drift or manual device time manipulation cannot alter timer duration.

---

## 2. Deterministic Serialization & Tie Resolution
When multiple franchises submit bids within the same millisecond or atomic window:
1. **Database Transaction Boundary**: Bids execute inside Firestore ACID transactions (`db.runTransaction`) with concurrency retry budgets.
2. **Serialization Order**: 
   - Primary: Physical transaction acquisition and server commit timestamp (`createdAt: serverTimestamp()`).
   - Tie-breaker: Monotonically increasing `sequenceNumber` inside the lot document, followed by deterministic natural ordering on `franchiseId` (1..11).
3. **Single Leader Invariant**: At any discrete moment, exactly one franchise is marked as `highestBidderFranchiseId`. Secondary concurrent bids either increment the price sequentially (if eligible and within timer) or are cleanly rejected.

---

## 3. Optimistic UI & Server Confirmation
- **Franchise Bidding Mobile Terminal**:
  - Employs an optimistic tap state with a 500ms debounce to give coordinators immediate visual and haptic feedback.
  - Automatically generates a cryptographically random `clientActionId` (idempotency key) per tap.
  - If the server rejects the bid (e.g., maximum permissible bid exceeded, mandatory slot protection violation, lot paused, or out-bid by a prior millisecond transaction), the optimistic state instantly rolls back and surfaces a descriptive notification.
- **Admin, Projector & Public Surfaces**:
  - Strictly server-confirmed. Displays update solely upon receiving confirmed Firestore snapshot events.

---

## 4. Idempotency & Duplicate Protection
- Every bid request must supply a unique `clientActionId`.
- The `placeBid` cloud function verifies whether `clientActionId` was already committed for the active lot.
- Double-taps, network packet replays, or cellular duplicate delivery result in an idempotent no-op without deducting additional purse credits or incrementing the ladder twice.

---

## 5. In-Flight Bids on Network Disconnection
- If a franchise device initiates a bid and loses connectivity before the TCP/TLS handshake confirms receipt:
  - If the server did not receive the transaction, the bid is discarded.
  - The client must never claim or assume a bid succeeded without explicit server acknowledgement.
  - Upon network restoration, the client is prompted to review the current live price and re-tap if desired.

---

## 6. Reconnect State Hydration
- When connection transitions from `OFFLINE` / `RECONNECTING` to `CONNECTED`:
  - The application invalidates local speculative buffers and pulls fresh snapshots for `auctionState`, `currentLot`, and the franchise's purse reserves.
  - A high-visibility Reconnect Banner displays current bid, active lot, and current leading franchise.
