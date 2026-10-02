# Original User Request

## 2026-09-25T07:45:25Z

Redesign and elevate the UI/UX of the Avanthi Cricket Carnival (ACC) Auction Operating System (`Acc-Auction-Os.html`), integrating the custom Uiverse speeder loading animation, FeralUI multi-color grain gradient background (`#F6F9FF` Misted Sky, `#9BE0E8` Rain Indigo, `#C4B5F7` Misted Sky, `#F8B8D9` Lilac Paper with SVG grain pattern), and design intelligence from `ui-ux-pro-max-skill`.

Working directory: `b:/projects/ACC`
Integrity mode: development

## Requirements

### R1. UI/UX Design System Redesign (`ui-ux-pro-max-skill`)
Redesign the interface across all 6 core views (Public Live View, Franchise Bidding Terminal, Live Auction View, Player Registration, Admin/Operator Console, and Projector Hall Display) with a cohesive, accessible, high-contrast, responsive design system. Implement frosted glassmorphic surfaces, clean typography hierarchy (Inter / Space Grotesk / Plus Jakarta Sans), clean SVG vector iconography (replacing emojis), tactile interactive states (`cursor: pointer`, hover depth, active clicks), and mobile-first touch targets (minimum 48px).

### R2. Custom Uiverse Speeder Loading Animation Integration
Integrate the Uiverse.io speeder and longfazers animation:
- Fullscreen boot / initialization screen overlay on initial page load with a smooth status fade-in/fade-out into the app.
- Dynamic transition overlay during lot changes, simulated WebSocket reconnections, and auction state updates.
- Cohesive styling adapting to the aesthetic FeralUI glass theme.

### R3. FeralUI Pastel Glass Background & Glassmorphic Surfaces
Apply the FeralUI gradient blend (`#F6F9FF` Misted Sky, `#9BE0E8` Rain Indigo, `#C4B5F7` Misted Sky, `#F8B8D9` Lilac Paper) with the SVG film grain texture overlay exclusively across all views as the primary UI atmosphere. Pair with frosted glassmorphism (`backdrop-filter: blur(24px)`, subtle white translucent fills `rgba(255,255,255,0.65-0.85)`, crisp border highlights, and dark high-contrast typography `#0F172A` with vibrant emerald `#059669` and amber `#D97706` status accents) ensuring WCAG AA contrast compliance.

### R4. Complete Functional Parity & Auction Engine Correctness
Preserve 100% of all existing business logic, validation rules, and auction workflows:
- Automatic roll number parsing and bucket allocation (B.Tech YY811Abbnn & Diploma YY597-BB-nnn with automatic year/branch/bucket derivation).
- Conditional branching cricket questionnaire and automatic player type derivation (Wicket-Keeper Batter, All-Rounder, Batter, Bowler, Fielder).
- Strict purse and bucket reservation formula: `maxBid = purse - (slotsToFill - 1) * 20` where `slotsToFill = max(15 - bought, sum(unmetBuckets))`.
- Incremental bidding ladder (+10 below 100, +20 for 100-199, +30 for 200+).
- Real-time countdown timer with danger/urgency visual cues in the final seconds.
- 11 Franchise squad cards with live bucket need badges (B1-B5) and state indicators (In Play, Leading, Blocked, Scarcity Warning, Passed).
- Forensic UNDO modal with audit logging, refund, squad restoration, and prevention of double undo.
- Complete standalone delivery inside `Acc-Auction-Os.html`.

## Acceptance Criteria

### Visual & UX Standards
- [ ] Single self-contained HTML file running cleanly in modern browsers with zero missing asset errors.
- [ ] Uiverse speeder loader animates smoothly on initial load and lot transitions with zero layout shift.
- [ ] FeralUI SVG gradient with grain pattern renders properly across all screen resolutions without blocking interaction.
- [ ] All clickable buttons and interactive controls feature `cursor: pointer`, visible focus rings, and active states.
- [ ] WCAG AA compliant text contrast (4.5:1 minimum) across all cards, badges, modals, and tables.
- [ ] Responsive layouts across Mobile (360-768px), Tablet (768-1024px), Desktop (1024-1440px), and Large Projector (1440px+).
- [ ] Clean SVG icons used throughout instead of raw emoji characters.

### Functional Integrity
- [ ] Roll number parser accurately derives program, branch, entry type, year, and bucket for all test cases.
- [ ] Questionnaire dynamically updates player type based on selected skills.
- [ ] Bid button respects authoritative max bid cap and disables when bid exceeds legal ceiling or when team has passed.
- [ ] Admin console controls (Start, Pause, Hammer, Skip, Undo, Export) function reliably and log to the audit stream.
- [ ] Projector view provides high-visibility typography, large player card, timer pulse, and all 11 franchise status badges.

## 2026-09-25T08:06:34Z

Please resume monitoring and execution of the teamwork orchestrator for the Acc-Auction-Os redesign. Continue driving the implementation and verification pipeline to completion.
