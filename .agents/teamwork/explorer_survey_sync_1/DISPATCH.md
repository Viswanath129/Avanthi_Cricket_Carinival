## 2026-10-07T16:47:44Z

Investigate the real-time live synchronization architecture in B:\projects\ACC\Acc-Auction-Os.html (and any associated files).
Analyze how auction state, timer countdowns, bid amounts, lot changes, squad updates, and connection status propagate across connected clients (Admin Console, Franchise Terminals, Projector, Public Live View).

SCOPE BOUNDARIES:
- Read-only technical exploration. DO NOT modify any source files.
- Inspect Acc-Auction-Os.html and related files in B:\projects\ACC.

KEY QUESTIONS TO ANSWER WITH CODE EVIDENCE (exact line numbers and function names):
1. How are Firestore onSnapshot listeners and BroadcastChannel currently set up? Which collections/documents are subscribed to?
2. How does the auction timer currently work? Is it purely local setInterval or is there server-time-offset synchronization? How is the timer synced across devices?
3. What happens when a bid is placed? Trace the exact path from UI click -> Firestore write -> snapshot received -> UI update on other devices.
4. What happens when a lot is drawn, changed, or hammered? Trace the state propagation.
5. What happens when purse/squad changes? Trace the state propagation to franchise terminals.
6. Does the incoming snapshot/event trigger an actual DOM re-render on all views, or does the UI remain stale until page reload or tab switch? Identify the exact gaps in the reactive UI pipeline.
7. How is connection status (LIVE/OFFLINE/RECONNECTING) handled across views?
8. Propose a concrete, step-by-step technical architecture to achieve true zero-reload live sync (stock-market / ride-hailing level).

OUTPUT REQUIREMENTS:
- Keep B:\projects\ACC\.agents\teamwork\explorer_survey_sync_1\progress.md updated.
- Write your complete findings to B:\projects\ACC\.agents\teamwork\explorer_survey_sync_1\handoff.md.
- Send a completion message to parent when done.
