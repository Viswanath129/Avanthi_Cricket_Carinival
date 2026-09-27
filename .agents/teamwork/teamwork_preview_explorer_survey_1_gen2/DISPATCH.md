## 2026-09-25T08:21:48Z
You are Survey Explorer 1 (Gen 2 replacement).
Identity: teamwork_preview_explorer
Working Directory: b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1_gen2
Parent: teamwork_preview_orchestrator (98d0c292-7538-4fb8-b0a6-1d3003314ff3)

MANDATORY FIRST STEP:
Read b:/projects/ACC/.agents/teamwork/ORIGINAL_REQUEST.md completely.

CONTEXT & CRITICAL SHORTCUT:
The target application is b:/projects/ACC/Acc-Auction-Os.html (and component_extracted.js).
Importantly, the full unminified source code and core components are located in:
- b:/projects/ACC/acc-auction-portal/client/src/pages/Home.tsx (2247 lines, contains all React state, views, roll number parser, auction loop, modal components, questionnaire, etc.)
- b:/projects/ACC/acc-auction-portal/shared/auctionRules.ts (contains maximumPermissibleBid, bidIncrement, scarcityWarning, isBucketEligible, etc.)
- b:/projects/ACC/restored_html/ (contains Admin.html and other view HTML files)

MISSION:
Conduct a comprehensive codebase survey of JavaScript architecture, data structures, state management, and auction business logic.
1. State Management & Data Models: Examine franchises (11 teams), players (lots), auction state (timer, currentLot, currentBid, bids history, sales history, audit log, undo history).
2. Auction Engine Logic:
   - Roll number parser implementation & bucket assignment (B.Tech YY811Abbnn & Diploma YY597-BB-nnn).
   - Cricket questionnaire branching logic & automatic player type derivation.
   - Max bid calculation formula: check maximumPermissibleBid against authoritative formula `maxBid = purse - (slotsToFill - 1) * 20` where `slotsToFill = max(15 - bought, sum(unmetBuckets))`.
   - Bidding ladder (+10, +20, +30) and bid processing.
   - Timer countdown logic, intervals, sound/visual cues, hammer / unsold transitions.
   - Franchise squad management, purse tracking, bucket fulfillment (B1-B5).
   - Forensic UNDO modal & state reversion mechanics (audit logging, refund, squad restoration).
   - Admin console actions.
3. View Routing & DOM Interactivity:
   - The 6 views: Public Live View, Franchise Bidding Terminal, Live Auction View, Player Registration, Admin/Operator Console, Projector Hall Display.
   - How Acc-Auction-Os.html packages or renders these.

DELIVERABLE:
Write a comprehensive structured report to:
b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_survey_1_gen2/handoff.md
Follow Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to parent (98d0c292-7538-4fb8-b0a6-1d3003314ff3) with summary and report path.
