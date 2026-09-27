# Project: Avanthi Cricket Carnival (ACC) Auction Operating System Redesign

## Architecture
- **Delivery Model**: Standalone, fully self-contained single-file HTML/CSS/JavaScript application (`b:/projects/ACC/Acc-Auction-Os.html`). Zero external broken dependencies; runs offline with native `BroadcastChannel` local multi-tab sync, system font stack fallbacks, and embedded SVG vector assets.
- **Design System**: FeralUI Multi-Color Pastel Grain Gradient (`#F6F9FF` Misted Sky, `#9BE0E8` Rain Indigo, `#C4B5F7` Lavender, `#F8B8D9` Lilac Paper) with inline SVG turbulence grain filter, paired with Frosted Glassmorphism (`backdrop-filter: blur(24px)`, semi-translucent cards `rgba(255,255,255,0.72-0.88)`), dark high-contrast typography (`#0F172A`, WCAG AA compliant), and Uiverse Speeder loading animation overlay (zero layout shift, CLS = 0).
- **Core Views (6 Views)**:
  1. `public`: Public Live View (spectator dashboard, catalog, squad status matrix).
  2. `live`: Live Auction View (stage, circular SVG countdown ring, active lot, bid/pass controls).
  3. `franchise`: Franchise Bidding Terminal (mobile-first captain bidding console, purse calculator, legal max bid cap).
  4. `player`: Player Registration Portal (roll parser, conditional cricket questionnaire, auto player type, CricHeroes link, private phone, registration review modal).
  5. `admin`: Admin/Operator Console (auctioneer controls: Start, Pause/Resume, Skip, Hammer with confirmation modal, Forensic Undo with audit logging, CSV & TXT audit export).
  6. `projector`: Projector Hall Display (1440px+ auditorium display, dark `#0B0F19` aesthetic, 380px photo, 220px SVG countdown ring, massive bid typography, 11-franchise bottom strip).
- **Auction Engine & Data Flow**:
  - Global Reactive State (`franchises` [11 teams], `players` [lots], `auction` [currentLot, currentPrice, currentBidder, timer, passedTeams, phase], `salesHistory`, `auditLog`).
  - Strict mathematical bidding rules, deterministic roll number parsing, conditional player type derivation, dynamic scarcity tracking, and atomic undo state rollback.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FeralUI Pastel Glass Background | 5-layer radial gradient blend with inline SVG turbulence grain overlay | M1 | ORIGINAL_REQUEST §R3 |
| 2 | Frosted Glassmorphism Cards | `backdrop-filter: blur(24px)`, translucent fills, crisp borders, WCAG AA contrast | M1 | ORIGINAL_REQUEST §R3 |
| 3 | Typography Hierarchy & System Fallback | Inter / Space Grotesk / Plus Jakarta Sans / JetBrains Mono with system fallbacks | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Uiverse Speeder Loading Overlay | Fullscreen speeder + longfazers animation for boot, view change, lot transition | M1 | ORIGINAL_REQUEST §R2 |
| 5 | Ergonomic Touch Targets | Minimum 48px x 48px touch targets on all buttons, tabs, inputs, and triggers | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Public Live View | Spectator board with live lot spotlight, search, bucket tabs (ALL, B1-B5), squad matrix | M2 | Survey Explorer 2 |
| 7 | Live Auction View | Floor stage with 200x230 photo, big bid display, circular SVG timer ring, 11-team strip | M2 | Survey Explorer 2 |
| 8 | Franchise Bidding Terminal | Responsive mobile bidding interface with franchise switcher and legal max bid cap | M2 | Survey Explorer 2 |
| 9 | Player Registration View | 2-column form with live card preview, conditional questionnaire, and private phone | M2 | Survey Explorer 2 |
| 10 | Admin / Operator Console | 3-column operator cockpit with stage controls, live audit stream, and wallet overview | M2 | Survey Explorer 2 |
| 11 | Projector Hall Display | High-contrast auditorium display (`#0B0F19`), 380px portrait, 220px timer, giant bids | M2 | Survey Explorer 2 |
| 12 | Inline SVG Vector Iconography | Complete replacement of raw emojis (🔨, ✓, ⚠, ⊘, ☰, →) with clean SVG vectors | M2 | ORIGINAL_REQUEST §R1 |
| 13 | Hammer Confirmation Modal | Confirmation dialog (`#hammerModal`) displaying winner, lot, and price before sale | M2 | Survey Explorer 2 |
| 14 | Registration Review Modal | Confirmation dialog (`#regConfirmModal`) verifying academic details and privacy | M2 | Survey Explorer 2 |
| 15 | Dynamic Undo Modal Binding | Replaces hardcoded values in `#undoModal` with dynamic binding to latest sale | M2 | Survey Explorer 2 |
| 16 | B.Tech Regular Roll Parser | Parses `YY811Abbnn` with $(26 - YY) + 1$ formula into year, branch, and buckets B1-B4 | M3 | Problem Statement §4.1 |
| 17 | B.Tech Lateral Roll Parser | Parses `YY815Abbnn` (5th char '5') with $(26 - YY) + 2$ formula into year and bucket | M3 | Problem Statement §4.1 |
| 18 | Diploma Roll Parser | Parses `YY597-BB-nnn` with $(26 - YY) + 1$ into branch and strictly Bucket B5 | M3 | Problem Statement §4.1 |
| 19 | PG Unbucketed Classification | M.Tech, MBA, MCA handled without bucket quota restrictions | M3 | Problem Statement §4.2 |
| 20 | Freshers Reference Trigger | Triggers referral question when admission year $YY == 26$ | M3 | Problem Statement §5.2 |
| 21 | Conditional Cricket Questionnaire | Branching form for batting (style/order), bowling (pace/spin), wicketkeeping | M3 | Problem Statement §5.1 |
| 22 | Player Type Derivation | Derives WK-Batter, WK, All-Rounder, Batter, Bowler, Fielder; blocks silent No-No-No | M3 | Problem Statement §5.1 |
| 23 | Authoritative Max Bid Formula | `maxBid = purse - (slotsToFill - 1) * 20` where `slotsToFill = max(15 - bought, sum(unmetBuckets))` | M3 | Problem Statement §12.1 |
| 24 | Mandatory Slot Protection | Rule 12.2: Blocks bids when remaining slots after lot < unmet mandatory buckets | M3 | Problem Statement §12.2 |
| 25 | Incremental Bidding Ladder | Stepwise price escalation (+10 below 100, +20 for 100-199, +30 for 200+); no jumps | M3 | Problem Statement §11 |
| 26 | Dual-Mode Auction Timer | 30s initial, 20s post-bid, resets to 20s on any bid; expiration requires hammer to sell | M3 | Problem Statement §11 |
| 27 | Reversible Franchise Pass | Franchises can pass and re-enter at any time prior to hammer sale | M3 | Problem Statement §11 |
| 28 | Dynamic Scarcity Tracking | Warning raised when unsold in bucket <= total players needed across franchises | M3 | Problem Statement §12.3 |
| 29 | Forensic Multi-Lot UNDO | Atomic state rollback (purse, squad count, bucket allocation, unsold status, audit log) | M3 | Problem Statement §12.4 |
| 30 | Double-Undo Prevention | Idempotency guard preventing duplicate reversal of previously undone transactions | M3 | Problem Statement §12.4 |
| 31 | Data & Audit Stream Export | CSV squad exports and TXT/CSV audit stream download functionality | M3 | Problem Statement §16 |
| 32 | E2E Opaque-Box Test Verification | Passing 100% of Tiers 1-4 requirement-driven test cases | M4 | Project Pattern |
| 33 | Adversarial Coverage Hardening | Tier 5 white-box challenger analysis, stress testing, and edge case hardening | M4 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System & FeralUI Core + Speeder Loader | FeralUI background, SVG grain filter, frosted glassmorphism tokens, typography, WCAG AA contrast, Uiverse speeder loader, 48px touch targets | none | PLANNED |
| M2 | 6 Core Views UI/UX Redesign & SVG Iconography | Redesign Public, Live, Franchise, Player, Admin, Projector views; inline SVG icons; Hammer & Registration modals; dynamic Undo modal | M1 | PLANNED |
| M3 | Auction Engine & Business Logic Hardening | Strict maxBid math, Rule 12.2 slot protection, roll parsing, questionnaire, timer cues, squad bucket cards, forensic undo, standalone single-file delivery | M2 | PLANNED |
| M4 | E2E Test Suite Pass (T1-T4) & Adversarial Hardening (T5) | Pass 100% of E2E tests, followed by Tier 5 Challenger adversarial hardening | M3, TEST_READY | PLANNED |

## Interface Contracts

### Roll Parser Contract
- Signature: `parseRoll(roll: string, currentAcademicYY = 26): { valid: boolean, roll: string, program: string, branch: string, entry: string, year: number, bucket: "B1"|"B2"|"B3"|"B4"|"B5"|null, showReference: boolean, error?: string }`
- Error handling: Returns `{ valid: false, error: "Invalid roll number format" }` without throwing.

### Questionnaire Derivation Contract
- Signature: `derivePlayerType(skills: { batting: boolean, bowling: boolean, wicketKeeper: boolean }): { type: "Wicket-Keeper Batter"|"Wicket-Keeper"|"All-Rounder"|"Batter"|"Bowler"|"Fielder", requiresFielderConfirm: boolean }`

### Financial Safety Engine Contract
- Signature: `calculateMaxBid(franchise: Franchise, lotBucketIndex?: number): { maxBid: number, isEligible: boolean, reason?: string }`
- Formula:
  ```js
  let unmetBuckets = Object.keys(franchise.needed).reduce((sum, b) => sum + Math.max(0, franchise.needed[b] - (franchise.buckets[b] || 0)), 0);
  let mandatoryAfterLot = Math.max(0, unmetBuckets - (lotBucketIndex !== undefined && franchise.buckets[lotBucketIndex] < franchise.needed[lotBucketIndex] ? 1 : 0));
  let regularSlotsAfterLot = Math.max(0, 15 - (franchise.bought + 1));
  let reserve = Math.max(mandatoryAfterLot, regularSlotsAfterLot) * 20;
  let maxBid = Math.max(0, franchise.purse - reserve);
  let slotsAfterLot = Math.max(0, (15 - franchise.bought) - 1);
  let isEligible = mandatoryAfterLot <= slotsAfterLot;
  ```

### Forensic Undo Contract
- Signature: `executeUndo(saleId: string, reason: string, actor: string): { success: boolean, refundedPurse: number, restoredPlayerId: string, error?: string }`
- Enforces: `sale.undone === false`, refunds credits to franchise, frees squad slot, decrements bucket count, returns player to unsold catalog, logs audit event, updates scarcity metrics.

## Code Layout
- Target Deliverable: `b:/projects/ACC/Acc-Auction-Os.html` (single, self-contained HTML file).
- Structure inside `Acc-Auction-Os.html`:
  - `<!DOCTYPE html>` + `<head>`: Meta, font definitions, design token CSS variables.
  - `<style>`: FeralUI background, grain overlay, frosted glass cards, Uiverse speeder & longfazers animation, typography, layout, view-specific styles, modals, responsive media queries.
  - `<body>`:
    - SVG Filters (`#feralui-grain`).
    - Fullscreen Speeder Overlay (`#speederOverlay`).
    - Header Navigation (`.header-nav`).
    - Modals (`#hammerModal`, `#undoModal`, `#regConfirmModal`).
    - Dynamic View Container (`#appRoot` / `#viewContainer`).
  - `<script>`:
    - Data constants (11 franchises, seed players, branch lookup tables).
    - Business logic engines (`parseRoll`, `derivePlayerType`, `calculateMaxBid`, `isBucketEligible`, `getBidIncrement`, `scarcityWarning`).
    - State store & reactive rendering dispatch.
    - Auction loop controllers (`startTimer`, `tickTimer`, `placeBid`, `passLot`, `hammerSale`, `skipLot`, `executeUndo`).
    - View renderers (`renderPublicView`, `renderLiveAuctionView`, `renderPlayerRegistrationView`, `renderAdminConsoleView`, `renderProjectorView`).
    - Multi-tab sync (`BroadcastChannel`) & initialization hook.
