# Original User Request

## 2026-10-01T18:09:11Z

Execute a comprehensive, adversarial security audit and verification of the ACC 2026 real Firebase Authentication and Firestore authorization architecture, validating that the frontend is not trusted, all boundaries hold at the database level, and generating docs/ACC_AUTH_SECURITY_FINAL.md.

Working directory: b:\projects\ACC
Integrity mode: development

## Requirements

### R1. Authentication Boundary & Identity Resolution Audit
Verify that Firebase Authentication provides identity only (`uid`, `email`), and that role and permission resolution is strictly governed by authoritative database records (`/users/{uid}`). Unregistered Google accounts must resolve to `UNREGISTERED_GOOGLE` with zero role privileges. Blocked accounts must be completely barred. Approved active players must only reach `/player`. Verify that Player Roll number uniqueness (`24815a0443` vs `24815A0443`) and 1:1 Google UID-to-Player linking cannot be hijacked by an attacker using another Google account.

### R2. Privilege & Approval Escalation Penetration Testing
Directly test unauthorized privilege mutations against Firestore rules:
- Attempting to escalate role (`PLAYER` -> `ADMIN` or `SUPER_ADMIN`, `FRANCHISE_COORDINATOR` -> `ADMIN`) from an authenticated non-admin client.
- Attempting to elevate approval status (`PENDING` -> `APPROVED`, `PENDING_APPROVAL` -> `ACTIVE`, `BLOCKED` -> `ACTIVE`) without Super Admin authorization.
- Attempting to claim administrative privileges via Google OAuth.
All attempts must fail at the Firestore security rule evaluation layer, completely independent of frontend UI route guards.

### R3. Franchise Isolation (IDOR) & Public Data Privacy Verification
Verify complete tenancy isolation between franchises. A coordinator or captain of Franchise A must be prevented from reading, bidding, or modifying purse/squad data of Franchise B, even if they forge `franchiseId` in request payloads. Verify that public spectators cannot query private PII (player phone numbers, private emails, auth UIDs, or internal account metadata) through direct Firestore/public API queries.

### R4. Dual-Identity Provisioning & Team Lead Architecture Audit
Audit the dual-identity franchise architecture (Coordinator + Team Leader sharing one purse and squad). Specifically audit how the secondary Team Lead Firebase Auth UID is provisioned. If the creation path generates synthetic client-side UIDs (`tl_${Date.now()}`) without an authoritative Firebase Admin SDK backend or OAuth email-linking workflow, classify it as a security finding, document root cause, and verify client credential handling.

### R5. Session Lifecycle, Audit Log Immutability & Test Suite Execution
Verify that logging out clears all Firebase Auth tokens and application role states so that back-navigation or cached sessions cannot regain access. Verify that audit log records cannot be modified, deleted, or forged by non-admin actors. Run the entire test suite (`pnpm test`, `pnpm check`, `pnpm build`) and compile the definitive audit report into `docs/ACC_AUTH_SECURITY_FINAL.md` with explicit statuses (`PASS`, `PARTIAL`, `FAIL`, `NOT VERIFIED`).

## Acceptance Criteria

### Authorization & Escalation Defense
- [ ] Direct Firestore write of `role: "SUPER_ADMIN"` or `role: "ADMIN"` by non-admin client is rejected by rules.
- [ ] Direct Firestore write of `approvalStatus: "APPROVED"` or `accountStatus: "ACTIVE"` by non-admin client is rejected by rules.
- [ ] Attempting to access or claim Admin/SuperAdmin privileges via Google OAuth provider is rejected.
- [ ] Unregistered Google accounts cannot access protected player or franchise dashboards.

### Tenancy & PII Protection
- [ ] Franchise Coordinator A cannot update or bid on Franchise B's lot, purse, or squad.
- [ ] Public spectators cannot query unapproved players or private contact fields (phone numbers, private emails) via Firestore rules.
- [ ] Roll number normalization strictly prevents duplicate registrations (`24815a0443` resolves to `24815A0443`).
- [ ] Attempt by Google UID B to claim Player record belonging to Google UID A fails.

### Architecture & Audit Deliverables
- [ ] Root cause and architectural security evaluation of Team Lead secondary UID provisioning documented.
- [ ] Audit log records verified to be immutable against client modification or deletion.
- [ ] Session logout verified to purge auth credentials and prevent stale state access.
- [ ] Full automated test suite (`pnpm test`) executed and passing with exact counts reported.
- [ ] TypeScript check (`pnpm exec tsc --noEmit`) passes with 0 errors.
- [ ] Production build (`pnpm build`) succeeds.
- [ ] `docs/ACC_AUTH_SECURITY_FINAL.md` created with the exact acceptance status table and objective terminology (PASS, PARTIAL, FAIL, NOT VERIFIED).


## 2026-10-02T04:51:02Z

The user has instructed to continue the teamwork execution (/teamwork-preview). Following the server restart, please resume your sentinel supervision and ensure the orchestrator (7f068c7d-2f06-486e-9bdd-e40597973f6a or a newly spawned orchestrator if needed) proceeds through Phase 0-3: surveying the codebase, performing direct penetration tests on Firestore rules, evaluating the Team Lead UID provisioning architecture, executing all test suites (pnpm test, pnpm check, pnpm build), and compiling docs/ACC_AUTH_SECURITY_FINAL.md. Report back with progress and findings.


## 2026-10-02T04:58:31Z

Transform the ACC 2026 Admin Dashboard into a premium, polished, high-confidence tournament command center for demo and presentation use, removing destructive user-data management controls while preserving full backend capabilities and reallocating dashboard space to live operational command features.

Working directory: B:\projects\ACC
Integrity mode: demo

## Requirements

### R1. Demo Safety — Removal of Destructive User Data UI
Completely remove and hide visible UI controls related to destructive user-data actions (Delete User, Delete Player, Delete Franchise, Permanent Delete, Bulk Delete, Revert/Restore, Trash Bin) from normal admin demo views across sidebars, cards, action menus, modals, and toolbars. Implement a clean centralized capability (e.g. `DEMO_MODE = true`) without breaking underlying records, audit logs, or core backend data structures.

### R2. Command Center Space Reallocation & Information Hierarchy
Reallocate former destructive data-management areas into high-value operational command modules:
- **Hero / Live Auction Command Card**: Prominent current player view (photo, name, roll, branch/year, bucket, player type), prominent base/current pricing, leading bidder, bid count, visual state badge, and high-visibility countdown timer.
- **Contextual Quick Actions**: Streamlined, contextual action set (Start Auction, Draw Player, Pause/Resume, Hammer, Bid on Behalf, Projector / Public Live triggers).
- **Team Status & Purse Monitor**: Compact at-a-glance status grid for all 11 franchises showing squad size, purse remaining, bucket progress, and live bidding state.
- **Registration & Approval Pipeline**: Live KPI summary for candidate verification, pending approvals, franchise counts, and reference conflict alerts.
- **Realtime Activity Timeline & System Health**: Chronological audit stream of floor events (draws, bids, sales) and live connectivity indicator (Firebase Auth, Firestore, Realtime Sync, Auction Engine, Projector).

### R3. Navigation Streamlining & Visual Polish
Streamline top-level navigation into concise operational groups (Overview, Auction, Players, Franchises, Registrations, Live/Projector, Reports, Settings, Profile). Establish a sports operations control room visual hierarchy: strong typography, restrained color palette, no generic CRUD aesthetic or visual noise, responsive mobile/tablet layout without horizontal overflow, and accessible semantic controls.

### R4. Zero Regressions on Core Functionality & Realtime Verification
Maintain 100% functionality of the core auction engine, bidding ladder, reserve purse calculations, bucket viability rules, timer mechanics, undo cascade, and Firebase realtime subscriptions. Verify with automated test suites (`pnpm test`, acceptance suites) and TypeScript compilation (`pnpm check`, `pnpm build`).

## Acceptance Criteria

### Demo Safety & UI Cleanliness
- [ ] No visible Delete User / Delete Player / Delete Franchise / Bulk Delete / Trash Bin controls in the demo Admin Dashboard.
- [ ] No empty dead space left where destructive controls previously resided.
- [ ] Clean centralized demo configuration applied without scattering hardcoded conditionals.

### Command Center Features & Visual Hierarchy
- [ ] Live auction card is the visual centerpiece with prominent timer, player metadata, current bid, and leader.
- [ ] All 11 franchises display real-time squad size, purse, bucket progress, and bidding status.
- [ ] Registration pipeline, activity timeline, and system health status cards are populated with live authoritative data.
- [ ] Contextual action bar presents only relevant, non-destructive controls based on current auction phase.
- [ ] Header includes compact status indicator, edition, quick links (Projector, Public Live), and profile controls.

### Reliability, Parity & Quality Assurance
- [ ] Responsive layout adapts cleanly across desktop, tablet, and mobile with no horizontal clipping.
- [ ] Zero regressions to auction state machines, purse calculation, hammer confirmation, or undo logic.
- [ ] Bit-for-bit SHA-256 byte parity preserved between `index.html` and `Acc-Auction-Os.html` if Web OS files are modified.
- [ ] All automated test suites (`pnpm test`, `tests/test_part_d_and_dashboard_acceptance.js`, `tests/test_section52_acceptance.js`) pass with 0 failures.
- [ ] TypeScript check (`pnpm check`) and production build (`pnpm build`) complete successfully.


## 2026-10-02T05:09:24Z

Perform a comprehensive architecture and UX overhaul of the ACC 2026 application: establish a strictly light-themed visual language across all portals, eliminate the auth-state leakage bug across Player/Franchise/Admin flows with a clean intent model, resolve the Admin Email/Password authentication configuration error, implement an interactive 4:3 photo/logo editor, globally clean up escaped Unicode sequences, and guarantee zero security or auction regressions.

Working directory: B:\projects\ACC
Integrity mode: demo

## Requirements

### R1. Global Light Theme Across All Surfaces
Enforce a consistent, unified light theme across every screen, dialog, and component in the application (Home, Player/Franchise/Admin registration & login, Player/Franchise/Admin dashboards, Projector, Public Live, modals, dropdowns, empty states). Eliminate all dark navy page backgrounds, dark cards, dark form inputs, and hardcoded dark tokens, replacing them with the authoritative ACC light token palette (light background `#F8FAFC`/`#FFFFFF`, clean borders, soft shadows, ACC green/blue brand accents, and dark high-contrast typography).

### R2. Auth State Leakage Resolution & Explicit Intent Model
Fix the architectural root cause of authentication state and UI bleeding across Player, Franchise, and Admin pages:
- Decouple authentication intent from authorization roles using an explicit route-state model (`/login?mode=player`, `/login?mode=franchise`, `/login?mode=admin`).
- Ensure Player Login presents only Player authentication, Franchise Login presents only Franchise authentication, and Admin Login presents only Administrative authentication.
- Establish a single authoritative Firebase Auth listener in `AuthContext` to prevent cross-contamination between identity, authorization, route, and transient intent states.
- Eliminate any remaining `localStorage`/`sessionStorage` role-override or auth-bypass mechanisms.

### R3. Admin Authentication & Error Humanization
Resolve the root cause of the Firebase `auth/configuration-not-found` error for Email/Password administration login across client setup, authorized domains, initialization timing, and deployment configs. Redesign the Admin Login UI with light-themed aesthetics and explicit action buttons (`SIGN IN AS ADMINISTRATOR`). Map all raw technical Firebase error codes (e.g. `auth/network-request-failed`, `auth/wrong-password`) to polished, contextual, human-readable error messages.

### R4. Interactive Photo & Logo Editor
Implement an interactive canvas-based image editor for Player Registration and Franchise Logo uploads:
- Features: Crop with default 4:3 aspect ratio preset (and optional 1:1), Zoom slider, Pan/drag positioning, Rotation, Reset, Fit, Fill, and Cancel.
- Quality: Pre-upload client-side dimension validation, aspect-ratio enforcement, and compression before storage.
- Non-destructive re-edit: Allow users to reopen the editor to tweak cropping/framing without re-selecting the source file.
- Mobile responsiveness: Touch-gesture support for drag and zoom without horizontal page scrolling.

### R5. Registration Form UX & Unicode Cleanup
Redesign Player and Franchise multi-step registration forms with clean progress steppers, structured field groupings, visible focus states, and caret-stable roll-number inputs. Perform a global repository audit to eliminate literal escaped Unicode sequences (such as `\u2192`, `\u2190`, `\u2699`), replacing them with standard typography, semantic vector icons, or Lucide icons.

### R6. Regression Defense, Automated Testing & Documentation
Verify that all core auction mechanics, bidding logic, purse/bucket calculations, and Firestore security rules remain 100% intact. Add/update tests covering auth intent isolation, Admin Email/Password authentication, photo crop output, and responsive layout. Complete TypeScript validation (`pnpm check`), production build (`pnpm build`), and author the comprehensive audit deliverable `docs/ACC_AUTH_UX_FINAL.md`.

## Acceptance Criteria

### Theme Consistency & UI Quality
- [ ] Zero dark navy page backgrounds, dark cards, or dark inputs across any route or modal.
- [ ] Consistent light token system applied across Home, Login, Registration, Dashboards, and Public Live.
- [ ] No literal escaped Unicode strings (`\u2192`, `\u2190`, etc.) rendered anywhere in the UI.

### Authentication & Authorization Integrity
- [ ] Navigating to `/login?mode=player` renders strictly Player authentication; `/login?mode=franchise` renders Franchise only; `/login?mode=admin` renders Admin only.
- [ ] Player/Franchise/Admin auth state does not bleed across routes or persist as global UI state.
- [ ] Admin login successfully authenticates via real Firebase Email/Password without `auth/configuration-not-found` errors.
- [ ] Raw Firebase error strings are mapped to user-friendly messages.
- [ ] Local storage contains zero authorization-determining flags or credentials.

### Photo & Logo Editor
- [ ] Selecting an image launches the interactive editor with a prominent 4:3 crop box.
- [ ] Zoom, pan, rotate, fit, fill, and reset controls work smoothly on desktop and mobile.
- [ ] Final photo preview allows reopening the editor with preserved transformations.
- [ ] Output image conforms to 4:3 aspect ratio with optimized file size.

### Verification & Delivery
- [ ] Automated test suite (`pnpm test`) passes with new auth isolation and photo editor tests.
- [ ] TypeScript check (`pnpm check`) passes with 0 errors.
- [ ] Production build (`pnpm build`) succeeds.
- [ ] `docs/ACC_AUTH_UX_FINAL.md` generated with complete root-cause analyses and pass/fail matrix.
