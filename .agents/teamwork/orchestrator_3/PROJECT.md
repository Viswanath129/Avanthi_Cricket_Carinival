# Project: ACC 2026 Architecture & UX Overhaul

## Architecture
- **Application Model**: Production React + TypeScript + Vite SPA (`acc-auction-portal`) backed by Firebase Authentication, Firestore real-time database, and Firebase Cloud Storage.
- **Design System**: Authoritative ACC Light Token System (`#F8FAFC` slate-50 background, `#FFFFFF` white surfaces, `#0F172A` high-contrast typography, clean borders `#E2E8F0`, soft shadows, ACC emerald green `#059669` and deep blue brand accents). Frosted glassmorphism over the dynamic Opal sky backdrop (`<BlueAnimatedBackground />`).
- **Authentication & Authorization Architecture**:
  - Decoupled route-intent model: explicit query parameter modes (`/login?mode=player`, `/login?mode=franchise`, `/login?mode=admin`).
  - Single authoritative Firebase `onAuthStateChanged` listener in `AuthContext` with sequence/epoch gating to prevent race conditions.
  - Zero authorization-determining state in client storage (`localStorage` / `sessionStorage`).
  - Dual-layer Admin Authentication: real Firebase Email/Password auth attempt paired with graceful fallback to authoritative directory credentials on `auth/configuration-not-found` for demo/offline resilience.
  - Complete error humanization mapping technical Firebase error codes to polished user feedback.
- **Interactive Canvas Media Pipeline**:
  - Shared light-themed HTML5 canvas image editor (`ImageEditorModal.tsx`) with default 4:3 crop box (and optional 1:1 preset).
  - Pointer events with `touch-action: none` supporting single-touch pan/drag, multi-touch pinch-to-zoom, slider zoom, 90° rotation, fit, fill, reset, and cancel.
  - Non-destructive re-edit preserving raw file and transform coordinates.
  - Client-side validation, aspect-ratio enforcement, and compression before storage upload.
  - Storage paths aligned with `storage.rules` (`players/${normalizedRoll}/photo.jpg`, `franchises/${franchiseId}/logo.png`), saving genuine download URLs into Firestore.
- **Core Auction Engine & Security Boundaries**:
  - 100% zero-regression preservation of auction mechanics (`bidEngine.ts`, `bucketEligibility.ts`, `scarcity.ts`, `rollClassifier.ts`, `useAuctionTimer.ts`, `useBidSubmission.ts`, `storage.rules`, `firestore.rules`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Decoupled Auth Intent Routing | `/login?mode=player`, `/login?mode=franchise`, `/login?mode=admin` rendering single-persona forms | M1 | ORIGINAL_REQUEST §R2 |
| 2 | Authoritative AuthContext Listener | Single `onAuthStateChanged` listener with epoch gating, eliminating concurrent resolution races | M1 | Survey Explorer Auth |
| 3 | Route Role Isolation | Restrict `/player` to `['PLAYER']`, preventing Admin/Coordinator mock data leak into player dashboard | M1 | Survey Explorer Auth |
| 4 | Storage Role Leak Elimination | Audit and rename `acc_admin_role` to `acc_admin_profile_designation`; ensure 0 storage auth overrides | M1 | ORIGINAL_REQUEST §R2 |
| 5 | Admin Auth Dual-Layer Resolution | Live Firebase Email/Password attempt + fallback on `auth/configuration-not-found` | M1 | ORIGINAL_REQUEST §R3 |
| 6 | Explicit Admin Action Button | Button text strictly styled and labeled `SIGN IN AS ADMINISTRATOR` | M1 | ORIGINAL_REQUEST §R3 |
| 7 | Firebase Error Humanization | Comprehensive 15-code error mapping table in `lib/authErrorMap.ts` | M1 | ORIGINAL_REQUEST §R3 |
| 8 | Global Light Theme Root Tokens | Rewrite `:root` variables in `index.css` to ACC Light Palette (#F8FAFC, #FFFFFF, #0F172A, #E2E8F0, #059669) | M2 | ORIGINAL_REQUEST §R1 |
| 9 | Page Backdrop Transparency | Remove opaque dark backgrounds (`bg-slate-900`, `bg-[#080c0a]`, `bg-slate-950`) restoring Opal sky backdrop | M2 | Survey Explorer UX |
| 10 | Frosted White Glass Cards | High-contrast light cards (`bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl`) across all routes | M2 | ORIGINAL_REQUEST §R1 |
| 11 | Dashboard & Portal Light Overhaul | Light theme across Home, Player/Franchise/Admin Dashboards, Modals, Dropdowns, and Empty States | M2 | ORIGINAL_REQUEST §R1 |
| 12 | Projector & Live Display Light Polish | Light theme & high-contrast typography in Projector (`/projector`) and Public Live (`/live`) | M2 | ORIGINAL_REQUEST §R1 |
| 13 | Interactive 4:3 Canvas Image Editor | Shared `ImageEditorModal.tsx` with default 4:3 crop box, 1:1 option, zoom slider, pan/drag, 90° rotate | M3 | ORIGINAL_REQUEST §R4 |
| 14 | Touch Gestures & Action Controls | Pointer events with `touch-action: none`, Pinch-to-zoom, Drag, Fit, Fill, Reset, Cancel controls | M3 | ORIGINAL_REQUEST §R4 |
| 15 | Non-Destructive Image Re-edit | Preserve raw file & transform coordinates, allowing users to re-crop without re-selecting from disk | M3 | ORIGINAL_REQUEST §R4 |
| 16 | Storage Path & URL Persistence Fix | Align upload paths to `storage.rules` and persist valid `getDownloadURL` (eliminating `blob:` URL bug) | M3 | Survey Explorer Photo |
| 17 | Global Unicode Escape Cleanup | Sweep repository and replace all 44 escaped Unicode sequences (`\u2192`, `\u2190`, etc.) with Lucide icons | M4 | ORIGINAL_REQUEST §R5 |
| 18 | Registration Stepper 6-Column Grid | Fix `ProgressBar.tsx` grid layout (`grid-cols-6`) eliminating wrapping defect for step 6 | M4 | Survey Explorer UX |
| 19 | Caret-Stable Roll Number Inputs | Stabilize caret position and uppercase normalization in Franchise referred player draft input | M4 | ORIGINAL_REQUEST §R5 |
| 20 | Photo Cropper Canvas White Fill | Replace dark `#0f172a` canvas fill with clean `#FFFFFF` background | M4 | Survey Explorer UX |
| 21 | Auth Intent Isolation Test Suite | Vitest tests for route intent isolation, single persona rendering, and storage security | M5 | ORIGINAL_REQUEST §R6 |
| 22 | Admin Auth & Error Mapping Test Suite | Vitest tests for admin authentication handling, fallback, and 15 error code translations | M5 | ORIGINAL_REQUEST §R6 |
| 23 | Photo Editor Canvas Test Suite | Vitest tests for 4:3 aspect ratio math, zoom/pan transforms, and dimension enforcement | M5 | ORIGINAL_REQUEST §R6 |
| 24 | Zero Regression Verification | Verification of 85 Vitest unit tests, 5 Node acceptance suites, `pnpm check`, `pnpm build` | M5 | ORIGINAL_REQUEST §R6 |
| 25 | Comprehensive Audit Deliverable | Authoritative audit deliverable `docs/ACC_AUTH_UX_FINAL.md` with root cause analyses & test matrix | M6 | ORIGINAL_REQUEST §R6 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Auth Intent Model & Admin Auth Fix | R2 & R3: Intent routing, AuthContext single listener, role route guards, Admin email/password fix & error mapping | none | PLANNED |
| M2 | Global Light Theme Enforcement | R1: index.css tokens, index.html, main.tsx, Home, Login, Dashboards, Projector, Live light styling | M1 | PLANNED |
| M3 | Interactive Photo & Logo Canvas Editor | R4: `ImageEditorModal.tsx`, 4:3 / 1:1 crop, pan/zoom/rotate, touch gestures, storage path alignment | none | PLANNED |
| M4 | Registration Multi-Step UX & Unicode Cleanup | R5: Replace 44 unicode escapes, fix ProgressBar 6-col grid, franchise roll input caret stabilization | M2, M3 | PLANNED |
| M5 | Automated Testing & Zero Regression Verification | R6: Vitest suites (`authIntentIsolation`, `adminAuthErrorMapping`, `photoEditor`), run full test suite, pnpm check, build | M1, M2, M3, M4 | PLANNED |
| M6 | Comprehensive Deliverable & Audit Readiness | R6: Author `docs/ACC_AUTH_UX_FINAL.md`, Reviewer & Forensic Auditor gates, final verification | M5 | PLANNED |

## Interface Contracts

### Auth Intent & Route Contract
- URLs: `/login?mode=player`, `/login?mode=franchise`, `/login?mode=admin`.
- Behavior:
  - If `mode === 'player'`: Render strictly Player Google Sign-In. Auto-redirect only if `userDoc.role === 'PLAYER'`.
  - If `mode === 'franchise'`: Render strictly Franchise Google Sign-In. Auto-redirect only if `userDoc.role.startsWith('FRANCHISE')`.
  - If `mode === 'admin'`: Render strictly Admin Email & Password login. Auto-redirect only if `['SUPER_ADMIN', 'ADMIN'].includes(userDoc.role)`.
- Protected Routes:
  - `/player`: `allowedRoles={['PLAYER']}` (exclude admin/coordinator roles).

### Firebase Error Humanization Contract
- File: `acc-auction-portal/client/src/lib/authErrorMap.ts`
- Signature: `mapFirebaseAuthError(error: any): string`
- Handles: `auth/configuration-not-found`, `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`, `auth/network-request-failed`, `auth/too-many-requests`, `auth/user-disabled`, etc.

### Image Editor Contract
- File: `acc-auction-portal/client/src/components/ui/ImageEditorModal.tsx`
- Props:
  ```ts
  interface ImageEditorModalProps {
    isOpen: boolean;
    rawFile: File | null;
    initialState?: ImageTransformState;
    defaultAspect?: '4:3' | '1:1';
    onConfirm: (result: { blob: Blob; dataUrl: string; state: ImageTransformState }) => void;
    onCancel: () => void;
  }
  ```

## Code Layout & Write Boundaries
- **Milestone 1 Files**:
  - `acc-auction-portal/client/src/contexts/AuthContext.tsx`
  - `acc-auction-portal/client/src/pages/LoginPage.tsx`
  - `acc-auction-portal/client/src/components/auth/ProtectedRoute.tsx`
  - `acc-auction-portal/client/src/lib/authErrorMap.ts`
  - `acc-auction-portal/client/src/App.tsx`
- **Milestone 2 Files**:
  - `acc-auction-portal/client/src/index.css`
  - `acc-auction-portal/client/index.html`
  - `acc-auction-portal/client/src/main.tsx`
  - `acc-auction-portal/client/src/pages/Home.tsx`
  - `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx`
  - `acc-auction-portal/client/src/pages/AdminAuctionPage.tsx`
  - `acc-auction-portal/client/src/pages/ProjectorPage.tsx`
  - `acc-auction-portal/client/src/pages/PublicLivePage.tsx`
  - `acc-auction-portal/client/src/pages/PlayerDashboardPage.tsx`
  - `acc-auction-portal/client/src/pages/FranchiseBiddingPage.tsx`
- **Milestone 3 Files**:
  - `acc-auction-portal/client/src/components/ui/ImageEditorModal.tsx`
  - `acc-auction-portal/client/src/components/registration/PhotoStep.tsx`
- **Milestone 4 Files**:
  - `acc-auction-portal/client/src/components/registration/ProgressBar.tsx`
  - `acc-auction-portal/client/src/components/registration/IdentityStep.tsx`
  - `acc-auction-portal/client/src/components/registration/StatsCricHeroesStep.tsx`
  - `acc-auction-portal/client/src/components/registration/ReferenceBasePriceStep.tsx`
  - `acc-auction-portal/client/src/components/registration/ActionBar.tsx`
  - `acc-auction-portal/client/src/pages/PlayerRegistrationPage.tsx`
  - `acc-auction-portal/client/src/pages/FranchiseRegistrationPage.tsx`
- **Milestone 5 Files**:
  - `acc-auction-portal/client/src/__tests__/authIntentIsolation.test.ts`
  - `acc-auction-portal/client/src/__tests__/adminAuthErrorMapping.test.ts`
  - `acc-auction-portal/client/src/__tests__/photoEditor.test.ts`
- **Milestone 6 Files**:
  - `docs/ACC_AUTH_UX_FINAL.md`
