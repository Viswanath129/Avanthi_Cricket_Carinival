# Handoff Report: Theme & UX Survey Explorer (Gen 2)

**Report Type**: Hard Handoff (Investigation Complete)  
**Working Directory**: `B:\projects\ACC\.agents\teamwork\explorer_ux_survey_2`  
**Detailed Report**: `B:\projects\ACC\.agents\teamwork\explorer_ux_survey_2\report.md`  
**Target Requirements**: R1 (Global Light Theme Across All Surfaces) & R5 (Registration Form UX & Unicode Cleanup)

---

## 1. Observation

1. **Dark Root Tokens in Global CSS**:
   - `acc-auction-portal/client/src/index.css` lines 5–31 defines dark theme variables:
     ```css
     :root {
       color: #f4f1ea;
       background: #0e1114;
       --background: #0e1114;
       --foreground: #f4f1ea;
       --card: #151a1f;
       --card-foreground: #f4f1ea;
       --popover: #151a1f;
       --popover-foreground: #f4f1ea;
       --primary: #d4f34a;
       --primary-foreground: #151a1f;
       --border: rgba(214, 222, 215, 0.11);
       --input: rgba(214, 222, 215, 0.12);
       --ring: #d4f34a;
     }
     html { background: #0e1114; }
     body { margin: 0; min-width: 320px; min-height: 100vh; background: #0e1114; color: #f4f1ea; }
     ```
   - `acc-auction-portal/client/index.html` line 6 defines `<meta name="theme-color" content="#0e1114" />`.
   - `acc-auction-portal/client/src/main.tsx` lines 27–45 hardcodes `background: "#0e1114"` and `background: "#151a1f"` in the root `ErrorBoundary`.

2. **Opaque Dark Overlays Obscuring Sky Backdrop**:
   - `acc-auction-portal/client/src/App.tsx` renders `<BlueAnimatedBackground />` (`#d8e8fc` video backdrop), but page components render opaque dark wrappers:
     - `LoginPage.tsx` (lines 272, 303): `min-h-screen bg-slate-900 text-slate-100`, cards `bg-slate-800/85 border-slate-700/80`.
     - `Home.tsx` (line 566): `min-h-screen bg-[#080c0a] text-[#f5f7f6]`, header `bg-[#0b100d]/90`.
     - `PlayerRegistrationPage.tsx` (line 470): `min-h-screen bg-slate-900 text-slate-100 py-8`.
     - `FranchiseRegistrationPage.tsx` (line 478): `min-h-screen bg-slate-900 text-slate-100 py-8`.
     - `AdminDashboardPage.tsx` (line 608): `min-h-screen bg-[#080c0a] text-[#f5f7f6]`, sidebar `bg-[#090d0b]`.
     - `AdminAuctionPage.tsx` (line 147): `min-h-screen bg-slate-950 text-slate-200`.
     - `ProjectorPage.tsx` (line 187): `h-screen w-screen bg-[#04070e] text-slate-900`.
     - `ProtectedRoute.tsx` (lines 22, 53, 81, 152): all 4 route-guard screens render `bg-slate-950` and `bg-slate-900`.

3. **Escaped Unicode & Raw Emoji Occurrences**:
   - Ripgrep search (`\\u[0-9a-fA-F]{4}`) returned exactly 44 matches across 12 files in `acc-auction-portal/client/src`:
     - `StatsCricHeroesStep.tsx`: line 74 (`\u2713`, `\u2014`, `\u2019`), line 80 (`\u24D8`), line 124 (`\u24D8`), line 130 (`\u2192`), line 159 (`\u2212`), line 166 (`\u24D8`).
     - `ReferenceBasePriceStep.tsx`: line 120 (`\u24D8`), line 138 (`\u2014`).
     - `ProgressBar.tsx`: line 25 (`\u00B7`), line 65 (`\u2713`).
     - `IdentityStep.tsx`: line 76 (raw `✓`), line 117 (`\u26A0`), line 175 (`\u2691`).
     - `PhotoStep.tsx`: line 138 (raw `✓`), line 184 (raw `⚠`).
     - `ActionBar.tsx`: line 39 (`\u2190`), line 60 (`\u2192`), line 74 (`\u2192`).
     - `PlayerRegistrationPage.tsx`: line 419 (`\u00B7`).
     - `PlayerDashboardPage.tsx`: lines 172-174 (`\u00B7`, `\u2014`), line 188 (`\u00B7`), line 219 (`\uD83D\uDD12`), line 238 (`\u2691`), line 341 (`\u2022`), line 469 (`\u2713`).
     - `LoginPage.tsx`: lines 209, 319 (`\u00B7`), line 404 (`\u2192`), line 440 (`\u2192`), line 489 (`\u2022`), line 520 (`\u2190`), line 535 (`\u2715`).
     - `FranchiseRegistrationPage.tsx`: lines 423, 491, 759 (`\u00B7`), line 497 (`\u2190`), lines 557, 692, 711 (`\u2014`), line 928 (`\u2190`).
     - `FranchiseBiddingPage.tsx`: line 243 (`\u2713`), line 265 (`\u00B7`), lines 289, 416 (`\u26A0`).
     - `AdminAuctionPage.tsx`: line 422 (`\uD83D\uDD28`).
     - `ProtectedRoute.tsx`: line 60 (`\u00B7`).
   - `Acc-Auction-Os.html` has zero `\u[0-9a-fA-F]{4}` sequences.

4. **Registration Stepper Layout Bug**:
   - `PlayerRegistrationPage.tsx` defines 6 steps in `STEP_LABELS` (`['Identity', 'Photograph', 'Skill Profile', 'Stats & CricHeroes', 'Price & Reference', 'Google Account']`).
   - `ProgressBar.tsx` line 48 hardcodes `<div className="grid grid-cols-5 gap-1 mt-3">`, forcing step 6 to wrap onto a second row.

5. **Franchise Referred Draft Roll Input**:
   - `FranchiseRegistrationPage.tsx` lines 787-788 renders an unmanaged roll input without `.toUpperCase()` on typing, without caret preservation, and without live academic year classification feedback.

6. **Canvas Dark Fill in Photo Cropper**:
   - `PhotoStep.tsx` line 68 executes `ctx.fillStyle = '#0f172a'` on the 800x600 canvas before drawing the cropped player photo, embedding a dark slate background into uploaded images.

7. **Projector Contrast Bug**:
   - `ProjectorPage.tsx` lines 340-345 renders bottom ticker cards with `bg-[#0b1322] border-slate-200` containing `text-slate-900` text, causing near-invisible black-on-navy typography.

---

## 2. Logic Chain

1. **Root Semantic Token Propagation**:
   - Based on Observation 1, shadcn/ui components (`Card`, `DialogContent`, `DropdownMenuContent`, `SelectContent`) rely on CSS variables `--card`, `--background`, and `--popover`. Because `:root` hardcodes `#0e1114` and `#151a1f`, updating `:root` in `index.css` to `#F8FAFC`, `#FFFFFF`, `#0F172A`, and `#E2E8F0` immediately cascades light mode defaults to all shared UI primitives.
2. **Backdrop Transparency Fix**:
   - Based on Observation 2, `BlueAnimatedBackground` in `App.tsx` is functional but obscured by page-level opaque dark backgrounds (`bg-slate-900`, `bg-[#080c0a]`). Changing page wrappers to `bg-transparent` or `bg-slate-50/70` with frosted white glass cards (`bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl`) reveals the ambient sky background and enforces the ACC light theme without visual clipping.
3. **Deterministic Unicode Cleanup**:
   - Based on Observation 3, all 44 escaped Unicode sequences and raw emoji symbols map 1:1 to Lucide vector icons (`<Check />`, `<Info />`, `<ArrowRight />`, `<ArrowLeft />`, `<Minus />`, `<Lock />`, `<Flag />`, `<AlertTriangle />`, `<Gavel />`) and standard typography (`·`, `—`, `••••••••`). Eliminating them ensures clean cross-platform rendering and directly satisfies acceptance criterion 3 of R5.
4. **Registration Usability Alignment**:
   - Based on Observations 4 and 5, adjusting `ProgressBar.tsx` to `grid-cols-6` resolves the step 6 wrapping defect, and replicating the `useLayoutEffect` caret-stabilization from `IdentityStep.tsx` into `FranchiseRegistrationPage.tsx` prevents typing glitches when coordinators enter referred student roll numbers.
5. **Photo Output Integrity**:
   - Based on Observation 6, replacing `ctx.fillStyle = '#0f172a'` with `#FFFFFF` ensures exported 4:3 images do not contain dark borders or background artifacts on stadium displays.

---

## 3. Caveats

- **No Source Code Modifications**: As a Gen-2 Explorer, all findings are strictly read-only; no code files outside `.agents/teamwork/explorer_ux_survey_2/` were modified.
- **R2, R3, R4 Scoping**: While R2 (auth leakage), R3 (admin email/password setup), and R4 (photo editor controls) intersect with login and registration pages, this survey focused specifically on R1 (Theme) and R5 (Registration UX & Unicode). The implementation agent should coordinate with R2/R3/R4 blueprints when refactoring `LoginPage.tsx` and `PhotoStep.tsx`.
- **Existing Acceptance Suites**: Acceptance tests `tests/test_part_d_and_dashboard_acceptance.js` verify byte parity between `index.html` and `Acc-Auction-Os.html`. If Web OS files are touched, byte parity must be preserved.

---

## 4. Conclusion

The application's dark appearance is not an inherent architecture constraint but stems from hardcoded `:root` CSS variables in `index.css` and opaque dark background utility classes scattered across page wrappers. 

Enforcing the authoritative ACC light theme requires:
1. Rewriting `:root` in `index.css` to the ACC Light Token Palette (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#E2E8F0`, `#059669`).
2. Transforming page containers from opaque dark navy (`bg-slate-900`, `bg-[#080c0a]`, `bg-slate-950`) to light/translucent surfaces (`bg-transparent` / `bg-slate-50`, cards `bg-white/95 border-slate-200 shadow-xl`).
3. Replacing all 44 escaped Unicode strings with semantic Lucide icons or standard typography.
4. Adjusting `ProgressBar.tsx` to `grid-cols-6` and adding caret-stable roll number handling in Franchise registration.

A comprehensive file-by-file specification is authored at `B:\projects\ACC\.agents\teamwork\explorer_ux_survey_2\report.md`.

---

## 5. Verification Method

To independently verify the survey findings and validate future implementation:

1. **Verify Escaped Unicode Occurrences**:
   ```pwsh
   cd B:\projects\ACC
   # Should return 44 matches before cleanup, 0 after cleanup
   grep -rn '\\u[0-9a-fA-F]\{4\}' acc-auction-portal/client/src/
   ```

2. **Verify Automated Unit & Integration Tests**:
   ```pwsh
   cd B:\projects\ACC\acc-auction-portal
   pnpm test
   # Expected: 8 test files, 75 passed
   ```

3. **Verify TypeScript Compilation**:
   ```pwsh
   cd B:\projects\ACC\acc-auction-portal
   pnpm check
   # Expected: 0 errors
   ```

4. **Verify Production Build**:
   ```pwsh
   cd B:\projects\ACC\acc-auction-portal
   pnpm build
   # Expected: Exit code 0, bundles created in dist/
   ```

5. **Verify Acceptance & Byte Parity Test Suites**:
   ```pwsh
   cd B:\projects\ACC
   node tests/test_part_d_and_dashboard_acceptance.js
   # Expected: 47 passed, 0 failed, SHA-256 byte parity PASS
   node tests/test_section52_acceptance.js
   # Expected: 40 passed, 0 failed
   ```
