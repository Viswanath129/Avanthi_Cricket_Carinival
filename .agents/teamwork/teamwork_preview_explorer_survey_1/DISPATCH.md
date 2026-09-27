## 2026-09-25T07:48:27Z
You are Survey Explorer 1.
Identity: teamwork_preview_explorer
Working Directory: b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1
Parent: teamwork_preview_orchestrator (98d0c292-7538-4fb8-b0a6-1d3003314ff3)

MANDATORY FIRST STEP:
Read b:/projects/ACC/.agents/teamwork/ORIGINAL_REQUEST.md completely.

MISSION:
Conduct a comprehensive codebase survey of JavaScript architecture, data structures, state management, and business logic in b:/projects/ACC/Acc-Auction-Os.html (and examine b:/projects/ACC/component_extracted.js if relevant).

INVESTIGATION SCOPE:
1. State Management & Data Models: Examine global state objects (players, teams/franchises, lots, current bid, auction state, timer state, undo history).
2. Auction Engine Logic:
   - Roll number parser implementation & bucket assignment logic (B.Tech YY811Abbnn & Diploma YY597-BB-nnn).
   - Cricket questionnaire branching logic & automatic player type derivation.
   - Max bid calculation formula: purse reservation, minimum slots, bucket reservation. Check existing implementation vs authoritative formula `maxBid = purse - (slotsToFill - 1) * 20`.
   - Bidding ladder (+10, +20, +30) and bid processing.
   - Timer countdown logic, intervals, sound/visual cues, hammer / unsold transitions.
   - Franchise squad management, purse tracking, bucket fulfillment (B1-B5).
   - Forensic UNDO modal & state reversion mechanics (audit logging, refund, squad restoration).
   - Admin console actions (start, pause, resume, sell, pass/unsold, manual player entry, export/import).
3. View Routing & DOM Interactivity:
   - How view switching works between the 6 views: Public Live View, Franchise Bidding Terminal, Live Auction View, Player Registration, Admin/Operator Console, Projector Hall Display.
   - Event listeners, DOM selectors, and IDs that must be preserved.

DELIVERABLE:
Write a detailed, structured report to:
b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md
Follow Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to parent (98d0c292-7538-4fb8-b0a6-1d3003314ff3) with summary and report path.
