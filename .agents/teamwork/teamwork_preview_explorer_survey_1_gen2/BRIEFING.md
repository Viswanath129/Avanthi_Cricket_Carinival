# BRIEFING — 2026-09-25T08:31:00Z

## Mission
Comprehensive codebase survey of JavaScript architecture, data structures, state management, and auction business logic across Acc-Auction-Os.html, component_extracted.js, Home.tsx, auctionRules.ts, and restored_html/.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase exploration, architecture analysis, business logic verification, synthesis
- Working directory: b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1_gen2
- Original parent: 98d0c292-7538-4fb8-b0a6-1d3003314ff3
- Milestone: Survey Phase (JavaScript & Business Logic Architecture)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strict verification of business logic against original specifications and formulas
- Write reports and analysis to working directory only; never modify source code directly
- Standalone HTML delivery context for Acc-Auction-Os.html

## Current Parent
- Conversation ID: 98d0c292-7538-4fb8-b0a6-1d3003314ff3
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `b:/projects/ACC/acc-auction-portal/shared/auctionRules.ts`
  - `b:/projects/ACC/acc-auction-portal/server/auction.rules.test.ts`
  - `b:/projects/ACC/acc-auction-portal/client/src/pages/Home.tsx`
  - `b:/projects/ACC/Acc-Auction-Os.html`
  - `b:/projects/ACC/build_acc_os.py`
  - `b:/projects/ACC/component_extracted.js`
  - `b:/projects/ACC/restored_html/` (`Admin.html`, `Franchise-Bidding.html`, `Player-Registration.html`, `Projector.html`, `Public.html`)
- **Key findings**:
  - Max bid formula `slotsToFill = max(15 - bought, sum(unmetBuckets))`, `reserve = (slotsToFill - 1) * 20`, `maxBid = max(0, purse - reserve)` verified mathematically and confirmed passing 6/6 test fixtures in Vitest.
  - Rule 12.2 bucket eligibility blocks non-mandatory bucket bidding when remaining squad slots equal unmet mandatory bucket slots.
  - Roll number parser accurately handles JNTU B.Tech (regular 1-4 yr, lateral 2-4 yr) and Polytechnic Diploma (B5).
  - Cricket questionnaire branching logic automatically derives 6 player types based on Batting, Bowling, and Wicket-Keeping answers.
  - Timer expiration does NOT trigger auto-hammer; hammer is strictly an explicit operator action.
  - Forensic undo performs multi-lot rollback, refunds purse, frees roster slot, restores player to unsold pool, updates bucket tallies, and prevents double-undo.
  - Architecture across 6 views (Public, Franchise Terminal, Live Auction, Registration, Admin Console, Projector) verified.
- **Unexplored areas**: None for JS and auction engine survey. Investigation complete.

## Key Decisions Made
- Executed Vitest test suite (`npm test -- --run`) in `acc-auction-portal` with 100% test pass rate (5 tests across 2 suites).
- Documented findings with direct line-number citations in `handoff.md`.

## Artifact Index
- `b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1_gen2/progress.md` — Liveness heartbeat
- `b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1_gen2/handoff.md` — 5-component handoff report
