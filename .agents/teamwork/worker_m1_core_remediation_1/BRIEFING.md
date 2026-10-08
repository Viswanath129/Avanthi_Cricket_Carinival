# BRIEFING — 2026-10-07T17:25:00Z

## Mission
Implement Milestone 1 Core Platform Remediation & Real-Time Live Sync in Acc-Auction-Os.html with 0 regressions across all acceptance test suites.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: B:\projects\ACC\.agents\teamwork\worker_m1_core_remediation_1
- Original parent: 66041fa3-be11-41c6-9f64-93d3c8cf496f
- Milestone: Milestone 1 - Core Platform Remediation & Real-Time Live Sync

## 🔒 Key Constraints
- Exclusive write ownership: B:\projects\ACC\Acc-Auction-Os.html only.
- DO NOT modify files outside boundary without orchestrator instruction.
- Genuine implementation only: no hardcoded test hacks, no dummy facades.
- All existing tests and acceptance suites must pass with 0 regressions.

## Current Parent
- Conversation ID: 66041fa3-be11-41c6-9f64-93d3c8cf496f
- Updated: not yet

## Task Summary
- **What to build**: 
  1. Real-Time Live Sync Engine: Firebase RTDB WebSocket fast pipe (`fbRtdb.ref("auctionState/live")`), fallback Firestore merge, granular reactive DOM patching (updateLiveAuctionDOM, updateTimerDOM), server clock sync, SVG timer ring selector (327 and 157), franchise directory & mutation sync, tri-state connection badges with explicit IDs and correct OFFLINE text, network reconnect listener.
  2. All-Role Feature Defect Remediation: Auth route query isolation (/login?mode=...), logout session cleanup & admin bypass removal, direct assign & undo sale integrity with alphanumeric roll numbers, manual lot modal string quoting, quick lot call mapping to lot index, draw mode toggle AUTO/MANUAL, photo cropper transparent canvas fill, franchise approval dual accounts (COORDINATOR + TEAM_LEADER), scoped keyboard shortcuts & timer modal, franchise terminal pass button, public view active lot index, franchise status badges, typo fix in franchise registration.
- **Success criteria**: All objectives implemented cleanly; test suites pass.
- **Interface contracts**: PROJECT.md, survey handoffs.
- **Code layout**: Acc-Auction-Os.html single-page architecture with modular components.

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending initial baseline test run
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Clean
- **Tests added/modified**: Test suite verification pending

## Loaded Skills
- None loaded explicitly yet

## Key Decisions Made
- Will baseline tests first before making edits.

## Artifact Index
- B:\projects\ACC\Acc-Auction-Os.html — Main target file
- B:\projects\ACC\.agents\teamwork\worker_m1_core_remediation_1\progress.md — Progress tracker
- B:\projects\ACC\.agents\teamwork\worker_m1_core_remediation_1\handoff.md — Final handoff report
