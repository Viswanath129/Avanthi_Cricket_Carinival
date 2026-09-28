# ACC 2026 — Official Tournament Auction Rules & Mathematical Specifications
**Authoritative Reference:** Problem Statement Sections 7, 9, 10, 11, 12, 13

---

## 1. Squad Composition & Financial Limits
- **Initial Purse:** 1000 Credits per franchise.
- **Minimum Squad Size:** 17 players.
- **Maximum Squad Size:** 22 players.
- **Free Retained Players:** Captain + Vice-Captain (2 players, registered students, 0 credits, outside auction slots).
- **Free Referred Players:** 0 to 5 players (admitted in academic year 2026, 0 credits, outside auction slots).
- **Mandatory Auction Purchases:** Exactly 15 purchases minimum.
- **Quota Distribution:**
  - Bucket B1 (B.Tech 1st Year): Minimum 2 players
  - Bucket B2 (B.Tech 2nd Year): Minimum 2 players
  - Bucket B3 (B.Tech 3rd Year): Minimum 2 players
  - Bucket B4 (B.Tech 4th Year): Minimum 2 players
  - Bucket D5 (Diploma - all years): Minimum 2 players
  - Unrestricted (can include PG / M6): Exactly 5 players

---

## 2. Bidding Increments & Anti-Jump Rule (§11)
Bidding starts at the player's declared base price (from ladder: 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250).

| Current Valuation Tier | Compulsory Increment (Δ) | Example Progression |
| :--- | :---: | :--- |
| **Current Price < 100 C** | **+10 C** | 20 -> 30 -> 40 ... -> 90 -> 100 |
| **100 C <= Current Price < 200 C** | **+20 C** | 100 -> 120 -> 140 ... -> 180 -> 200 |
| **Current Price >= 200 C** | **+30 C** | 200 -> 230 -> 260 -> 290 ... |

**Anti-Jump Protection:** Bidders cannot submit arbitrary values. Every bid click advances the price by exactly Δ.

---

## 3. Mathematical Solvency & Maximum Legal Bid (§12.1)
No franchise is ever allowed to place a bid that would prevent it from completing its remaining required squad slots at minimum possible price (20 credits per slot).

### The Math:
1. Let `bought` be current count of auction purchases.
2. Let `unmetMandatory` be total remaining quota shortages across B1, B2, B3, B4, D5.
   - If current lot is in a mandatory bucket where team still needs players, `unmetMandatoryAfterLot = unmetMandatory - 1`.
   - Otherwise, `unmetMandatoryAfterLot = unmetMandatory`.
3. Let `regularSlotsRemainingAfterLot = 15 - (bought + 1)`.
4. Let `slotsToFill = Math.max(regularSlotsRemainingAfterLot, unmetMandatoryAfterLot)`.
5. Let `reserveRequired = Math.max(0, slotsToFill) * 20`.
6. Therefore:
   $$\mathbf{maxBid} = \text{purseRemaining} - \text{reserveRequired}$$

### Boundary Test Cases (Appendix A.1):
1. **Purse 1000, 0 bought, 5 bucket minimums unmet (needs 10 players total):**
   - Slots after lot: `15 - 1 = 14`. Unmet after lot: `10 - 1 = 9`.
   - Reserve: `14 * 20 = 280`. `maxBid = 1000 - 280 = 720`. (Verified: 720)
2. **Purse 1000, 14 bought, all minimums met:**
   - Slots after lot: `0`. Reserve: `0`. `maxBid = 1000`. (Verified: 1000)
3. **Purse 340, 11 bought, 5 mandatory slots still unfilled:**
   - Slots after lot: `15 - 12 = 3`. Unmet after lot: `5 - 1 = 4`.
   - Max slots to fill: `max(3, 4) = 4`. Reserve: `4 * 20 = 80`.
   - `maxBid = 340 - 80 = 260`. (Verified: 260)
4. **Purse 200, 13 bought, all minimums met:**
   - Slots after lot: `15 - 14 = 1`. Reserve: `1 * 20 = 20`.
   - `maxBid = 200 - 20 = 180`. (Verified: 180)
5. **Purse 20, 14 bought, all minimums met:**
   - Slots after lot: `0`. Reserve: `0`. `maxBid = 20`. (Verified: 20)
6. **Purse 600, 15 bought, all minimums met:**
   - Slots after lot: `0`. Reserve: `0`. `maxBid = 600`. (Verified: 600 - no restriction)

---

## 4. Rule 12.2 Mandatory Slot Protection
- A franchise with $R$ remaining slots must not bid on an unrestricted or non-mandatory player if $R \le \text{unmetMandatorySlots}$.
- **Case 7:** 1 slot left, needs diploma player -> bids on B.Tech 2nd year -> **BLOCKED**.
- **Case 8:** 3 slots left, needs 2 diploma players -> bids on PG -> **ALLOWED** (leaves 2 slots for 2 diploma).
- **Case 9:** 2 slots left, needs 2 diploma players -> bids on PG -> **BLOCKED** (would leave 1 slot for 2 diploma).
- **Case 10:** 20 credits, 1 unfilled diploma slot -> bids 20 on diploma -> **ALLOWED**.

---

## 5. Draw Sequencing & Lot Execution (§10)
- **Bucket Order:** B.Tech 3rd Year (B3) -> B.Tech 4th Year (B4) -> B.Tech 2nd Year (B2) -> Diploma (D5) -> B.Tech 1st Year (B1) -> PG (M6).
- **Draw Modes:**
  - **Guest Mode:** Operator enters lot/number called aloud by guest.
  - **Auto Mode:** System performs random draw from active bucket pool.
  - No player drawn twice.
- **Skipping:** Skipped players re-queued at the end of their bucket at original base price; if not recalled, moved to Round 2.
- **Countdown Clock:** 30s initial on lot reveal; 20s reset on every bid. Clock expiry does NOT sell player; Super Admin hammer is mandatory.

---

## 6. Endgame Cascade & Auto-Allotment (§13)
- **Round 2:** All unsold/skipped players reopened with base price reset to 20. Captains can request recall.
- **Step 1: Auto-Allotment:**
  - Remaining unsold players allotted at 20 credits.
  - Priority: Franchise with **most unfilled slots first**, tiebreaker **smallest remaining purse**.
  - Display label: strictly **"Allotted"**, never "Sold".
- **Step 2: Bucket Exhaustion Remedies:**
  - **Uniform Relaxation:** Reduce bucket minimum for all 11 franchises equally.
  - **Scouting:** Sign external student at fixed 20 credits with Super Admin roll verification.
