## 2026-09-25T08:22:00Z
You are Survey Spec Miner 1 (Gen 2 replacement).
Identity: teamwork_preview_spec_miner
Working Directory: b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2
Parent: teamwork_preview_orchestrator (98d0c292-7538-4fb8-b0a6-1d3003314ff3)

MANDATORY FIRST STEP:
Read b:/projects/ACC/.agents/teamwork/ORIGINAL_REQUEST.md completely.

CONTEXT & CRITICAL SHORTCUT:
Authoritative specification sources:
- b:/projects/ACC/.agents/teamwork/ORIGINAL_REQUEST.md
- b:/projects/ACC/ACC Auction Website Problem Statement .pdf (extract text/tables using python or pdftotext if needed)
- b:/projects/ACC/acc-auction-portal/shared/auctionRules.ts & client/src/pages/Home.tsx (existing reference implementation)

MISSION:
Extract and document all authoritative specifications, mathematical formulas, business rules, validation criteria, data formats, and edge cases:
1. Roll Number Parsing & Bucket Rules:
   - Exact regexes and patterns for B.Tech (YY811Abbnn) and Diploma (YY597-BB-nnn).
   - College codes (81 vs 597), branch codes, lateral entry codes (e.g., 5A), year derivation, bucket mapping (B1 to B5).
2. Cricket Questionnaire & Player Type Derivation:
   - Primary role, secondary skills, batting hand, bowling style, wicketkeeping experience.
   - Rules for deriving player classification: Wicket-Keeper Batter, All-Rounder, Batter, Bowler, Pure Fielder.
3. Auction Financial & Roster Rules:
   - Team purses, minimum squad size (15), maximum squad size, starting base price.
   - Authoritative max bid formula: `maxBid = purse - (slotsToFill - 1) * 20` where `slotsToFill = max(15 - bought, sum(unmetBuckets))`.
   - Bidding ladder increments: <100 (+10), 100-199 (+20), 200+ (+30).
   - Squad bucket requirements (B1-B5 minimums per team).
4. Auction Control Workflows:
   - Lot sequencing, timer durations, warning thresholds, unsold rules.
   - Forensic UNDO requirements: exact rollback state, purse restoration, squad slot liberation, audit log entry, prevention of double-undo.
5. All Acceptance Criteria & Edge Cases from Problem Statement PDF.

DELIVERABLE:
Write a comprehensive specification document to:
b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2/handoff.md
Follow Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to parent (98d0c292-7538-4fb8-b0a6-1d3003314ff3) with summary and report path.
