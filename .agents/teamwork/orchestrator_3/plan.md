# Orchestration Plan — ACC 2026 Architecture & UX Overhaul

## Mission
Comprehensive architecture and UX overhaul of ACC 2026:
- R1: Global Light Theme across all surfaces
- R2: Auth State Leakage Resolution & Explicit Intent Model (/login?mode=...)
- R3: Admin Email/Password Auth Configuration Fix & Error Mapping
- R4: Interactive 4:3 Canvas Photo/Logo Editor with touch gestures and non-destructive re-edit
- R5: Registration Form UX & Unicode Cleanup
- R6: Zero Regression Verification, Automated Tests, and docs/ACC_AUTH_UX_FINAL.md

## Phases

### Phase 0: Survey & Codebase Mapping (Parallel Explorers)
- **Explorer 1 (Theme & UX)**: Survey UI styling, dark tokens, backgrounds, inputs, modals, projector, public live, unicode escapes.
- **Explorer 2 (Auth & Admin)**: Survey AuthContext, login routes, mode parameters, storage leaks, Firebase email/password setup, and `auth/configuration-not-found` root cause.
- **Explorer 3 (Photo Editor & Testing)**: Survey registration upload flows, photo requirements, canvas editor architecture, existing test suites, and regression boundaries.
- **Output**: Merge findings into `PROJECT.md` with Feature Inventory and Interface Contracts.

### Phase 1: Implementation Swarms (Decomposed Milestones)
- **M1: Auth Core & Intent Isolation (R2, R3)**
  - Implement explicit route-state intent model (`/login?mode=player|franchise|admin`).
  - Single authoritative Firebase Auth listener in `AuthContext`.
  - Fix Firebase Admin email/password initialization and `auth/configuration-not-found` root cause.
  - Humanized error mapping.
  - Purge storage role-override/bypass mechanisms.
- **M2: Global Light Theme Enforcement (R1)**
  - Enforce authoritative ACC light palette (#F8FAFC / #FFFFFF, clean borders, soft shadows, ACC brand accents).
  - Transform all dark navy pages, cards, and inputs across Home, Login, Registration, Dashboards, Projector, and Public Live.
- **M3: Interactive Photo & Logo Editor (R4)**
  - Canvas-based image editor with 4:3 default crop (and 1:1 option).
  - Zoom, Pan, Rotate, Reset, Fit, Fill, Cancel controls.
  - Pre-upload dimension validation & compression.
  - Non-destructive re-edit state retention & touch gesture support.
- **M4: Registration Form UX & Unicode Cleanup (R5)**
  - Multi-step registration forms with progress steppers and structured field groupings.
  - Caret-stable roll number inputs.
  - Global repository sweep replacing escaped Unicode (\u2192, etc.) with semantic vector / Lucide icons.

### Phase 2: Testing & Dual Track Verification (R6)
- **M5: Comprehensive Automated Testing & Regression Defense**
  - Auth intent isolation tests.
  - Admin email/password authentication tests.
  - Photo editor canvas crop tests.
  - Zero regression validation on core auction engine, bidding logic, purse/bucket calculations, and Firestore security rules.
  - `pnpm test`, `pnpm check`, `pnpm build`.

### Phase 3: Audit & Final Deliverables (R6)
- **M6: Comprehensive Deliverable & Audit Readiness**
  - Author `docs/ACC_AUTH_UX_FINAL.md` with complete root-cause analyses and pass/fail matrix.
  - Reviewer and Forensic Auditor verification.
  - Report back to Sentinel for post-victory audit.
