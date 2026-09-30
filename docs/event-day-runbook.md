# ACC 2026 — Event-Day Runbook

**Tournament:** Avanthi Cricket Carnival (ACC) 2026  
**Venue:** Avanthi Institute of Engineering & Technology Auditorium  
**Target Roles:** Super Admin, Technical Lead, Floor Operator, Network Engineer

---

## 1. Pre-Event Timeline

| Time | Stage | Action Items | Responsible |
|:---|:---|:---|:---|
| **T-24h** | Data Freeze | Verify all 11 franchise profiles & registrations approved. Export pre-auction snapshot. | Super Admin |
| **T-4h** | Network Setup | Stage Wi-Fi `ACC-STAGE-PRIVATE` (5GHz WPA3) enabled. Connect Operator & Projector. | Network Lead |
| **T-2h** | Hardware Check | Projector resolution 1920x1080 verified. Audio output tested for hammer gong. | AV Lead |
| **T-1h** | Pre-Flight Rehearsal | Run 3 demo lots on staging/test partition. Confirm timer drift < 100ms. | Operator |
| **T-30m** | Franchise Login | Issue credentials to 11 Faculty Coordinators & Captains. Verify live presence badge. | Admin |
| **T-10m** | Final Lock | Projector switched to live lot 1 standby. Operator verifies keyboard shortcuts. | Operator |
| **T-0** | Hammer Drop | First lot called (Bucket B3). Live auction underway. | Super Admin |

---

## 2. Emergency Quick Actions

### Scenario A: Network Drop on Stage
1. **Operator Console:** Switch to cellular hotspot failover.
2. **Offline Fallback:** `Acc-Auction-Os.html` standalone operates offline via Web BroadcastChannel mesh with zero packet drop across open tabs on same machine.
3. **Franchise Bids:** Captain calls bid orally to floor marshal; Operator inputs bid via `B` (Bid on behalf) specifying franchise and amount.

### Scenario B: Accidental Hammer / Erroneous Sale
1. Press `U` or click **UNDO SALE**.
2. Select the disputed lot from the sale history.
3. Input mandatory justification reason (e.g., "Disputed simultaneous floor bid").
4. Click **CONFIRM ROLLBACK**. State, purse balances, and bucket quotas atomically revert.

### Scenario C: Franchise Disconnection Mid-Bid
1. Press `P` to **PAUSE AUCTION**.
2. Timer freezes remaining milliseconds.
3. Verify franchise device re-connection on live presence board.
4. Press `P` to **RESUME AUCTION**. Countdown resumes seamlessly.

### Scenario D: Bucket Quota Exhaustion
1. If remaining unsold in mandatory bucket (B1-D5) reaches 0:
2. Open **RELAX BUCKET MINIMUM** modal (`R`).
3. Select bucket and reduce minimum by 1 uniformly across all 11 teams.
4. All 11 franchises have max permissible bids immediately unlocked.

---

## 3. Post-Event Sign-Off
1. Press `Ctrl+E` to export official tournament database CSV bundle.
2. Press `Ctrl+S` to save raw JSON master snapshot.
3. Print final squad rosters for match committee signature.
