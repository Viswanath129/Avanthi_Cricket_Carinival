# BRIEFING — 2026-10-07T18:15:00Z

## Mission
Drive ACC 2026 Cricket Auction Platform through full feature verification, defect remediation, cross-device real-time live synchronization, 3-file SHA-256 byte parity, and live Firebase Hosting deployment.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: B:\projects\ACC\.agents\teamwork\orchestrator_5
- Original parent: parent
- Original parent conversation ID: f957adba-10e0-4561-8d1c-f264407a5b8a

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: B:\projects\ACC\PROJECT.md
1. **Decompose**:
   - Milestone 1: Core Platform Remediation & Real-Time Live Sync [IN_PROGRESS]
   - Milestone 2: E2E Verification & Adversarial Testing [PLANNED]
   - Milestone 3: 3-File Byte Parity & Production Deployment [PLANNED]
2. **Dispatch & Execute**:
   - Direct iteration loop: Explorer → Worker → Reviewer / Challenger / Auditor → Gate
   - Verification gate: 2 Reviewers (APPROVE), 2 Challengers (PASS), 1 Forensic Auditor (CLEAN)
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (last resort)
4. **Succession**: At 16 spawns or context exhaustion, write soft handoff, spawn successor.
- **Work items**:
  1. Milestone 1: Core Platform Remediation & Real-Time Live Sync [IN_PROGRESS]
  2. Milestone 2: E2E Verification & Adversarial Testing [PLANNED]
  3. Milestone 3: 3-File Byte Parity & Production Deployment [PLANNED]
- **Current phase**: Milestone 1 Implementation & Verification
- **Current focus**: Assessing M1 implementation state in Acc-Auction-Os.html and driving M1 completion.

## 🔒 Key Constraints
- Target codebase is a single-file HTML app (`Acc-Auction-Os.html`, ~17,000 lines), deployed to Firebase Hosting at `https://studio-6471864054-30ce7.web.app`.
- Three copies MUST remain 100% bit-for-bit SHA-256 byte identical: `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html`.
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- Audit is a binary veto: If Forensic Auditor reports INTEGRITY VIOLATION, milestone fails unconditionally.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: f957adba-10e0-4561-8d1c-f264407a5b8a
- Updated: 2026-10-07T18:15:00Z

## Key Decisions Made
- Succeeded orchestrator_4 following executor network disconnect.
- Existing codebase has major diff (+2,257 / -833) in Acc-Auction-Os.html implementing core RTDB live sync and DOM patching.
- Next step: dispatch Explorer/Worker to assess current git diff, verify baseline test suite, finish remaining M1 items, and run verification gate.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|

## Succession Status
- Succession required: no
- Spawn count: 0 / 16
- Pending subagents: none
- Predecessor: orchestrator_4
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: not started
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md — Authoritative User Request
- B:\projects\ACC\.agents\teamwork\orchestrator_5\DISPATCH.md — Dispatch log
- B:\projects\ACC\.agents\teamwork\orchestrator_5\progress.md — Progress log
- B:\projects\ACC\PROJECT.md — Global architecture & feature inventory
