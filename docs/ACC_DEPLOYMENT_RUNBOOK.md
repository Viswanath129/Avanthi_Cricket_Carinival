# ACC 2026 AUCTION PORTAL — EVENT-DAY DEPLOYMENT RUNBOOK
**Classification:** Operational Runbook · Mission Critical  
**Target Event:** Avanthi Cricket Carnival 2026 Live Auction  
**Audience:** Super Admin, Technical Lead, Stage Operator, Network Engineer

---

## 1. EVENT TIMELINE & OPERATIONAL CHECKPOINTS

```mermaid
timeline
    title Live Auction Event-Day Timeline
    T-24 Hours : Final Database Snapshot
               : Offline Fallback USB Flash Drive Prepared
               : 11 Franchise Accounts Provisioned
    T-4 Hours  : Dedicated Wi-Fi Mesh Deployed (ACC-AUCTION-STAGE)
               : Stage Projector & Dual Displays Tested
               : Clock Synchronization Check (<100ms drift)
    T-1 Hour   : Franchise Device Pre-Flight & Login Verification
               : Dry Run Lot Simulation (Lots #991-#995)
               : Reset Database to Official Starting Roster
    T-15 Mins  : Stage Lock: Network Isolation Verified
               : Operator Keyboard Shortcuts Verified
               : Projector Screen Switched to Live Standby
    T-00:00    : Live Auction Begins (Bucket B3 First Lot)
    Post-Event : Export Master CSV & JSON Audit Archive
               : Handover Final Squad Rosters to Match Committee
```

---

## 2. INFRASTRUCTURE & NETWORK TOPOLOGY

### 2.1 Network Setup (Zero-Interference Architecture)
- **Primary Stage Wi-Fi SSID**: `ACC-STAGE-PRIVATE` (Hidden, 5GHz only, WPA3).
  - Devices allowed: 11 Franchise tablets/phones, 1 Operator laptop, 1 Projector PC.
  - Bandwidth allocation: Minimum 50 Mbps symmetrical low-latency uplink.
- **Auditorium Spectator Wi-Fi**: `ACC-SPECTATOR` (Isolated VLAN, bandwidth throttled to 2 Mbps per client).
- **Cellular Failover**: High-gain 5G Industrial Gateway configured with auto-failover within 500ms.

### 2.2 Hardware Deployment Checklist
1. **Operator Console**: Core i7 / 16GB RAM laptop plugged into dedicated 1kVA Online UPS.
2. **Projector Setup**:
   - Primary: 10,000 ANSI Lumens Auditorium Laser Projector (1920x1080 native).
   - Display Connection: Direct HDMI via optical active cable (zero signal degradation).
   - Audio: 3.5mm stereo output routed to Auditorium PA mixer for hammer gong and timer alert audio.
3. **Franchise Consoles**: 11 dedicated Android/iOS tablets (pre-configured with Chrome in Kiosk mode, wake-lock enabled).

---

## 3. CLOCK SYNCHRONIZATION & DRIFT MONITORING

The live auction relies on server-authoritative countdown timers.
- **Server Clock Reference**: Google Cloud NTP / Firebase RTDB `/.info/serverTimeOffset`.
- **Pre-Flight Drift Test**:
  ```javascript
  const offsetRef = firebase.database().ref("/.info/serverTimeOffset");
  offsetRef.on("value", (snap) => {
    const offset = snap.val();
    console.log(`Clock offset from server: ${offset} ms`);
    if (Math.abs(offset) > 1000) {
      alert("WARNING: Client system clock drifted by >1s! Resynchronize system clock.");
    }
  });
  ```
- **Acceptable Drift**: Must remain within $\pm 1000\text{ms}$ at all times.

---

## 4. PRE-AUCTION DRY RUN PROCEDURE

At $T-60\text{ minutes}$, execute the standard 5-lot dry run:
1. Load temporary test dataset (`seed_dryrun_lots.json`).
2. Draw Lot #991 (Bucket B3).
3. Have Franchise T01 and T03 place competing bids up to 120 Credits.
4. Verify countdown timer resets to 20 seconds on each bid.
5. Operator triggers Hammer ($H$) $\rightarrow$ Confirm Sale.
6. Verify purse decrements on T03 and squad count increases.
7. Execute Undo ($U$) on Lot #991 $\rightarrow$ Verify full refund and squad rollback.
8. Execute Database Reset script:
   ```bash
   node scripts/reset_to_official_roster.js --edition ACC_2026 --confirm
   ```

---

## 5. CONTINGENCY & DISASTER RECOVERY PROTOCOLS

### 5.1 Protocol A: Complete Internet Outage (Switch to Mode A Standalone)
If external connectivity fails completely:
1. Operator launches `Acc-Auction-Os.html` directly from local SSD (`file:///B:/projects/ACC/Acc-Auction-Os.html`).
2. Standalone app runs in LocalStorage / In-Memory mode without external dependencies.
3. Projector display is mirrored via extended desktop.
4. Operator acts as auctioneer and enters bids on behalf of franchises via physical paddles.
5. All transactions are logged to local `acc_offline_audit.json`.

### 5.2 Protocol B: Franchise Device Disconnect Mid-Bid
1. Bids in flight during network disconnect are safely dropped by server validation.
2. Franchise display presents red reconnect toast: *"Network interrupted. Reconnecting..."*
3. Upon reconnection, the client automatically pulls current high bid and active timer.
4. Franchise re-enters bidding with single tap.

### 5.3 Protocol C: Disputed Sale / Misclick by Operator
1. Operator presses `P` to immediately pause the auction clock.
2. Super Admin reviews dispute with Stage Committee.
3. If sale is invalid:
   - Operator presses `U` (Undo).
   - Selects disputed lot from dropdown.
   - Types reason (`"Franchise paddle raised before hammer"`) and confirms.
   - System atomically restores player to unsold queue and refunds purse.
4. Operator resumes clock (`P`) or restarts lot (`Space`).

---

## 6. BACKUP CADENCE & PERSISTENCE

- **Automated Rolling Snapshot**: Generated every 10 committed lots to both Firestore `/backups` and local browser IndexedDB.
- **Manual Snapshot**:
  - Hotkey `Ctrl + S` triggers instant state snapshot.
  - Mandatory manual snapshot before every bucket transition ($B3 \rightarrow B4 \rightarrow B2 \rightarrow D5 \rightarrow B1 \rightarrow PG$).
- **Export Formats**:
  - `ACC_2026_STATE_LOT_<N>.json` (Full database tree)
  - `ACC_2026_SQUADS_SUMMARY.csv` (Rosters, purses, quota statuses)
  - `ACC_2026_AUDIT_LOG.csv` (Complete immutable audit trail with millisecond timestamps)

---

## 7. POST-AUCTION CLOSEOUT PROCEDURE

1. Verify all 11 franchises have completed mandatory squad quotas (15–16 players).
2. If any franchise has unfilled mandatory quota:
   - Execute Round 2 / Auto-Allotment engine.
   - Run scouting fallback at base price 20 credits if supply exhausted.
3. Super Admin clicks **[FINALIZE TOURNAMENT]**.
4. Lock all accounts to read-only status.
5. Download final master archive bundle.
6. Print physical signed copies of squad rosters for Team Captains and Match Referee.
