# BRIEFING — 2026-10-07T17:15:00Z

## Mission
Investigate the real-time live synchronization architecture in Acc-Auction-Os.html and related files, answering 8 key questions on state propagation, timer sync, DOM re-rendering gaps, and designing zero-reload architecture.

## 🔒 My Identity
- Archetype: explorer
- Roles: [explorer, investigator, analyst]
- Working directory: B:\projects\ACC\.agents\teamwork\explorer_survey_sync_1
- Original parent: 66041fa3-be11-41c6-9f64-93d3c8cf496f
- Milestone: real-time-live-sync-survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source files
- Inspect Acc-Auction-Os.html and related files in B:\projects\ACC
- Document findings with exact line numbers and function names
- Provide complete 5-component handoff report

## Current Parent
- Conversation ID: 66041fa3-be11-41c6-9f64-93d3c8cf496f
- Updated: 2026-10-07T17:15:00Z

## Investigation State
- **Explored paths**:
  - `B:\projects\ACC\Acc-Auction-Os.html` (lines 2320-2432, 2830-2910, 3045-3115, 6094-6555, 6680-6980, 9285-9830, 12920-13850, 15320-15450, 15780-16750, 17020-17050)
  - `B:\projects\ACC\database.rules.json`
  - `B:\projects\ACC\firestore.rules`
  - `B:\projects\ACC\tests\test_timer_and_bid_sync.js`
  - `B:\projects\ACC\tests\test_auction_timer_root_cause.js`
  - `B:\projects\ACC\tests\test_page_reload_view_persistence.js`
  - `B:\projects\ACC\tests\test_player_visibility_and_realtime.js`
  - SHA256 parity verification across all 3 HTML files
- **Key findings**:
  1. Exactly 3 Firestore onSnapshot listeners exist (`users/{uid}`, `players`, `acc_auctions/acc_main_2026`). NO onSnapshot on `franchises`.
  2. BroadcastChannel handles `AUCTION_STATE_UPDATE` and `PLAYER_STATE_MUTATION`, but ignores `FRANCHISE_STATE_MUTATION`.
  3. Realtime Database WebSocket is only used for presence, `.info/connected`, and `.info/serverTimeOffset`, completely omitting high-speed live auction state despite `database.rules.json` granting access to `auctionState`.
  4. Auction timer uses `ClockSync` with median-of-8 filter over RTDB `.info/serverTimeOffset`, computing deadline countdown without local tick decrement.
  5. Admin console SVG countdown ring has `stroke-dasharray="327"` while `AuctionTimerEngine.updateDOM()` only queries `stroke-dasharray='157'`, leaving admin circle frozen.
  6. Firestore payload in `broadcastAuthoritativeState` contains the entire player list and full franchise rosters on every bid, creating risk of hitting Firestore's 1MB limit and high latency.
  7. Incoming snapshots trigger full `main.innerHTML = render...View()`, causing input focus loss, scroll jump, and visual jank on mobile.
  8. Offline/online event handler has a typo calling `window.RealtimeStore.subscribeAuctionState()` (undefined) instead of `window.RealtimeManager.subscribeAuctionState()`.
- **Unexplored areas**: None within scope. All 8 questions thoroughly traced.

## Key Decisions Made
- Structuring handoff.md according to the 5-component protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method) with comprehensive answers to all 8 questions.

## Artifact Index
- DISPATCH.md — incoming task dispatch
- progress.md — liveness heartbeat
- BRIEFING.md — persistent memory
- handoff.md — final comprehensive report
