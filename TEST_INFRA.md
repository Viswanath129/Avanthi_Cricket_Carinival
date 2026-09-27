# E2E Test Infrastructure Specification: ACC Auction Operating System

## 1. Executive Summary & Strategy

The Avanthi Cricket Carnival (ACC) Auction Operating System is delivered as a standalone, zero-dependency, single-file application (`b:/projects/ACC/Acc-Auction-Os.html`) paired with the supporting tournament portal (`acc-auction-portal`).

To guarantee absolute compliance with the tournament rules and visual standards, the testing architecture employs an **opaque-box, multi-tier automated test harness**. The suite tests:
1. **Visual and Structural Integrity**: DOM elements, CSS design tokens, FeralUI grain gradients, frosted glass cards, Uiverse speeder loading overlay, 48px ergonomic touch targets, and inline SVG iconography.
2. **Deterministic Business Logic**: Authoritative max bid calculation, Rule 12.2 mandatory slot protection, stepwise incremental bidding ladder, dual-mode countdown timers, reversible pass mechanics, dynamic scarcity warnings, and academic roll number parsing.
3. **Forensic State Rollback**: Atomic multi-lot undo, purse and roster restoration, bucket quota recalculation, double-undo prevention, and audit trail stream export.
4. **Resilient Synchronization**: Real-time state broadcasting across browser tabs (`BroadcastChannel`) and cloud rooms (`Firebase Firestore`).

---

## 2. Test Architecture & Tier Breakdown

The test suite is structured into four sequential verification tiers:

```
+-----------------------------------------------------------------------+
|  Tier 4: Real-World Scenarios (5 Complex Multi-Lot Workflows)         |
+-----------------------------------------------------------------------+
|  Tier 3: Cross-Feature Interactions (Pairwise Integration Combos)     |
+-----------------------------------------------------------------------+
|  Tier 2: Boundary & Corner Cases (Appendix A 1-31, Limits, Illegals)  |
+-----------------------------------------------------------------------+
|  Tier 1: Feature Coverage (>=5 Tests per Feature across 31 Features)  |
+-----------------------------------------------------------------------+
```

### Tier 1: Feature Coverage
- **Scope**: Every single feature from the `PROJECT.md` Feature Inventory (Features 1–31) is validated with $\ge 5$ explicit behavioral tests.
- **Coverage**:
  - UI/UX Design System (FeralUI gradient, frosted glass, typography, speeder overlay, touch targets, SVG icons).
  - 6 Core Views (Public, Live Auction, Franchise Terminal, Player Registration, Admin Console, Projector Display).
  - Modal Dialogs (Hammer Confirmation, Registration Review, Dynamic Forensic Undo).
  - Academic Parsing Engine (B.Tech Regular, B.Tech Lateral, Diploma, PG Unbucketed, Freshers Reference Trigger).
  - Player Questionnaire & Derivation (Conditional questions, 6 player types, fielder-only confirmation).
  - Bidding & Financial Engines (Purse reserve, slot preservation, price ladder, timer cues, reversible pass, hammer sale, scarcity tracking, undo, exports).

### Tier 2: Boundary, Negative & Corner Cases
- **Scope**: Extreme values, zero/negative inputs, empty fields, boundary transitions, and illegal operations.
- **Appendix A Acceptance Cases (1–31)**:
  - Cases 1–6: Authoritative Max Bid Cap (`calculateMaxBid` / `maximumPermissibleBid`).
  - Cases 7–10: Mandatory Slot Protection (`isBucketEligible`).
  - Cases 11–15: Dynamic Scarcity Tracking & Thresholds (`scarcityWarning`).
  - Cases 16–18: Forensic Undo State Transition & Double-Undo Prevention (`executeUndo` / `canUndoSale`).
  - Cases 19–24: Roll Parsing & Reference Triggers (`parseRoll`).
  - Cases 25–31: Bidding Ladder, Timer Resets, All-Pass, and Hammer Dependency.

### Tier 3: Cross-Feature Interactions
Pairwise state machine interactions verifying that subsystems interact without state leakage:
1. **Roll Parsing $\times$ Bidding Ladder**: Registering players across different branches/buckets and immediately bidding on them across ladder thresholds (<100, 100-199, 200+).
2. **Max Bid Cap $\times$ Scarcity Warning**: A franchise with tight purse reaching legal cap while bucket supply hits the scarcity threshold; verifies warnings do not block legal bids.
3. **Forensic Undo $\times$ Quota Recalculation $\times$ Eligibility**: Undoing a critical bucket purchase reverts franchise status to "unmet", instantly updating `isBucketEligible` and recalculating `maxBid` for all remaining teams.
4. **Reversible Pass $\times$ Timer Urgency $\times$ Re-entry**: All 11 franchises passing causes timer to continue down to danger cues (<5s); a franchise re-entering at 2s resets timer back to 20s and clears pass status.
5. **Hammer Sale $\times$ Audit Stream Export $\times$ CSV Squad Generation**: Executing a hammer sale updates ledger, emits audit log, and immediately reflects in exported CSV metrics.

### Tier 4: Real-World Scenarios
Complete, end-to-end multi-step tournament scenarios:
1. **Full 11-Franchise Draft Simulation**: 165+ lot auction sequence where all 11 franchises acquire 15 players each fulfilling 2 players across B1–B5, respecting all purse limits.
2. **Multi-Round Auction & Unsold Pool Recall**: Round 1 completion with skipped/unsold players carried over into Round 2 with base prices reset to 20 credits.
3. **Endgame Tiebreak Auto-Allotment Cascade**: Automatic allotment of remaining bucket players to franchises with most unfilled slots, breaking ties by smallest remaining purse.
4. **Emergency Multi-Lot Undo Cascade**: Forensic rollback of multiple historical sales (including sales from 5 lots earlier) with full balance, squad count, and unsold pool restoration.
5. **Multi-Tab / Multi-Client State Synchronization**: Simulated BroadcastChannel / cloud message delivery verifying state convergence across Admin, Projector, and Franchise terminals.

---

## 3. Authoritative Source of Truth & Derivation

All expected test outputs are derived strictly from:
1. **`ACC Auction Website Problem Statement .pdf`**:
   - Academic Roll Formula: B.Tech Regular $(26-YY)+1$, Lateral $(26-YY)+2$, Diploma all B5.
   - Max Bid Formula: $\text{Reserve} = \max(\text{mandatoryAfterLot}, \text{regularSlotsAfterLot}) \times 20$; $\text{maxBid} = \max(0, \text{Purse} - \text{Reserve})$.
   - Rule 12.2: $\text{mandatoryAfterLot} \le \text{slotsAfterLot}$.
   - Appendix A: Test cases 1 through 31.
2. **`PROJECT.md` & `ORIGINAL_REQUEST.md`**:
   - Color codes: `#F6F9FF`, `#9BE0E8`, `#C4B5F7`, `#F8B8D9`.
   - Typography: `Plus Jakarta Sans`, `Inter`, `Space Grotesk`, `JetBrains Mono`.
   - Ergonomics: Minimum 48px touch targets, WCAG AA 4.5:1 contrast.

---

## 4. Test Harness Implementation & Execution

Two test runners are provided to ensure complete operational flexibility:

### 1. Standalone Zero-Dependency Runner (`tests/e2e_auction_test.js`)
- Runs directly with Node.js standard libraries (`node tests/e2e_auction_test.js`).
- Inspects `Acc-Auction-Os.html` verbatim, extracts styles, DOM structure, and evaluates JavaScript state machine functions.
- Generates structured console output and exits with code 0 on 100% pass, non-zero on failure.

### 2. Vitest Test Suite (`acc-auction-portal/server/e2e_auction.test.ts`)
- Integrated into the existing package test pipeline.
- Executed via `vitest run server/e2e_auction.test.ts` or `pnpm test`.

### Execution Commands

```bash
# Standalone Execution (from workspace root)
node tests/e2e_auction_test.js

# Vitest Execution (from acc-auction-portal directory)
cd acc-auction-portal
npx vitest run server/e2e_auction.test.ts
```

---

## 5. Certification & Quality Gate

- **Passing Criteria**: 100% test cases across Tiers 1, 2, 3, and 4 must pass. Zero skips or silent passes.
- **Publication**: Upon successful verification, `b:/projects/ACC/TEST_READY.md` is generated and published at project root, certifying readiness for implementation verification and adversarial hardening.
