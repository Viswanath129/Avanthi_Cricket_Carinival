# Codebase Survey & Architecture Investigation: JavaScript, State Management & Auction Business Logic

## 1. Observation

### 1.1 Source Files Examined & Codebase Locations
1. **`b:/projects/ACC/acc-auction-portal/shared/auctionRules.ts`** (Lines 1–52)
   - Contains pure TypeScript implementations of `bidIncrement(currentPrice)`, `maximumPermissibleBid(input)`, `isBucketEligible(input)`, `scarcityWarning(unsoldPlayers, teamsStillNeeding)`, and `canUndoSale(sale)`.
   - Lines 3–7:
     ```ts
     export function bidIncrement(currentPrice: number) {
       if (currentPrice < 100) return 10;
       if (currentPrice < 200) return 20;
       return 30;
     }
     ```
   - Lines 9–32:
     ```ts
     export function maximumPermissibleBid(input: {
       purse: number;
       playersBought: number;
       bucketCounts: BucketCounts;
       bucketMinimum?: number;
       minimumSquadSize?: number;
       minimumPrice?: number;
       lotBucketIndex?: number;
     }) {
       const bucketMinimum = input.bucketMinimum ?? 2;
       const minimumSquadSize = input.minimumSquadSize ?? 15;
       const minimumPrice = input.minimumPrice ?? 20;
       const mandatoryBefore = input.bucketCounts.reduce(
         (total, count) => total + Math.max(0, bucketMinimum - count),
         0,
       );
       const mandatoryAfterLot = Math.max(
         0,
         mandatoryBefore - (input.lotBucketIndex !== undefined && input.bucketCounts[input.lotBucketIndex] < bucketMinimum ? 1 : 0),
       );
       const regularSlotsAfterLot = Math.max(0, minimumSquadSize - (input.playersBought + 1));
       const reserve = Math.max(mandatoryAfterLot, regularSlotsAfterLot) * minimumPrice;
       return Math.max(0, input.purse - reserve);
     }
     ```
   - Lines 34–42:
     ```ts
     export function isBucketEligible(input: {
       slotsRemaining: number;
       mandatorySlotsRemaining: number;
       lotFulfillsMandatory: boolean;
     }) {
       const slotsAfterLot = Math.max(0, input.slotsRemaining - 1);
       const mandatoryAfterLot = Math.max(0, input.mandatorySlotsRemaining - (input.lotFulfillsMandatory ? 1 : 0));
       return mandatoryAfterLot <= slotsAfterLot;
     }
     ```
   - Lines 44–47:
     ```ts
     export function scarcityWarning(unsoldPlayers: number, teamsStillNeeding: number[]) {
       const totalPlayersNeeded = teamsStillNeeding.reduce((total, need) => total + Math.max(0, need), 0);
       return unsoldPlayers <= totalPlayersNeeded;
     }
     ```

2. **`b:/projects/ACC/acc-auction-portal/server/auction.rules.test.ts`** (Lines 1–42)
   - Unit tests validating authoritative auction math:
     - `maximumPermissibleBid({ purse: 1000, playersBought: 0, bucketCounts: [0, 0, 0, 0, 0] })` == `720` (Line 12)
     - `maximumPermissibleBid({ purse: 1000, playersBought: 14, bucketCounts: [2, 2, 2, 2, 2] })` == `1000` (Line 13)
     - `maximumPermissibleBid({ purse: 340, playersBought: 11, bucketCounts: [1, 1, 1, 1, 1], lotBucketIndex: 0 })` == `260` (Line 14)
     - `maximumPermissibleBid({ purse: 200, playersBought: 13, bucketCounts: [2, 2, 2, 2, 2] })` == `180` (Line 15)
     - `maximumPermissibleBid({ purse: 20, playersBought: 14, bucketCounts: [2, 2, 2, 2, 2] })` == `20` (Line 16)
     - `maximumPermissibleBid({ purse: 600, playersBought: 15, bucketCounts: [2, 2, 2, 2, 2] })` == `600` (Line 17)
     - `isBucketEligible({ slotsRemaining: 1, mandatorySlotsRemaining: 1, lotFulfillsMandatory: false })` == `false` (Line 21)
     - `isBucketEligible({ slotsRemaining: 3, mandatorySlotsRemaining: 2, lotFulfillsMandatory: false })` == `true` (Line 22)
     - `isBucketEligible({ slotsRemaining: 2, mandatorySlotsRemaining: 2, lotFulfillsMandatory: false })` == `false` (Line 23)
     - `isBucketEligible({ slotsRemaining: 1, mandatorySlotsRemaining: 1, lotFulfillsMandatory: true })` == `true` (Line 24)
     - `scarcityWarning(12, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])` == `false` (Line 28)
     - `scarcityWarning(11, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])` == `true` (Line 29)
     - `canUndoSale({ undoneAt: null })` == `true`, `canUndoSale({ undoneAt: 1727200000000 })` == `false` (Lines 38–39)

3. **`b:/projects/ACC/acc-auction-portal/client/src/pages/Home.tsx`** (2247 lines)
   - Comprehensive unminified React single-page application orchestrating state, sub-views, math engines, and modal controllers.
   - Lines 49–58: Franchise data interface:
     ```ts
     export interface Franchise {
       id: string;
       name: string;
       short: string;
       color: string;
       purse: number;
       squad: number; // current squad size
       buckets: Record<BucketKey, number>; // count acquired in each bucket
       status: "in-play" | "passed" | "blocked";
     }
     ```
   - Lines 60–74: Player data interface:
     ```ts
     export interface Player {
       id: string;
       lot: number;
       name: string;
       roll: string;
       branch: string;
       year: string;
       bucket: BucketKey;
       type: string;
       basePrice: number;
       stats: { runs: number; wickets: number; strikeRate: number; catches: number };
       image: string;
       cricHeroesStatus: "verified" | "pending";
       paid: boolean;
     }
     ```
   - Lines 76–94: BidRecord and SaleRecord interfaces.
   - Lines 213–266: `calculateMaxBid(purse, squadSize, buckets, targetBucket)` implementation with explicit Rule 12.2 eligibility checks.
   - Lines 269–345: `parseRollNumber(rollRaw)` implementation decoding B.Tech JNTU and Polytechnic Diploma student identifiers.
   - Lines 348–565: Main `Home()` state container with views `auction`, `projector`, `franchise`, `public`, `players`, `registration`.
   - Lines 796–1225: Sub-component `AdminControlRoom`.
   - Lines 1230–1460: Sub-component `StadiumProjectorDisplay`.
   - Lines 1465–1650: Sub-component `FranchiseBiddingInterface`.
   - Lines 1654–1772: Sub-component `PublicLiveView`.
   - Lines 1776–1904: Sub-component `PlayerBoardView`.
   - Lines 1908–2050: Sub-component `RegistrationRollParserView` with interactive 3-question skill matrix and derived player types.
   - Lines 2055–2141: Sub-component `ForensicUndoModal` with multi-lot rollback and immediate squad/purse restoration.
   - Lines 2146–2246: Sub-component `AcceptanceTestsModal` with Appendix A test fixtures.

4. **`b:/projects/ACC/Acc-Auction-Os.html`** and **`b:/projects/ACC/build_acc_os.py`** (Lines 873–2326)
   - Single standalone HTML artifact generated by Python builder script.
   - Lines 877–878: Branch and diploma code lookup dictionaries:
     ```js
     const BRANCH_CODES = {"02":"EEE","03":"ME","04":"ECE","05":"CSE","42":"CSM","44":"CSD"};
     const DIPLOMA_BRANCHES = {"CM":"CSE","EC":"ECE","EE":"EEE","M":"ME","CM2":"CSM"};
     ```
   - Lines 880–892: 11 Canonical tournament franchises:
     TITANS (`#059669`), WARRIORS (`#D97706`), ROYALS (`#E11D48`), STRIKERS (`#0284C7`), BLASTERS (`#7C3AED`), MAVERICKS (`#EA580C`), KNIGHTS (`#475569`), EAGLES (`#2563EB`), PANTHERS (`#C026D3`), VIKINGS (`#0D9488`), LEGENDS (`#CA8A04`).
   - Lines 894–905: 10 Seed player records (LOT 023–032) across buckets B1–B5.
   - Lines 955–1009: `parseRoll(roll, currentYY = 26)` function.
   - Lines 1012–1016: `getBidIncrement(price)` function (+10 below 100, +20 for 100–199, +30 for 200+).
   - Lines 1019–1029: `calculateMaxBid(franchise)` authoritative formula:
     ```js
     function calculateMaxBid(franchise) {
       let unmetBuckets = Object.keys(franchise.needed).reduce(
         (sum, b) => sum + Math.max(0, franchise.needed[b] - (franchise.buckets[b] || 0)), 
         0
       );
       let bought = franchise.bought;
       let slotsToFill = Math.max(15 - bought, unmetBuckets);
       if (slotsToFill <= 0) return franchise.purse;
       let reserve = (slotsToFill - 1) * 20;
       return Math.max(0, franchise.purse - reserve);
     }
     ```
   - Lines 1041–1048: `derivePlayerType(batting, bowling, fielding)`.
   - Lines 1053–1065: `showSpeeder(title, subtitle, durationMs)` Uiverse loader controller.
   - Lines 1070–1109: SVG circular countdown timer controller with danger pulse (<=5s) and warning (<=10s).
   - Lines 1114–1222: Auction loop: `placeBid()`, `passLot()`, `hammerSale()`, `skipLot()`, `advanceLot()`, `togglePause()`.
   - Lines 1227–1260: Forensic undo modal controller (`openUndoModal()`, `executeUndo()`).
   - Lines 1265–1295: `exportSquadsCSV()` and `exportAuditStream()`.
   - Lines 1299–1332: View switcher and `renderCurrentView()` router dispatching to 6 core views.
   - Lines 1337–2310: View render functions: `renderPublicView()`, `renderLiveAuctionView()`, `renderPlayerRegistrationView()`, `renderAdminConsoleView()`, `renderProjectorView()`.

5. **`b:/projects/ACC/component_extracted.js`** (66.6 KB)
   - Bundled React build artifact containing identical state machines and JSX layout structures matching `Home.tsx` and `Acc-Auction-Os.html`.

6. **`b:/projects/ACC/restored_html/`**
   - Individual page prototypes (`Admin.html`, `Franchise-Bidding.html`, `Franchise.html`, `Player-Registration.html`, `Projector.html`, `Public.html`).
   - `Admin.html` explicitly states: *"Timer expiry does NOT auto-sell. Hammer creates the sale."* (Lines 41, 78).

---

## 2. Logic Chain

### 2.1 State Management & Data Models
- **Franchise Model**: 11 teams are active in the league. Each franchise tracks `purse` (in credits), `bought` (count of players acquired, target minimum 15, maximum 22), `buckets` (tally of players in each bucket B1 to B5, where each bucket requires minimum 2 players), and `status` (`in-play`, `passed`, `blocked`, `scarcity warning`, `leading`).
- **Player Model**: Contains student metadata (`roll`, `program`, `branch`, `year`), assigned tournament `bucket` (`B1`–`B5`), player `type` (`BATTER`, `BOWLER`, `ALL-ROUNDER`, `WICKET-KEEPER`, `WICKET-KEEPER BATTER`, `FIELDER`), `basePrice` (minimum 20 credits, typically 30–100), verified cricket statistics (`matches`, `runs`, `wickets`, `strikeRate`, `catches`), and lifecycle status (`UNSOLD` vs `SOLD`).
- **Central Auction Ledger**:
  - `lotIndex`: Sequential pointer into player catalog.
  - `currentPrice`: Active price, starts at base price and advances strictly by bidding ladder increments.
  - `leadingBidderId`: Active highest bidder franchise.
  - `timerSeconds`: Countdown timer (initialized to 20s or 25s, resets to 15s or 20s on new bid).
  - `passedFranchises`: Set of teams that surrendered bidding rights on the active lot.
  - `bidHistory`: Stack of bids with timestamps, prices, and bidder identifiers.
  - `salesHistory` / `sold`: Stack of completed sales with lot number, player object, buyer, price, timestamp, and boolean `undone` flag.
  - `auditLog`: Comprehensive audit trail logging every action (`BID`, `PASS`, `HAMMER`, `SKIP`, `UNDO`, `STATE`).

### 2.2 Auction Engine Logic

#### 2.2.1 Roll Number Parser & Bucket Allocation Engine
- Operates autonomously without allowing user to manually manipulate academic standing or bucket:
  1. **Diploma Pattern (`YY597-BB-nnn`)**:
     - Regular expression: `/^(\d{2})597-([A-Z]+)-(\d{2,4})$/`.
     - Admission Year: `2000 + yy`.
     - Standing: `year = 2026 - (2000 + yy) + 1` = `26 - yy + 1` (clamped between 1 and 3).
     - Bucket: Invariably maps to **`B5`** (Polytechnic Diploma).
     - Branch mapping: `CM` → Computer Engg, `EC` → ECE, `EE` → EEE, `M` → Mechanical, `C` → Civil.
  2. **B.Tech Pattern (`YY811Abbnn` regular, `YY815Abbnn` lateral)**:
     - Regular expression: `/^(\d{2})81([15])A(\d{2})(\d+)$/` (or variant `/^(\d{2})8([15])1A(\d{2})(\d+)$/`).
     - Regular (`entryCode === "1"`): `year = 26 - yy + 1` (clamped 1 to 4).
     - Lateral (`entryCode === "5"`): Joins directly into 2nd year, so `year = 26 - yy + 2` (clamped 1 to 4).
     - Bucket: Maps directly to academic year: `1` → **`B1`**, `2` → **`B2`**, `3` → **`B3`**, `4` → **`B4`**.
     - Branch mapping: `01` Civil, `02` EEE, `03` ME, `04` ECE, `05` CSE, `12` IT, `42` CSM (AI/ML), `44` CSD (Data Science).
  3. **Freshers Reference Program Trigger**:
     - Flag `showReference = (yy === 26)` activates an additional qualification questionnaire section if admitted in the current year.

#### 2.2.2 Cricket Questionnaire Branching & Player Type Derivation
- Three primary inputs:
  1. `batting`: YES / NO. If YES, opens sub-branches for Style (Aggressive, Strike Rotator, Anchor), Order (Opener, Middle, Finisher), and Arm (Right/Left).
  2. `bowling`: YES / NO. If YES, opens sub-branches for Arm, Pace vs Spin, variations (Swing/Seam/Express vs Off-spin/Leg-spin/Orthodox), and tactical roles (Powerplay, Death, Economical).
  3. `wicketKeeping`: YES / NO. If NO, opens outfield zone and fielding positioning.
- Automatic Derivation Hierarchy:
  - `wicketKeeping === 'yes' && batting === 'yes'` → **`WICKET-KEEPER BATTER`**
  - `wicketKeeping === 'yes' && batting === 'no'` → **`WICKET-KEEPER`**
  - `batting === 'yes' && bowling === 'yes'` → **`ALL-ROUNDER`**
  - `batting === 'yes' && bowling === 'no'` → **`BATTER`**
  - `bowling === 'yes' && batting === 'no'` → **`BOWLER`**
  - Neither → **`FIELDER`** (with confirmation)

#### 2.2.3 Authoritative Maximum Bid & Bucket Reservation Formula
- Target minimum squad size: $S_{min} = 15$
- Mandatory minimum players per bucket: $B_{min} = 2$ across all 5 buckets ($B_1$ through $B_5$)
- Minimum reservation price: $P_{min} = 20$ credits
- Mathematical derivation:
  1. Let $b = \text{bought players}$. Remaining regular squad slots to fill = $\max(0, 15 - b)$.
  2. Let unmet mandatory bucket requirements = $U = \sum_{k \in \{B1..B5\}} \max(0, 2 - \text{count}[k])$.
  3. Total mandatory future slots = $\text{slotsToFill} = \max(15 - b, U)$.
  4. If squad is already complete ($\ge 15$) and all bucket minimums are satisfied ($U = 0$), then $\text{slotsToFill} \le 0 \implies \text{maxBid} = \text{purse}$.
  5. Otherwise, if acquiring the current lot, the franchise will still need to fill $(\text{slotsToFill} - 1)$ future slots, reserving $(\text{slotsToFill} - 1) \times 20$ credits:
     $$\text{reserve} = (\text{slotsToFill} - 1) \times 20$$
     $$\text{maxBid} = \max(0, \text{purse} - \text{reserve})$$
- **Rule 12.2 Bucket Eligibility Constraint**:
  If a franchise has only $R = 15 - b$ open slots remaining in its minimum 15-man squad, and $R \le U$, the franchise CANNOT bid on a bucket that has already met its minimum count ($\ge 2$). In `Home.tsx` and `auctionRules.ts`:
  ```ts
  if (remainingSquadSlotsTo15 <= unmetMandatorySlots && !isTargetNeeded) {
    return { maxBid: 0, isEligible: false, reason: "Bidding on non-mandatory bucket blocked" };
  }
  ```
  This guarantees that every remaining roster slot is preserved for unmet mandatory buckets.

#### 2.2.4 Incremental Bidding Ladder & Bid Processing
- Strict, non-negotiable tiered increments (no jump bidding):
  - Below 100 credits: **+10** credits
  - 100 to 199 credits: **+20** credits
  - 200+ credits: **+30** credits
- Bid acceptance conditions:
  - Auction state must be `LIVE` (not `PAUSED`).
  - Franchise must not be in `passedFranchises`.
  - Next bid $P_{next} = P_{current} + \Delta$ must satisfy $P_{next} \le \text{maxBid}$ and $P_{next} \le \text{purse}$.
  - Target bucket must be eligible under Rule 12.2.
- Upon valid bid:
  - `currentPrice` updated to $P_{next}$.
  - `leadingBidderId` updated to bidding franchise.
  - Timer reset to 15s (giving opponents a responsive window).
  - Transaction appended to `bidHistory` and `auditLog`.

#### 2.2.5 Timer Lifecycle & Auction Transitions
- 1-second countdown tick via `setInterval`.
- Visual cues:
  - $>10$s: Emerald (`#10b981`), normal progress.
  - $6$s–$10$s: Amber (`#ffd166`), warning state.
  - $\le 5$s: Rose/Red (`#ef4444` / `#E11D48`), urgent danger state with pulse animation.
- Critical tournament rule: **Timer expiration does NOT auto-hammer!**
  - When timer reaches 0, the clock halts and buzzer/alert sounds for the auctioneer.
  - The human auctioneer calls "going once, twice..." and must explicitly trigger `hammerSale()` (or `hammerUnsold()` / `skipLot()`).
- On Hammer Sale:
  - Deducts `currentPrice` from winner's purse.
  - Increments winner's `bought` squad count.
  - Increments winner's count for player's bucket.
  - Sets player status to `SOLD`, recording `soldTo` and `soldPrice`.
  - Displays speeder confirmation overlay.
  - Advances lot index to next available player and resets state for new lot.

#### 2.2.6 Forensic UNDO Reversion Mechanics
- Supports rolling back any completed sale in the ledger (up to 40 lots prior).
- Multi-step atomic reversion:
  1. Winning franchise purse refunded by sale amount: `purse += sale.amount`.
  2. Winning franchise squad count decremented: `bought = max(0, bought - 1)`.
  3. Winning franchise bucket tally decremented: `buckets[player.bucket] -= 1`.
  4. Player record restored to `UNSOLD`, clearing `soldTo` and `soldPrice`, returning player to active pool.
  5. Maximum permissible bids and scarcity indicators immediately recalculated across all 11 franchise nodes.
  6. Double-undo strictly prevented (`sale.undone = true`, cannot be undone twice).
  7. Mandatory reason recorded in audit log.

---

## 3. Caveats
1. **Acc-Auction-Os.html vs Home.tsx Rule 12.2 implementation**:
   In `Home.tsx` and `shared/auctionRules.ts`, `isBucketEligible` and `targetBucket` checks explicitly block bidding on already-met buckets when remaining slots equal unmet buckets. In `Acc-Auction-Os.html`, `calculateMaxBid(f)` computes the generic formula $(slotsToFill - 1) \times 20$ without passing the current lot's bucket index. In the redesigned `Acc-Auction-Os.html`, the full bucket eligibility guardrail from `Home.tsx` should be incorporated to guarantee 100% functional parity.
2. **Franchise Name Standardization**:
   `Home.tsx` used initial placeholder names (Aegis XI, Campus Kings, Coastal Chargers, etc.), whereas `Acc-Auction-Os.html` and `component_extracted.js` use the canonical tournament names (Titans, Warriors, Royals, Strikers, Blasters, Mavericks, Knights, Eagles, Panthers, Vikings, Legends). The redesign must strictly preserve the canonical 11 tournament franchises.
3. **Execution Environment**:
   `Acc-Auction-Os.html` is a zero-dependency standalone HTML file running entirely client-side, requiring no external build step or server runtime.

---

## 4. Conclusion
The JavaScript architecture across `Home.tsx`, `auctionRules.ts`, and `Acc-Auction-Os.html` forms a unified, robust auction operating system:
- **Data Models**: Cleanly capture the 11 tournament franchises, detailed player lots, live auction parameters, and forensic audit logs.
- **Engine Logic**: Adheres precisely to tournament specifications: deterministic roll code parsing (B.Tech & Diploma), branching cricket profile derivation, strict max-bid purse reservations ($\text{slotsToFill} = \max(15 - \text{bought}, \text{unmetBuckets})$), stepped bidding ladders (+10, +20, +30), human-controlled hammer finality, and multi-lot forensic undo.
- **View Presentation**: The 6 core views (Public Live, Franchise Terminal, Live Auction, Player Registration, Admin Console, Stadium Projector) deliver distinct, specialized interfaces for spectators, team bidders, auditorium projectors, and auction operators while maintaining shared live state.

---

## 5. Verification Method

### 5.1 Unit Test Execution
Execute the automated test suite in `b:/projects/ACC/acc-auction-portal`:
```powershell
cd b:/projects/ACC/acc-auction-portal
npm test -- --run
```
Expected output: 4 passing test suites verifying:
1. `maximumPermissibleBid` test fixtures (720, 1000, 260, 180, 20, 600).
2. `isBucketEligible` slot coverage logic.
3. `scarcityWarning` total demand calculations.
4. `bidIncrement` and `canUndoSale` double-undo prevention.

### 5.2 Source Code Cross-Verification
- Check `calculateMaxBid` in `Home.tsx:213–266` vs `Acc-Auction-Os.html:1019–1029`.
- Check `parseRollNumber` in `Home.tsx:269–345` vs `parseRoll` in `Acc-Auction-Os.html:955–1009`.
- Check `derivePlayerType` in `Home.tsx:1918–1929` vs `Acc-Auction-Os.html:1041–1048`.
- Check `ForensicUndoModal` in `Home.tsx:2055–2140` vs `Acc-Auction-Os.html:1233–1260`.
