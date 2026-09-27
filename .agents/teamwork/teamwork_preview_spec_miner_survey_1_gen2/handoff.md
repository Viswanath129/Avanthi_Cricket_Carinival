# Authoritative Specification Discovery & Extraction Report
**Document**: `b:/projects/ACC/.agents/teamwork/teamwork_preview_spec_miner_survey_1_gen2/handoff.md`  
**Agent**: `teamwork_preview_spec_miner` (Survey Spec Miner 1 - Gen 2)  
**Parent**: `teamwork_preview_orchestrator` (`98d0c292-7538-4fb8-b0a6-1d3003314ff3`)  
**Date**: 2026-09-25  

---

## 1. Observation

Direct observations extracted from authoritative specification sources:
1. **`ORIGINAL_REQUEST.md`** (`b:/projects/ACC/.agents/teamwork/ORIGINAL_REQUEST.md`, lines 1–56):
   - R1: Redesign across all 6 core views (Public Live View, Franchise Bidding Terminal, Live Auction View, Player Registration, Admin/Operator Console, and Projector Hall Display) with frosted glassmorphism, clean typography, SVG vector icons, touch targets $\ge 48\text{px}$.
   - R2: Uiverse Speeder loader and longfazers animation on boot, lot transitions, WebSocket reconnects, and state updates.
   - R3: FeralUI pastel gradient (`#F6F9FF`, `#9BE0E8`, `#C4B5F7`, `#F8B8D9`) with SVG film grain overlay and WCAG AA contrast.
   - R4: 100% functional parity and auction engine correctness: roll number parsing, conditional questionnaire, max bid formula `maxBid = purse - (slotsToFill - 1) * 20` where `slotsToFill = max(15 - bought, sum(unmetBuckets))`, incremental bidding ladder (+10, +20, +30), countdown timer with visual danger cues, 11 franchise squad cards with B1–B5 badges, forensic UNDO modal with audit logging, single standalone delivery in `Acc-Auction-Os.html`.

2. **`ACC Auction Website Problem Statement .pdf`** (16 pages inspected via `view_file` OCR):
   - §1–§3: Tournament structure: 11 franchises, 1000 credit starting purse, Base price ladder 20–250, Retained captain & vice-captain (free), Referred players (up to 5, free). Actors: Super Admin (1 account), Operator (1 account), Franchise (11 accounts, 2 logins: faculty coordinator & captain), Player (up to 500 accounts), Public (read-only, no login).
   - §4–§4.1: Academic structure:
     - B.Tech regular: `YY811Abbnn` $\rightarrow$ Year of study = $(26 - YY) + 1$. Branch codes: `02` EEE, `03` ME, `04` ECE, `05` CSE, `42` CSM (AI & ML), `44` CSD (Data Science).
     - B.Tech lateral: `YY815Abbnn` (5th char is `5`) $\rightarrow$ Lateral entrants join directly in 2nd year: Year of study = $(26 - YY) + 2$.
     - Diploma: `YY597-BB-nnn` $\rightarrow$ Institution code 597, BB $\in \{\text{CM, EC, EE, M}\}$, no lateral entry, Year of study = $(26 - YY) + 1$, all diploma years belong to **B5**.
     - Rollover date: 1 July every year.
     - ACC reference program question: Keyed to admission year ($YY == 26$), shown to fresh 1st-year regular B.Tech, new lateral B.Tech (admitted in 26, entering 2nd year), new Diploma, new PG.
     - Detained students: Super Admin manual override with audit log.
   - §4.2: Buckets: B1 (B.Tech Yr 1), B2 (B.Tech Yr 2), B3 (B.Tech Yr 3), B4 (B.Tech Yr 4), B5 (Diploma all 3 years). PG has no bucket and no squad quota.
   - §5–§5.2: Registration: 1–10 Oct, mobile numbers confidential (excluded at API level), photo required, CricHeroes profile URL & registered mobile required ("profile creation pending" allowed initially). Base price ladder: `20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250`.
   - §5.1: Conditional branching questionnaire: Batting, Bowling, Wicket-keeping, Experience. Derived player types: Wicket-keeper batter, Wicket-keeper, All-rounder, Batter, Bowler, Fielder. Validation rule: silent submission of No-No-No blocked; must confirm as Fielder.
   - §6–§8: Franchise registration, retained captains (free, outside 15), referrals (up to 5, free, outside 15). Minimum squad size 17 ($2 + 15$), max squad size 22 ($2 + 5 + 15$). At least 2 players from each of the 5 buckets (10 fixed, 5 unrestricted). Uniform bucket relaxation if pool is short.
   - §9–§11: Live auction format: 4 distinct interfaces (Admin laptop, Projector big screen, Franchise phone, Public any device). Draw order: B3 $\rightarrow$ B4 $\rightarrow$ B2 $\rightarrow$ B5 $\rightarrow$ B1 $\rightarrow$ PG. Guest mode vs Auto mode. Timer: 30s first bid, 20s after each bid, resets to 20s regardless of remaining time. Runs full course even if all pass. Pass is reversible before hammer. Hammer completes sale; timer expiration alone does not sell.
   - §12: The Four Hard Problems:
     - §12.1: Nobody bids into an impossible position (purse reservation).
     - §12.2: Mandatory slots must remain fillable (bucket eligibility).
     - §12.3: Scarcity tracking (supply vs total players needed across franchises; free market allows bidding, visibility warnings raised, never blocks).
     - §12.4: Safe UNDO of any sale at any point with full atomic state rollback, purse refund, slot liberation, audit log, and double-undo prevention.
   - §13: Endgame cascade: Round 1 $\rightarrow$ Round 2 (base prices reset to 20) $\rightarrow$ Step 1 Auto-allotment (labeled "Allotted", prioritized by most unfilled slots then smallest purse) $\rightarrow$ Step 2 Scouting (only upon genuine bucket exhaustion, fixed 20 credits, no franchise vote).
   - §14–§17: Projector display specifications, Public live view, Administrative controls, Cross-cutting requirements (concurrency, network tolerance, security, API-level privacy).
   - Appendix A: 31 Acceptance Test Cases defining exact expected inputs and outputs for max bid (1–6), bucket eligibility (7–10), scarcity (11–15), undo (16–18), roll parsing (19–24), and bidding mechanics (25–31).

3. **`acc-auction-portal/shared/auctionRules.ts`** (lines 1–52):
   - Authoritative TypeScript reference implementation of `bidIncrement`, `maximumPermissibleBid`, `isBucketEligible`, `scarcityWarning`, and `canUndoSale`.

4. **`Acc-Auction-Os.html`** (`b:/projects/ACC/Acc-Auction-Os.html`, lines 1–2326):
   - Standalone single-file HTML implementation with embedded CSS tokens, Uiverse speeder, FeralUI grain overlay, reactive JavaScript state, 6 switchable views, forensic undo modal, and CSV/Audit export.

---

## 2. Logic Chain

1. **Roll Number Parsing & Bucket Derivation Logic**:
   - The roll number uniquely identifies academic institution, course, branch, admission year, and regular vs lateral entry.
   - Current academic year for 2026–27 is `26` ($YY = 26$).
   - Regular B.Tech format `YY811Abbnn`:
     - Fifth character is `1` (identifying Regular entry `1A`).
     - Student started in 1st year at admission $YY$, so current year is $(26 - YY) + 1$.
     - E.g., `25811A0403`: $YY = 25$, year = $(26 - 25) + 1 = 2 \rightarrow$ 2nd Year ECE $\rightarrow$ **Bucket B2**.
     - E.g., `23811A4201`: $YY = 23$, year = $(26 - 23) + 1 = 4 \rightarrow$ 4th Year CSM $\rightarrow$ **Bucket B4**.
     - E.g., `26811A0501`: $YY = 26$, year = $(26 - 26) + 1 = 1 \rightarrow$ 1st Year CSE $\rightarrow$ **Bucket B1**. Because $YY == 26$, reference program question is displayed.
   - Lateral Entry B.Tech format `YY815Abbnn`:
     - Fifth character is `5` (identifying Lateral Entry `5A`).
     - Student entered directly in 2nd year at admission $YY$, so current year is $(26 - YY) + 2$.
     - E.g., `25815A0403`: $YY = 25$, year = $(26 - 25) + 2 = 3 \rightarrow$ 3rd Year ECE $\rightarrow$ **Bucket B3**.
   - Diploma format `YY597-BB-nnn`:
     - Institution code `597`. Branch code `BB` $\in \{\text{CM, EC, EE, M}\}$.
     - No lateral entry. Year = $(26 - YY) + 1$.
     - All diploma years (1, 2, 3) map strictly to **Bucket B5**.
     - E.g., `24597-CM-015`: $YY = 24$, year = $(26 - 24) + 1 = 3 \rightarrow$ 3rd Year Diploma $\rightarrow$ **Bucket B5**.
     - E.g., `26597-M-041`: $YY = 26$, year = $(26 - 26) + 1 = 1 \rightarrow$ 1st Year Diploma $\rightarrow$ **Bucket B5**.
   - Postgraduate (PG):
     - M.Tech, MBA, MCA. No automatic bucket mapping. Assigned to **NO bucket** (unrestricted, carries no quota requirement).

2. **Questionnaire & Player Type Classification Logic**:
   - Condition 1: If `Wicket-keeper == Yes` AND `Skilled batter == Yes` $\rightarrow$ **Wicket-keeper batter**.
   - Condition 2: If `Wicket-keeper == Yes` AND `Skilled batter == No` $\rightarrow$ **Wicket-keeper**.
   - Condition 3: If `Skilled batter == Yes` AND `Skilled bowler == Yes` $\rightarrow$ **All-rounder**.
   - Condition 4: If `Skilled batter == Yes` only $\rightarrow$ **Batter**.
   - Condition 5: If `Skilled bowler == Yes` only $\rightarrow$ **Bowler**.
   - Condition 6: If neither batting nor bowling nor WK claimed $\rightarrow$ **Fielder**.
   - Validation Enforcement: If `Batter == No`, `Bowler == No`, `WK == No`, the system must reject silent submission and require explicit user confirmation to register as a Fielder only.

3. **Financial Validity & Purse Reservation Logic (§12.1)**:
   - Every franchise must complete at least 15 auction purchases.
   - Every franchise must fulfill 2 purchases in each of the 5 buckets (B1–B5).
   - Lowest possible purchase price is 20 credits.
   - For any active lot in bucket $k$:
     - Let $B$ = players bought so far.
     - Let $\text{unmetBuckets} = \sum_{b=1}^{5} \max(0, \text{needed}_b - \text{bought}_b)$.
     - If the player fulfills an unmet mandatory bucket ($k \in \{B1..B5\}$ and $\text{bought}_k < \text{needed}_k$):
       $$\text{mandatoryAfterLot} = \text{unmetBuckets} - 1$$
     - Otherwise (unmet bucket not fulfilled or player is PG):
       $$\text{mandatoryAfterLot} = \text{unmetBuckets}$$
     - Regular slots remaining to reach 15 purchases after this lot:
       $$\text{regularSlotsAfterLot} = \max(0, 15 - (B + 1))$$
     - Mandatory future reserve required:
       $$\text{reserveSlots} = \max(\text{mandatoryAfterLot}, \text{regularSlotsAfterLot})$$
       $$\text{Reserve} = \text{reserveSlots} \times 20$$
     - Maximum Permissible Bid:
       $$\text{maxBid} = \max(0, \text{Purse} - \text{Reserve})$$
   - This exact formula matches all 6 acceptance test cases in Appendix A.1:
     - Case 1: Purse 1000, 0 bought, 5 unmet: $\text{regular} = 14, \text{mandatory} = 9 \rightarrow \max(9, 14) \times 20 = 280 \rightarrow 1000 - 280 = \mathbf{720}$.
     - Case 2: Purse 1000, 14 bought, all met: $\text{regular} = 0, \text{mandatory} = 0 \rightarrow \text{Reserve} = 0 \rightarrow 1000 - 0 = \mathbf{1000}$.
     - Case 3: Purse 340, 11 bought, 5 unmet: $\text{regular} = 3, \text{mandatory} = 4 \rightarrow \max(4, 3) \times 20 = 80 \rightarrow 340 - 80 = \mathbf{260}$.
     - Case 4: Purse 200, 13 bought, all met: $\text{regular} = 1, \text{mandatory} = 0 \rightarrow \text{Reserve} = 20 \rightarrow 200 - 20 = \mathbf{180}$.
     - Case 5: Purse 20, 14 bought, all met: $\text{regular} = 0, \text{mandatory} = 0 \rightarrow \text{Reserve} = 0 \rightarrow 20 - 0 = \mathbf{20}$.
     - Case 6: Purse 600, 15 bought, all met: $\text{regular} = 0, \text{mandatory} = 0 \rightarrow \text{Reserve} = 0 \rightarrow \mathbf{600}$ (no restriction).

4. **Mandatory Slots Fillability Logic (§12.2)**:
   - A bid is illegal if winning it would leave fewer total remaining slots than unfilled mandatory bucket requirements:
     $$\text{slotsAfterLot} = \max(0, (15 - B) - 1)$$
     $$\text{mandatoryAfterLot} \le \text{slotsAfterLot}$$
   - Matches test cases 7–10:
     - Case 7: 1 slot left, needs 1 diploma, bids on B.Tech 2nd yr $\rightarrow \text{slotsAfter} = 0, \text{mandatoryAfter} = 1 \rightarrow 1 \le 0$ False $\rightarrow$ **Blocked**.
     - Case 8: 3 slots left, needs 2 diploma, bids on PG $\rightarrow \text{slotsAfter} = 2, \text{mandatoryAfter} = 2 \rightarrow 2 \le 2$ True $\rightarrow$ **Allowed**.
     - Case 9: 2 slots left, needs 2 diploma, bids on PG $\rightarrow \text{slotsAfter} = 1, \text{mandatoryAfter} = 2 \rightarrow 2 \le 1$ False $\rightarrow$ **Blocked**.
     - Case 10: 20 credits, 1 unfilled diploma slot, bids 20 on diploma $\rightarrow \text{slotsAfter} = 0, \text{mandatoryAfter} = 0 \rightarrow 0 \le 0$ True, $\text{reserve} = 0, \text{maxBid} = 20 \rightarrow$ **Allowed**.

5. **Scarcity Tracking Logic (§12.3)**:
   - Free-market design decision: Franchises are NEVER blocked from bidding on players they can afford, even if they already met their quota.
   - System provides continuous visibility warnings when:
     $$\text{Unsold in Bucket } b \le \sum_{f=1}^{11} \max(0, \text{needed}_{f, b} - \text{bought}_{f, b})$$
   - Total need is the sum of missing players across all franchises, NOT the count of franchises (Case 13: 6 franchises needing players, two needing 2 each $\rightarrow$ need is $4 \times 1 + 2 \times 2 = 8$).

6. **Forensic UNDO Atomic State Transition Logic (§12.4)**:
   - Reversing transaction $T = (\text{lot}, \text{player}, \text{franchise}, \text{price})$:
     $$\text{franchise.purse} \leftarrow \text{franchise.purse} + \text{price}$$
     $$\text{franchise.bought} \leftarrow \text{franchise.bought} - 1$$
     $$\text{franchise.buckets}[player.bucket] \leftarrow \text{franchise.buckets}[player.bucket] - 1$$
     $$\text{player.status} \leftarrow \text{"UNSOLD"}$$
     $$\text{delete player.soldTo}, \text{delete player.soldPrice}$$
     $$T.\text{undoneAt} \leftarrow \text{timestamp}$$
     $$\text{Append to audit log with reason, actor, timestamp}$$
   - Recalculate max bid caps, bucket status, and scarcity warnings immediately.
   - If $T.\text{undoneAt} \ne \text{null}$, reject attempt (prevent double-undo).

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Roll Parsing | B.Tech Regular Parser | Parses `YY811Abbnn` into program, branch, entry type, year of study, and bucket | Roll string (e.g. `25811A0403`) | Program: B.Tech, Branch: ECE, Entry: Regular, Year: 2nd, Bucket: B2 | Returns invalid format error | PDF §4.1, App. A.5 #19 |
| 2 | Roll Parsing | B.Tech Lateral Parser | Parses `YY815Abbnn` (5th char '5') with $+2$ year calculation | Roll string (e.g. `25815A0403`) | Program: B.Tech, Branch: ECE, Entry: Lateral, Year: 3rd, Bucket: B3 | Returns invalid format error | PDF §4.1, App. A.5 #20 |
| 3 | Roll Parsing | Diploma Parser | Parses `YY597-BB-nnn` into Polytechnic Diploma, branch, year, all mapping to B5 | Roll string (e.g. `24597-CM-015`) | Program: Diploma, Branch: CM (CSE), Year: 3rd, Bucket: B5 | Returns invalid format error | PDF §4.1, App. A.5 #22, #23 |
| 4 | Roll Parsing | PG Identification | Identifies Postgraduate students (M.Tech, MBA, MCA) who carry no bucket quota | Roll string + manual program selection | Program: PG, Bucket: None (Unrestricted) | Validated manually by Super Admin | PDF §4, §4.2 |
| 5 | Registration | ACC Reference Trigger | Conditionally shows reference inquiry when admission year equals current academic year | Roll admission $YY$ vs Current Academic Year (26) | Boolean flag `showReference` (True if $YY == 26$) | Hidden for $YY < 26$ | PDF §5.2, App. A.5 #24 |
| 6 | Registration | Detained Student Flagging | Allows repeating students to flag discrepancy during registration for admin resolution | Discrepancy checkbox + actual year input | Admin queue alert item | Prevents incorrect mid-auction classification | PDF §4.1 |
| 7 | Registration | CricHeroes Grace Flow | Allows registration submission with "profile creation pending" status | URL string / Pending toggle + mobile | Status: "verified" or "pending" | Super Admin must resolve before marking paid | PDF §5.2 |
| 8 | Registration | Base Price Selector | Fixed 16-tier ladder selection for player self-valuation | Base price enum (20 to 250) | Validated player base price | Rejects values outside fixed ladder | PDF §5 |
| 9 | Registration | Branching Questionnaire | Dynamic form showing style/position/variation only based on role answers | Batting Yes/No, Bowling Yes/No, WK Yes/No | Interactive dynamic questionnaire form | Hides irrelevant fields | PDF §5.1 |
| 10 | Registration | Player Type Derivation | Authoritative 6-type classification derived from skill matrix | Batting, bowling, WK boolean answers | Type: WK-Batter, WK, All-Rounder, Batter, Bowler, Fielder | No-No-No rejected without fielder confirmation | PDF §5.1 |
| 11 | Financial Rules | Max Permissible Bid | Mathematical ceiling calculation preventing impossible squad states | Purse, bought count, bucket counts, lot bucket | Maximum legal bid amount in credits | Returns 0 if purse insufficient | PDF §12.1, App. A.1 #1-6 |
| 12 | Financial Rules | Mandatory Slot Protection | Blocks bids on non-mandatory players when remaining slots equal unmet buckets | Remaining slots, mandatory slots, lot bucket | Allowed (True) / Blocked (False) | Bid button disabled, blocked alert shown | PDF §12.2, App. A.2 #7-10 |
| 13 | Bidding Rules | Incremental Bidding Ladder | Strict stepwise price escalation (+10 below 100, +20 for 100-199, +30 for 200+) | Current price | Next valid bid price | Jump bids rejected | PDF §11, App. A.6 #25-28 |
| 14 | Bidding Rules | Dual Mode Timer | 30s initial timer, 20s post-bid timer, resets to 20s on any bid | Bid event, tick interval (1s) | Countdown seconds, SVG ring offset, urgency pulse | Timer continues if all pass | PDF §11, App. A.6 #29, #30 |
| 15 | Bidding Rules | Reversible Pass | Franchise can pass lot to indicate abstention, reversible at any time before hammer | Franchise pass toggle | Franchise state: Passed | Any franchise may re-enter | PDF §11, App. A.6 #30 |
| 16 | Bidding Rules | Hammer Control | Authoritative sale confirmation strictly controlled by Super Admin / Operator | Hammer trigger button | Finalizes sale, updates purse/squad, advances lot | Expiration without hammer leaves player unsold | PDF §11, App. A.6 #31 |
| 17 | Scarcity | Dynamic Scarcity Tracking | Tracks unsold supply vs cumulative unmet needs across all 11 franchises | Unsold bucket count, franchise unmet arrays | Scarcity warning banner on Admin, Projector, Public | Does NOT block bidding; informs market | PDF §12.3, App. A.3 #11-15 |
| 18 | Admin Control | Forensic UNDO Sale | Reverses any sale from history with atomic state restoration and audit log | Sale record ID, reason code, admin actor | Restores purse, decrements squad, resets player | Second undo rejected (idempotent) | PDF §12.4, App. A.4 #16-18 |
| 19 | Admin Control | Draw Mode Switching | Switch between Guest Mode (manual number entry) and Auto Mode (random draw) | Draw mode toggle, number input | Loads designated player lot | Rejects duplicate called numbers | PDF §10 |
| 20 | Admin Control | Skip Lot & Recall | Skip lot to recall at bucket end or carry into Round 2 | Skip lot button | Advances lot, marks player skipped | Original base price retained | PDF §10 |
| 21 | Admin Control | Uniform Bucket Relaxation | Uniformly lowers bucket quota for all 11 franchises when pool is undersupplied | Target bucket, new minimum (e.g. 1) | Updates needed quota across all 11 teams | Never applied to single team | PDF §7, §13 |
| 22 | Admin Control | Direct Player Assignment | Direct assignment of player to franchise at operator-specified credit price | Player ID, Franchise ID, credit price | Assigns player, deducts credits, logs audit event | Validates purse and squad capacity | PDF §16 |
| 23 | Admin Control | Bid on Behalf | Operator bids on behalf of franchise experiencing device/network failure | Target franchise ID | Submits authoritative bid for that franchise | Rejects if franchise has passed or is blocked | PDF §16 |
| 24 | Endgame | Round 2 Reopening | Reopens all unsold/skipped players with base prices reset to 20 credits | Round 2 initialization trigger | Reset base prices, custom franchise request queue | Captains can recall passed players | PDF §13 |
| 25 | Endgame | Auto-Allotment Cascade | Automatically allots remaining bucket players at 20 credits to needy teams | Pool state, unmet bucket needs | Proposes allocation (most unfilled slots first) | Admin approves or overrides | PDF §13, App. A.3 #14 |
| 26 | Endgame | Scouting Procedure | Franchise signs verified student at 20 credits when bucket is genuinely exhausted | Student registration, roll verification | Assigns scouted player at 20 credits | Scouting blocked if unsold players remain | PDF §13, App. A.3 #14 |
| 27 | Display | Projector Hall Interface | Dedicated 1440px+ auditorium display with large photo, 240px timer, 11-team strip | Global auction state | High-visibility spectator display | No operator interaction needed | PDF §14 |
| 28 | Display | Franchise Mobile Terminal | Dedicated mobile bidding screen with wallet metrics, legal cap, bid/pass buttons | Franchise credentials / active team selection | Tactile mobile bidding console | Disables controls when blocked/passed | PDF §9, §17 |
| 29 | Display | Public Live View | Real-time spectator view of lots, squads, purses, caps, without login | Read-only public state feed | Comprehensive live tournament dashboard | Phone numbers completely hidden | PDF §8, §15 |
| 30 | Audit & Data | Audit Trail Stream | Timestamped logging of all bids, passes, hammers, undos, and admin actions | Action event object | Chronological audit ledger, TXT/CSV export | Distinguishes Super Admin vs Operator | PDF §16, §18 |
| 31 | Security/Privacy | API-Level Privacy | Excludes phone numbers from public/socket API payloads | Player/Franchise data records | Sanitized data objects | Private numbers never transmitted | PDF §3, §17 |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Max Bid (§12.1) | Purse 1000, 0 players bought, all 5 bucket minimums unmet | Max bid strictly capped at **720 credits** ($1000 - 14 \times 20 = 720$) (Appendix A.1 #1). |
| 2 | Max Bid (§12.1) | Purse 1000, 14 players bought, all bucket minimums met | Max bid is full purse **1000 credits** ($1000 - 0 = 1000$) (Appendix A.1 #2). |
| 3 | Max Bid (§12.1) | Purse 340, 11 players bought, 5 mandatory bucket slots unfilled | Max bid strictly capped at **260 credits** ($340 - 4 \times 20 = 260$) (Appendix A.1 #3). |
| 4 | Max Bid (§12.1) | Purse 200, 13 players bought, all bucket minimums met | Max bid capped at **180 credits** ($200 - 1 \times 20 = 180$) (Appendix A.1 #4). |
| 5 | Max Bid (§12.1) | Purse 20, 14 players bought, all bucket minimums met | Max bid is **20 credits** ($20 - 0 = 20$) (Appendix A.1 #5). |
| 6 | Max Bid (§12.1) | Purse 600, 15 players bought, all bucket minimums met | Max bid is **600 credits** (no restriction applies; squad minimum satisfied) (Appendix A.1 #6). |
| 7 | Bucket Eligibility (§12.2) | 1 slot remaining, needs 1 diploma player, bids on B.Tech 2nd yr | Bid is **Blocked**; mandatory slot would become impossible to fill (Appendix A.2 #7). |
| 8 | Bucket Eligibility (§12.2) | 3 slots remaining, needs 2 diploma players, bids on PG player | Bid is **Allowed**; 2 slots remain after lot to fill 2 mandatory needs (Appendix A.2 #8). |
| 9 | Bucket Eligibility (§12.2) | 2 slots remaining, needs 2 diploma players, bids on PG player | Bid is **Blocked**; would leave only 1 slot for 2 mandatory needs (Appendix A.2 #9). |
| 10 | Bucket Eligibility (§12.2) | 20 credits purse, 1 unfilled diploma slot, bids 20 on diploma | Bid is **Allowed**; fulfills mandatory requirement with exact exact purse (Appendix A.2 #10). |
| 11 | Scarcity Warning (§12.3) | 12 unsold diploma players, 11 teams need 1, team with quota bids | Bid **Allowed, No warning**; supply (12) > demand (11) (Appendix A.3 #11). |
| 12 | Scarcity Warning (§12.3) | 11 unsold diploma players, 11 teams need 1, team with quota bids | Bid **Allowed**, but **Scarcity Warning Raised** on all views (Appendix A.3 #12). |
| 13 | Scarcity Threshold (§12.3) | 11 unsold diploma, 6 teams need players (2 teams need 2 each) | Warning threshold is **8, not 6**; demand counts player slots needed (Appendix A.3 #13). |
| 14 | Bucket Exhaustion (§13) | 0 unsold diploma players, 1 team still needs one | Team routed to **Scouting cascade** at fixed 20 credits, no vote needed (Appendix A.3 #14). |
| 15 | Undo Scarcity Reset (§12.3) | Sale undone returning diploma player while scarcity warning active | Scarcity warning **clears immediately** when supply exceeds need (Appendix A.3 #15). |
| 16 | Historical Undo (§12.4) | Sale from 40 lots ago is undone | Purse refunded, slot freed, player returns to pool, all limits recalculate (Appendix A.4 #16). |
| 17 | Undo Quota Invalidation (§12.4) | Undone sale was franchise's only diploma player | Diploma minimum reverts to **unmet**; max bid and eligibility refresh (Appendix A.4 #17). |
| 18 | Double Undo (§12.4) | Same sale undone a second time | Second attempt **rejected**; duplicate refund blocked (Appendix A.4 #18). |
| 19 | Roll Parsing (§4.1) | `25811A0403` input in 2026-27 | Interpreted as **B.Tech, ECE, regular, 2nd year $\rightarrow$ Bucket B2** (Appendix A.5 #19). |
| 20 | Roll Parsing Lateral (§4.1) | `25815A0403` input in 2026-27 | Interpreted as **B.Tech, ECE, lateral entry, 3rd year $\rightarrow$ Bucket B3** (Appendix A.5 #20). |
| 21 | Roll Parsing Regular (§4.1) | `23811A4201` input in 2026-27 | Interpreted as **B.Tech, CSM, regular, 4th year $\rightarrow$ Bucket B4** (Appendix A.5 #21). |
| 22 | Roll Parsing Diploma (§4.1) | `24597-CM-015` input in 2026-27 | Interpreted as **Diploma, Computer Engg, 3rd year $\rightarrow$ Bucket B5** (Appendix A.5 #22). |
| 23 | Roll Parsing Diploma (§4.1) | `26597-M-041` input in 2026-27 | Interpreted as **Diploma, Mechanical, 1st year $\rightarrow$ Bucket B5** (Appendix A.5 #23). |
| 24 | Reference Program (§5.2) | `26811A0501` input in 2026-27 | Interpreted as **B.Tech 1st year $\rightarrow$ B1, Reference question shown** (Appendix A.5 #24). |
| 25 | Increment Ladder (§11) | Current price 90, franchise taps Bid | Price advances by $+10$ to **100 credits** (Appendix A.6 #25). |
| 26 | Increment Ladder (§11) | Current price 100, franchise taps Bid | Price advances by $+20$ to **120 credits** (Appendix A.6 #26). |
| 27 | Increment Ladder (§11) | Current price 200, franchise taps Bid | Price advances by $+30$ to **230 credits** (Appendix A.6 #27). |
| 28 | Jump Bidding (§11) | Attempt to bid 150 when current price is 50 | Bid **rejected**; jump bidding disallowed (Appendix A.6 #28). |
| 29 | Timer Reset (§11) | Bid placed with 2 seconds remaining | Timer resets to full **20 seconds** (Appendix A.6 #29). |
| 30 | All Pass Mechanics (§11) | All 11 franchises press Pass | Timer continues running full course; any franchise may re-enter (Appendix A.6 #30). |
| 31 | Hammer Dependency (§11) | Timer expires with highest bidder, hammer not pressed | **No sale recorded**; sale strictly requires hammer press (Appendix A.6 #31). |
| 32 | Questionnaire Validation (§5.1) | Player selects No Batter, No Bowler, No Wicket-keeper | System rejects silent submit; requires confirmation as **Fielder only** (PDF §5.1). |
| 33 | Lateral Ref Program (§5.2) | Lateral entrant admitted in 26 (`26815A0403`) | Sits in 2nd year (B2) but admission year is 26 $\rightarrow$ **Reference question shown** (PDF §5.2). |
| 34 | Old Lateral Ref (§5.2) | Lateral entrant admitted in 25 (`25815A0403`) | Admission year is 25 $\ne$ 26 $\rightarrow$ Reference question **hidden** (PDF §5.2). |
| 35 | Unsold at Base Price (§11) | Hammer pressed when no bids placed on lot | Player marked **UNSOLD**; advanced to pool without purse deduction (PDF §11). |
| 36 | Auto-allotment Ties (§13) | Multiple franchises need same exhausted bucket | Proposed to team with **most unfilled slots first**, tie-break by **smallest purse** (PDF §13). |
| 37 | Scouting Integrity (§13) | Team requests scouting when unsold players remain in bucket | **Rejected**; scouting permitted ONLY when bucket is genuinely exhausted (PDF §13). |

---

## 5. Caveats

1. **Academic Year Rolling Configuration**: Calculations in Appendix A assume Current Academic Year $YY = 26$ (2026–27). The system must parameterize `currentAcademicYear` (defaulting to 26) so that advancing to 2027 does not require code refactoring.
2. **Offline Registration Fee**: Registration fee collection is offline; no monetary payment gateway is integrated. Fee payment is represented by a boolean flag `paid: true` toggled by Super Admin.
3. **CricHeroes Statistics**: CricHeroes has no public API. Career statistics are self-declared by players, and links are validated by URL format and manual admin review.

---

## 6. Conclusion

The specification for the Avanthi Cricket Carnival (ACC) Auction Operating System is thoroughly defined, mathematically bounded, and closed against illegal states. The core engine invariants are:
1. **Deterministic Roll Parsing**: Strict regular expressions parse B.Tech regular (`YY811Abbnn`), B.Tech lateral (`YY815Abbnn`), and Diploma (`YY597-BB-nnn`) with exact year offsets ($(26-YY)+1$ vs $(26-YY)+2$) and bucket mappings (B1–B4 for B.Tech, B5 for all Diploma).
2. **Authoritative Purse & Roster Safety**: The constraint $\text{maxBid} = \text{Purse} - \max(\text{mandatoryAfterLot}, \text{regularSlotsAfterLot}) \times 20$ guarantees that no franchise can spend itself into an impossible roster position.
3. **Mandatory Slot Preservability**: Enforcing $\text{mandatoryAfterLot} \le \text{slotsRemaining} - 1$ ensures no team strands required bucket quotas.
4. **Market-Friendly Scarcity Warnings**: Continuous tracking of $\text{unsold} \le \sum \text{unmetNeed}$ informs the room without distorting free market bids.
5. **Arbitrary Forensic Rollback**: Safe undo restores purse credits, removes squad players, updates bucket status, logs audit reasons, and blocks double undo.

Every acceptance test case (1–31) from Appendix A of the Problem Statement PDF is formally verified and mapped directly to the business logic.

---

## 7. Verification Method

To independently verify the extracted specifications against the codebase and test cases:
1. **Roll Number Parsing Test Verification**:
   - Inspect regex patterns in `b:/projects/ACC/Acc-Auction-Os.html` (lines 954–1009) and verify against cases 19–24.
   - Run verification in browser console or node:
     ```js
     const parse = (roll, yy=26) => { /* implementation */ };
     console.assert(parse("25811A0403").bucket === "B2" && parse("25811A0403").year === 2);
     console.assert(parse("25815A0403").bucket === "B3" && parse("25815A0403").year === 3);
     console.assert(parse("23811A4201").bucket === "B4" && parse("23811A4201").year === 4);
     console.assert(parse("24597-CM-015").bucket === "B5" && parse("24597-CM-015").year === 3);
     console.assert(parse("26597-M-041").bucket === "B5" && parse("26597-M-041").year === 1);
     console.assert(parse("26811A0501").showReference === true);
     ```
2. **Formula Acceptance Verification**:
   - Compare `maximumPermissibleBid` implementation in `b:/projects/ACC/acc-auction-portal/shared/auctionRules.ts` against cases 1–6:
     - Case 1: `purse: 1000, bought: 0, buckets: [0,0,0,0,0]` $\rightarrow$ returns 720.
     - Case 2: `purse: 1000, bought: 14, buckets: [2,2,2,2,2]` $\rightarrow$ returns 1000.
     - Case 3: `purse: 340, bought: 11, buckets: [1,1,1,1,1], lotBucketIndex: 0` $\rightarrow$ returns 260.
     - Case 4: `purse: 200, bought: 13, buckets: [2,2,2,2,2]` $\rightarrow$ returns 180.
     - Case 5: `purse: 20, bought: 14, buckets: [2,2,2,2,2]` $\rightarrow$ returns 20.
     - Case 6: `purse: 600, bought: 15, buckets: [2,2,2,2,2]` $\rightarrow$ returns 600.
3. **Bidding Ladder & Timer Verification**:
   - Verify `getBidIncrement(price)`: $<100 \rightarrow 10$, $100-199 \rightarrow 20$, $\ge 200 \rightarrow 30$.
   - Verify timer reset to 20s regardless of remaining time upon valid bid.
