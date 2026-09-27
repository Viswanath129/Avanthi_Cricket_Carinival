# BRIEFING — 2026-09-25T08:30:00Z

## Mission
Extract and document all authoritative specifications, mathematical formulas, business rules, validation criteria, data formats, and edge cases for the ACC Auction system.

## 🔒 My Identity
- Archetype: teamwork_preview_spec_miner
- Roles: Specification Miner
- Working directory: b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2
- Original parent: 98d0c292-7538-4fb8-b0a6-1d3003314ff3
- Milestone: Survey Phase 1 (Gen 2 replacement)

## 🔒 Key Constraints
- Read-only on codebase / external specs (do NOT implement anything).
- Prioritize authoritative sources: ORIGINAL_REQUEST.md, ACC Auction Website Problem Statement .pdf, and acc-auction-portal implementation.
- Must document all roll number regexes/patterns, college codes, branch codes, lateral entry codes, bucket mapping (B1-B5).
- Must document cricket questionnaire & player type derivation rules.
- Must document auction financial & roster rules (purses, base price, max bid formula, bidding ladder increments, bucket minimums).
- Must document auction control workflows (lot sequencing, timers, unsold, forensic UNDO requirements).
- Must document acceptance criteria & edge cases.
- Output format: Features Discovered table, Edge Cases table, and 5-component Handoff Protocol report in handoff.md.
- Notify parent via send_message when finished.

## Current Parent
- Conversation ID: 98d0c292-7538-4fb8-b0a6-1d3003314ff3
- Updated: 2026-09-25T08:23:00Z

## Task Summary
- **What to build**: Comprehensive authoritative specification extraction document for ACC Auction Website.
- **Success criteria**: Exhaustive, mathematically exact, and rule-precise handoff.md covering all 5 mission areas + acceptance criteria + edge cases.
- **Interface contracts**: b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2/handoff.md
- **Code layout**: .agents/teamwork/ only holds metadata.

## Key Decisions Made
- Initialized Gen 2 Spec Miner extraction after parent restarted task.
- Inspected ORIGINAL_REQUEST.md, all 16 pages of the Problem Statement PDF, shared/auctionRules.ts, and Acc-Auction-Os.html.
- Fully extracted 31 features into Features Discovered table and 37 edge cases into Edge Cases table.
- Verified exact mathematical formula for maximum permissible bid, bucket fillability, scarcity thresholds, and atomic undo state transitions.
- Authored complete 5-component handoff report to `b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2/handoff.md`.

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat
- handoff.md — Comprehensive specification discovery report
