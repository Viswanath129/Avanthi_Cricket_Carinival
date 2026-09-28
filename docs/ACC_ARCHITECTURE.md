# ACC 2026 — End-to-End System Architecture Document
**Target Environment:** Avanthi Cricket Carnival 2026 Tournament Operating System  
**Architecture Classification:** Dual-Delivery High-Reliability Web OS & Cloud Distributed Portal

---

## 1. High-Level Architectural Topology

```
+-----------------------------------------------------------------------------------------+
|                                    DELIVERY MODE A                                      |
|                       Zero-Dependency Standalone Web OS                                 |
|                   (Acc-Auction-Os.html / index.html - 611 KB)                            |
|                                                                                         |
|   +-----------------------+   +-----------------------+   +-------------------------+   |
|   |   Auctioneer Laptop   |   |    Auditorium Wall    |   | 11 Mobile Captain Bids  |   |
|   |  Super Admin Console  |   |   1440px+ Projector   |   |   Franchise Terminals   |   |
|   +-----------+-----------+   +-----------+-----------+   +------------+------------+   |
|               |                           |                            |                |
|               +---------------------------+----------------------------+                |
|                                           |                                             |
|                                [ Web BroadcastChannel ]                                 |
|                               'acc_auction_mesh_2026'                                   |
|                        (Sub-millisecond local screen sync)                              |
+-------------------------------------------+---------------------------------------------+
                                            | (Cloud Uplink)
                                            v
+-----------------------------------------------------------------------------------------+
|                                    DELIVERY MODE B                                      |
|                         Enterprise Cloud Distributed Portal                             |
|                                                                                         |
|       +------------------------------------+------------------------------------+       |
|       |                                    |                                    |       |
|       v                                    v                                    v       |
|  [ Cloud Firestore ]             [ Realtime Database ]                [ Cloud Storage ] |
|  - player profiles               - presence heartbeat                 - player photos   |
|  - franchise quotas              - live clock drift                   - team logos      |
|  - transactions & lots           - sub-second bidder queue            - audit dumps     |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Multi-Actor Information Architecture

The system enforces strict role isolation across 5 primary actor groups:

```
                                 [ ACC 2026 Router ]
                                          |
          +-------------------------------+-------------------------------+
          |                               |                               |
    [ Public Surface ]         [ Authentication Gate ]          [ Stage Displays ]
          |                               |                               |
    +-----+-----+                         |                         +-----+-----+
    |           |                         |                         |           |
[ Catalog ] [ Live Wall ]                 |                   [ Projector ] [ Monitor ]
                                          |
          +---------------+---------------+---------------+
          |               |               |               |
          v               v               v               v
   [ Super Admin ]   [ Operator ]   [ Franchise ]    [ Player ]
   - Overview        - Live Cockpit - Team Squad     - My Profile
   - Players Mgmt    - Draw Stage   - Real-time Bid  - CricHeroes
   - Verifications   - Hammer       - Max Legal Bid  - Player Pass
   - Franchises      - Behalf Bids  - Quota Matrix   - Registration
   - Auction Draw    - Clock Pause  - Pass/Re-enter
   - Round 2
   - Undo/Recovery
   - Data Mgmt
   - Audit Ledger
   - Settings
```

---

## 3. Core Engine Subsystems

### 3.1 Academic Classification Subsystem (`rollClassifier.ts`)
- **Roll Number Normalization:** Upper-case trimming, dash/space removal.
- **B.Tech Regular:** Pattern `^(\d{2})811(1A|A)(\d{2})(\d{2})$`. Study year = `(currentAcademicYear - YY) + 1`.
- **B.Tech Lateral Entry:** Pattern `^(\d{2})815(1A|A|5A)(\d{2})(\d{2})$`. Lateral entrant enters 2nd year -> Study year = `(currentAcademicYear - YY) + 2`.
- **Diploma:** Pattern `^(\d{2})597-?([A-Z]{2})-?(\d{3})$`. Study year = `(currentAcademicYear - YY) + 1`. Bucket = `D5`.
- **Postgraduate:** Program `M.Tech | MBA | MCA`. Bucket = `M6` (unrestricted, zero quota obligations).

### 3.2 Bidding & Mathematical Solvency Engine (`bidEngine.ts`)
- **Discrete Increment Ladder:**
  - `price < 100`: Increment `+10`
  - `100 <= price < 200`: Increment `+20`
  - `price >= 200`: Increment `+30`
- **Mandatory Reserve Formula (Problem Statement §12.1):**
  $$\text{mandatoryAfterLot} = \max\left(0, \sum_{b \in \{B1..D5\}} \max(0, \text{min}_b - \text{count}_b) - \Delta_b\right)$$
  $$\text{regularSlotsAfterLot} = \max\left(0, 15 - (\text{purchased} + 1)\right)$$
  $$\text{slotsToFill} = \max(\text{mandatoryAfterLot}, \text{regularSlotsAfterLot})$$
  $$\text{reserveRequired} = \max(0, \text{slotsToFill} - 1) \times 20$$
  $$\mathbf{maxBid} = \max(0, \text{purseRemaining} - \text{reserveRequired})$$

### 3.3 Slot Protection Engine (`bucketEligibility.ts` - Rule 12.2)
- Assesses whether purchasing a non-mandatory lot would cause a mandatory quota violation.
- If `(15 - (purchased + 1)) < mandatoryDeficitRemaining`, prospective bid is strictly blocked.

### 3.4 Forensic Undo Engine (`undoSale.ts`)
- Restores deducted purse credits back to the affected franchise.
- Decrements squad purchase count and decrements bucket count if applicable.
- Re-opens player state to `AVAILABLE`.
- Emits an append-only audit record containing operator UID, timestamp, and mandatory justification note.
- Enforces single-undo idempotency.
