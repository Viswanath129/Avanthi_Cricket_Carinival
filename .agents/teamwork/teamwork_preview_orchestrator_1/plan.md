# Execution Plan: ACC Auction Operating System Redesign

## Objective
Elevate the visual presentation and UI/UX of `Acc-Auction-Os.html` to a world-class, responsive, accessible, frosted glassmorphism interface with custom Uiverse speeder loading animation and FeralUI multi-color grain gradient background, while strictly preserving 100% of all auction business logic, formulas, validation rules, and offline single-file portability.

## Track Breakdown

### Phase 0: Survey & Scope Mapping (Mandatory Step 0)
- Dispatch 2 Explorers + 1 Spec Miner:
  - **Explorer 1 (JS Logic & Architecture)**: Deep-dive into `Acc-Auction-Os.html`, `component_extracted.js`, and existing JS functions (bidding engine, timer, roll parser, questionnaire, squad state, undo mechanics).
  - **Explorer 2 (CSS & View UI Components)**: Audit existing CSS, DOM views (6 core views), modal dialogs, responsive breakpoints, emoji usages, and layout structure.
  - **Spec Miner (Requirements & Specs)**: Extract exact business formulas, roll number patterns, bucket allocation rules, bidding ladders, team names, purses, and test vectors from `ORIGINAL_REQUEST.md` and `ACC Auction Website Problem Statement .pdf`.
- Synthesize findings into `PROJECT.md` (Architecture, Feature Inventory, Milestones, Code Layout, Interfaces).

### Phase 1: Dual Track Formulation
- **Track A (Implementation)**: Decomposed into atomic milestones:
  - Milestone 1: FeralUI Pastel Glass Background, SVG Grain Filter, Uiverse Speeder Loader (Boot & Transition Overlay), Base Design System Tokens & Typography.
  - Milestone 2: 6 Core Views Redesign (Public View, Franchise Terminal, Live Auction View, Player Registration, Admin Console, Projector Display) with SVG Iconography, tactile controls, and mobile/projector responsive layouts.
  - Milestone 3: Functional Parity & Auction Engine Hardening (strict maxBid math, timer urgency cues, squad bucket needs, undo modal & audit stream).
- **Track B (E2E Testing Track)**:
  - Formulate `TEST_INFRA.md`.
  - Author comprehensive test cases across Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner), Tier 3 (Cross-Feature Combinations), and Tier 4 (Real-World Scenarios).
  - Publish `TEST_READY.md`.

### Phase 2: Iteration Loop Execution
- Per milestone: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.
- Final Milestone: Pass 100% E2E tests, followed by Tier 5 Adversarial Coverage Hardening.

### Phase 3: Final Acceptance & Sentinel Reporting
- Verify all checkboxes in `ORIGINAL_REQUEST.md`.
- Ensure 0 errors, full standalone single-file delivery in `Acc-Auction-Os.html`.
- Send completion message to parent Sentinel.
