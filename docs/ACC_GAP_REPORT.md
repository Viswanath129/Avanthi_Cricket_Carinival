# ACC 2026 — Master System Gap Analysis & Reconciliation Report
**Project:** Avanthi Cricket Carnival (ACC) 2026  
**Evaluation Baseline:** Official 16-Page Problem Statement vs. 6-Page Line-by-Line System Audit Report vs. Production Implementation

---

## 1. Executive Summary & Audit Methodology
A deep, line-by-line reconciliation was performed across all functional layers:
1. **Academic Quota Rules & Roll Parsing Engine** (§4)
2. **Player Registration & Branching Skill Questionnaire** (§5)
3. **Franchise Setup & Dual-Login Provisioning** (§6)
4. **Auction Operations & Live Draw Sequencing** (§9, §10, §11)
5. **Mathematical Invariants (Max Bid & Rule 12.2 Slot Protection)** (§12.1, §12.2)
6. **Scarcity Intelligence & Alerting Engine** (§12.3)
7. **Forensic Multi-Lot Undo** (§12.4)
8. **Endgame Mechanics, Round 2 & Auto-Allotment Cascade** (§13)
9. **Projector & Public Live Spectator Surfaces** (§14, §15)
10. **Administrative Governance, Data Management & Audit Trails** (§16, §17)

All historical discrepancies identified during past prototyping have been formally diagnosed and systematically resolved.

---

## 2. Granular Gap Analysis & Remediation Log

### Gap 1: Super Admin Persona & Name Standardization
- **Official Specification (§3):** Super Admin represents the institutional tournament director.
- **Previous Discrepancy:** Prototyping code referenced placeholder names ("Dr. K. V. Raman" or generic "Super Admin").
- **Resolution:** Strictly set default Super Admin display name to **Mr. Deepak** across all authentication profiles, seed fixtures, profile headers, and test mocks. Profile editing allows updating phone, email, designation, department, and photo while persisting immediately to state and Firestore.

### Gap 2: Academic Roll Number Classification & Lateral Entry Offset
- **Official Specification (§4.1):** Lateral entry students (`YY815Abbnn`) join directly into 2nd year. Their study year in academic year 2026 is `(2026 - YY) + 2`. (Example: `25815A0403` admitted in 2025 is in 3rd year, placed in Bucket B3, NOT B2).
- **Previous Discrepancy:** Earlier naive parsers evaluated all rolls with `studyYear = (currentYear - YY) + 1`, causing lateral entrants to be misclassified into junior buckets.
- **Resolution:** `parseRollNumber` explicitly detects `15A` lateral pattern, applies the `+2` offset, and routes to B3. Verified against Appendix A Acceptance Test 20.

### Gap 3: CricHeroes Mandatory Data vs. Frictionless Registration
- **Official Specification (§5.2):** CricHeroes profile URL and CricHeroes phone are mandatory for post-auction scoring, but registration must not be blocked for players without an active profile on Day 1.
- **Previous Discrepancy:** Prototyping forms either made CricHeroes fields strictly required (stalling registrations) or completely optional without tracking.
- **Resolution:** Introduced the "Profile Creation Pending" checkbox and guide modal. When checked, candidate registers successfully with `cricHeroesPending: true`. Super Admin verification queue requires resolving the pending profile URL and phone before approving the player as paid/auction-eligible.

### Gap 4: Maximum Permissible Bid Formula (§12.1)
- **Official Specification:** A franchise holding 1000 credits and needing 15 players must retain enough credits to buy the remaining 14 at minimum base price (20 credits each). If a franchise holds 11 players but has 5 unmet mandatory bucket quotas, it has 5 slots to fill (not 4).
- **Formula:** `slotsToFill = Math.max(15 - purchasedCount, unmetMandatoryCount)`.  
  `reserveRequired = Math.max(0, slotsToFill - 1) * 20`.  
  `maxBid = Math.max(0, purseRemaining - reserveRequired)`.
- **Resolution:** Standardized formula across `index.html`, `Acc-Auction-Os.html`, and `bidEngine.ts`. Bids exceeding `maxBid` are disabled in the UI and rejected in backend transactions. Verified across Appendix A Cases 1–6.

### Gap 5: Rule 12.2 Mandatory Slot Protection
- **Official Specification:** If a franchise has 2 slots left and needs 2 diploma players, bidding on a PG player would leave only 1 slot for 2 mandatory quotas, which is impossible.
- **Condition:** `remainingSlotsAfterThis = (15 - purchasedCount) - 1`. If `remainingSlotsAfterThis < unmetMandatorySlotsAfterThis`, the bid is illegal and MUST be blocked.
- **Resolution:** Enforced dynamically in `isBucketEligible`. If illegal, the Bid button in the franchise terminal is disabled with the warning "Mandatory Slot Protection Active".

### Gap 6: Continuous Scarcity Detection (§12.3)
- **Official Specification:** Track unsold bucket supply against total unfilled slots across all franchises. When supply drops to or below the total needed, fire warning across Admin, Projector, and Public screens. Never block bidding.
- **Resolution:** Live scanner computes `unsoldSupply[bucket]` and compares against `sum(unmetNeedsAcrossAllFranchises[bucket])`. Scarcity banner activates instantly with real-time counters and clears dynamically if an undo returns a player to the pool. Verified against Appendix A Cases 11–15.

### Gap 7: Multi-Lot Undo with State Consistency (§12.4)
- **Official Specification:** Reverse any lot from history, not just the latest. Recalculate purse, slot counts, and bucket quotas atomically. Double undo strictly barred.
- **Resolution:** `undoLotSale` performs an atomic transaction: reverses purse deduction, restores player status to `AVAILABLE`, decrements team bucket quota, and marks sale record `UNDONE`. Double-undo check prevents duplicate refunds. Verified against Appendix A Cases 16–18.

### Gap 8: Endgame Auto-Allotment Cascade (§13)
- **Official Specification:** When unbought players remain at the end of Round 2, auto-allot at 20 credits. Priority: most unfilled slots, tiebreaker smallest remaining purse. Label prominently as "Allotted", never "Sold".
- **Resolution:** Implemented `runAutoAllotment` sorting franchises by `(15 - purchasedCount) DESC`, then `purse ASC`. Allotted players carry `status = 'ALLOTTED'` and render with an amber `[ALLOTTED]` badge across squad lists, projector, and exports.

### Gap 9: Projector Display Standards (§14)
- **Official Specification:** 1440px+ auditorium presentation: large athlete photo, stats, base price, current bid, leading franchise logo, countdown timer ring, and bottom status bar of all 11 franchise logos showing IN PLAY / PASSED / BLOCKED.
- **Resolution:** Engineered responsive `renderProjectorView` with high-legibility typography, pulsing timer circle, live bidding status pills, and prominent scarcity alerts.

### Gap 10: Dedicated Admin Data Management Center
- **Official Specification & User Directives:** Dedicated Admin section for Data Management (separate from player edit/auction tabs) supporting manual delete, bulk delete, trash/restore, permanent purge, and audit logging.
- **Resolution:** Implemented Data Management center with tabbed views for Players, Franchises, Trash/Deleted, Backups, and Activity. Includes high-risk confirmation modals showing full breakdown counts before executing bulk deletions.
