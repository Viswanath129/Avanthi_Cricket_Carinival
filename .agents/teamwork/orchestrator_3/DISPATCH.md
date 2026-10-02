# Dispatch Log — orchestrator_3

## 2026-10-02T05:10:46Z

You are the Project Orchestrator for ACC 2026.

Your working directory is: B:\projects\ACC\.agents\teamwork\orchestrator_3
The project repository root is: B:\projects\ACC
The authoritative user request is recorded in: B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md under header ## 2026-10-02T05:09:24Z.

Your mission is to perform a comprehensive architecture and UX overhaul of the ACC 2026 application according to the requirements:
1. R1. Global Light Theme Across All Surfaces: Enforce consistent light theme across every screen, dialog, and component in the application (Home, Player/Franchise/Admin registration & login, Player/Franchise/Admin dashboards, Projector, Public Live, modals, dropdowns, empty states). Eliminate all dark navy page backgrounds, dark cards, dark inputs, replacing them with the authoritative ACC light token palette (#F8FAFC/#FFFFFF, clean borders, soft shadows, ACC green/blue brand accents, dark typography).
2. R2. Auth State Leakage Resolution & Explicit Intent Model: Fix root cause of auth state and UI bleeding across Player, Franchise, Admin pages. Decouple auth intent from authorization roles with explicit route-state model (/login?mode=player, /login?mode=franchise, /login?mode=admin). Ensure Player Login presents only Player auth, Franchise only Franchise, Admin only Admin. Establish single authoritative Firebase Auth listener in AuthContext. Eliminate remaining localStorage/sessionStorage role-override or auth-bypass mechanisms.
3. R3. Admin Authentication & Error Humanization: Resolve root cause of Firebase auth/configuration-not-found error for Email/Password admin login across client setup, authorized domains, initialization timing, and deployment configs. Redesign Admin Login UI with light-themed aesthetics and explicit action buttons (SIGN IN AS ADMINISTRATOR). Map raw technical Firebase error codes to user-friendly messages.
4. R4. Interactive Photo & Logo Editor: Implement interactive canvas-based image editor for Player Registration and Franchise Logo uploads with default 4:3 crop box (and optional 1:1), Zoom slider, Pan/drag, Rotation, Reset, Fit, Fill, Cancel. Pre-upload client-side dimension validation, aspect-ratio enforcement, compression. Non-destructive re-edit with preserved transformations. Mobile touch gesture support.
5. R5. Registration Form UX & Unicode Cleanup: Redesign Player and Franchise multi-step registration forms with clean progress steppers, structured field groupings, visible focus states, caret-stable roll-number inputs. Global repository audit eliminating literal escaped Unicode sequences (\u2192, \u2190, \u2699) replaced by standard typography, semantic vector icons, or Lucide icons.
6. R6. Regression Defense, Automated Testing & Documentation: Guarantee zero security or auction regressions. Core auction mechanics, bidding logic, purse/bucket calculations, and Firestore security rules must remain 100% intact. Add/update tests covering auth intent isolation, Admin Email/Password authentication, photo crop output, and responsive layout. Complete TypeScript validation (pnpm check), production build (pnpm build), and author the comprehensive audit deliverable docs/ACC_AUTH_UX_FINAL.md with complete root-cause analyses and pass/fail matrix.

Follow the standard orchestration protocol: decompose into phases (Phase 0 survey, Phase 1 implementation swarms, Phase 2 integration & testing, Phase 3 deliverables & audit readiness), dispatch specialized subagents to their own directories under B:\projects\ACC\.agents\teamwork\, track progress in B:\projects\ACC\.agents\teamwork\orchestrator_3\progress.md and plan in plan.md.

Notify the sentinel when complete so that the independent post-victory audit can be conducted.
