# ACC 2026 Architecture & UX Overhaul: Theme & Registration Survey Report

**Date**: 2026-10-02  
**Author**: Theme & UX Survey Explorer (Gen 2)  
**Target Applications**: `acc-auction-portal` (React 19 + Vite 7 + Tailwind CSS v4) & `Acc-Auction-Os.html` / `index.html`  
**Reference Specification**: `B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md` (Header `## 2026-10-02T05:09:24Z`, Requirements R1 & R5)

---

## 1. Executive Summary

This technical survey provides a comprehensive audit of the ACC 2026 frontend codebase for:
1. **R1: Global Light Theme Across All Surfaces**: Complete elimination of dark navy, dark slate, and dark charcoal backgrounds, cards, form controls, modals, and dropdowns, replacing them with the authoritative ACC Light Token Palette (`#F8FAFC`, `#FFFFFF`, clean borders `#E2E8F0`, soft shadows, ACC green/blue brand accents, and high-contrast typography `#0F172A`).
2. **R5: Registration Form UX & Unicode Cleanup**: Global catalog of all escaped Unicode sequences (`\u2192`, `\u2190`, `\u2699`, `\u2713`, etc.) and raw symbols, plus a detailed architectural evaluation of the multi-step Player and Franchise registration forms (stepper logic, field groupings, input focus states, and caret-stable roll-number inputs).

### Key Survey Findings:
- **Root Style Cause**: In `acc-auction-portal/client/src/index.css`, `:root` explicitly defines `--background: #0e1114`, `--card: #151a1f`, `--popover: #151a1f`, `--primary: #d4f34a` (neon lime), and `--border: rgba(214, 222, 215, 0.11)`. Because shadcn/ui components (`Card`, `Dialog`, `Select`, `DropdownMenu`, `Input`) directly consume these CSS variables, every component defaults to dark charcoal.
- **Surface Obstruction**: Although `App.tsx` renders `<BlueAnimatedBackground />` (`#d8e8fc` sky backdrop), major page components (`LoginPage.tsx`, `Home.tsx`, `PlayerRegistrationPage.tsx`, `FranchiseRegistrationPage.tsx`, `AdminAuctionPage.tsx`, `ProjectorPage.tsx`) use opaque dark wrappers (`min-h-screen bg-slate-900`, `bg-[#080c0a]`, `bg-slate-950`, `bg-[#04070e]`) that completely obscure the light background.
- **Escaped Unicode Count**: 44 escaped Unicode strings exist across 12 files in `acc-auction-portal/client/src`, plus numerous raw Unicode symbols (`✓`, `→`, `·`, `⚠`, `⚐`, `🔨`). Zero escaped Unicode sequences exist in `Acc-Auction-Os.html`.
- **Registration Stepper Bug**: In `ProgressBar.tsx`, line 48 hardcodes `<div className="grid grid-cols-5 gap-1 mt-3">`, but `PlayerRegistrationPage.tsx` defines 6 steps, causing step 6 to wrap onto a second row.
- **Franchise Draft Roll Input**: In `FranchiseRegistrationPage.tsx` (lines 787-788), the referred player draft roll input lacks uppercase auto-formatting, cursor stabilization, and inline validation.
- **Photo Canvas Dark Export**: In `PhotoStep.tsx` (line 68), the canvas context hardcodes `ctx.fillStyle = '#0f172a'`, baking a dark slate rectangle behind cropped images.
- **Projector Contrast Bug**: In `ProjectorPage.tsx` (lines 340-345), bottom 11-franchise ticker cards have `bg-[#0b1322]` with `text-slate-900` text (black text on dark navy background).

---

## 2. R1: Global Light Theme Architecture & Token Palette Audit

### 2.1 Authoritative ACC Light Token Palette

The authoritative ACC light design system enforces high-contrast, clean-room readability:

| Semantic Token | Authoritative Value | Former Dark Charcoal Value | Usage Context |
|---|---|---|---|
| `--background` | `#F8FAFC` (Slate 50) | `#0e1114` | Page background (allows sky backdrop to shimmer) |
| `--foreground` | `#0F172A` (Slate 900) | `#f4f1ea` | High-contrast body typography (WCAG AAA) |
| `--card` | `#FFFFFF` (Pure White) | `#151a1f` | Cards, panels, elevated surfaces |
| `--card-foreground` | `#0F172A` (Slate 900) | `#f4f1ea` | Headings, card text |
| `--popover` | `#FFFFFF` | `#151a1f` | Dropdown menus, selects, popovers, tooltips |
| `--popover-foreground` | `#0F172A` | `#f4f1ea` | Popover text |
| `--primary` | `#059669` (Emerald 600) | `#d4f34a` (Lime) | ACC Brand Green primary action buttons |
| `--primary-foreground`| `#FFFFFF` | `#151a1f` | Text on primary buttons |
| `--secondary` | `#F1F5F9` (Slate 100) | `#242c31` | Secondary buttons, subtle badges |
| `--secondary-foreground` | `#1E293B` (Slate 800) | `#f4f1ea` | Secondary text |
| `--muted` | `#F8FAFC` (Slate 50) | `#1d252a` | Table alternating rows, subtle backgrounds |
| `--muted-foreground` | `#64748B` (Slate 500) | `#8b9698` | Helper text, timestamps, labels |
| `--accent` | `#0284C7` (Sky 600) | `#ff9f43` (Orange)| ACC Blue brand accents, highlights |
| `--accent-foreground`| `#FFFFFF` | `#151a1f` | Text on accent elements |
| `--destructive` | `#EF4444` (Red 500) | `#ff6b5f` | Errors, destructive actions, cancel buttons |
| `--destructive-foreground` | `#FFFFFF` | `#151a1f` | Text on destructive buttons |
| `--border` | `#E2E8F0` (Slate 200) | `rgba(214,222,215,0.11)`| Crisp clean card and table dividers |
| `--input` | `#E2E8F0` (Slate 200) | `rgba(214,222,215,0.12)`| Input borders |
| `--ring` | `#10B981` (Emerald 500) | `#d4f34a` | Focus rings |
| `--radius` | `0.75rem` (12px) | `0.9rem` | Standard border radius |

### 2.2 Global Styling Files Audit

#### 1. `acc-auction-portal/client/src/index.css`
- **Current State**:
  - `@import "tailwindcss";` & `@import "tw-animate-css";`
  - Hardcoded `:root` CSS variables (lines 5-31) set dark theme.
  - `html { background: #0e1114; }`
  - `body { background: #0e1114; color: #f4f1ea; }`
  - `.soft-card` (lines 55-59): Dark gradient `linear-gradient(145deg, rgba(25,32,37,.96), rgba(15,19,23,.96))`.
- **Required Changes**:
  - Update all `:root` variables to the Authoritative ACC Light Token Palette.
  - Set `html { background: #F8FAFC; color: #0F172A; }`.
  - Set `body { background: #F8FAFC; color: #0F172A; }`.
  - Replace `.soft-card` with frosted glass light card:
    ```css
    .soft-card {
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(226, 232, 240, 0.85);
      box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.025);
    }
    ```

#### 2. `acc-auction-portal/client/index.html`
- **Current State**:
  - Line 6: `<meta name="theme-color" content="#0e1114" />`
- **Required Change**:
  - Update to `<meta name="theme-color" content="#F8FAFC" />`.

#### 3. `acc-auction-portal/client/src/main.tsx`
- **Current State**:
  - Lines 27-83: `ErrorBoundary` fallback renders dark `#0e1114` container and `#151a1f` card.
- **Required Change**:
  - Update inline styles to light theme (`background: "#F8FAFC"`, card `background: "#FFFFFF"`, border `"#E2E8F0"`, text `"#0F172A"`).

#### 4. `acc-auction-portal/client/src/components/BlueAnimatedBackground.tsx`
- **Current State**:
  - Renders `fixed inset-0` with video and `#d8e8fc url('/Blue-sky-2048x1166.svg')`.
- **Finding**:
  - The backdrop itself is light blue sky. It is obscured because parent page views use opaque dark wrappers. Making page views `bg-transparent` or `bg-slate-50/70` restores the intended Opal video backdrop effect.

---

## 3. Route & Page Level Surface Survey

### 3.1 Public Routes

#### 1. Home Page (`acc-auction-portal/client/src/pages/Home.tsx` — 2,267 lines)
- **Observations**:
  - Line 566: `<div className="min-h-screen bg-[#080c0a] text-[#f5f7f6] selection:bg-[#10b981]/30 selection:text-[#d4f34a] font-sans antialiased">`
  - Line 568: Header has `border-white/[0.08] bg-[#0b100d]/90`.
  - Line 595: Desktop navigation strip has `border-white/[0.08] bg-white/[0.03] text-[#93a59a]`.
  - Line 652: Mobile navigation strip has `bg-black/40 border-white/[0.06]`.
  - Sub-views rendered within Home:
    - `AdminControlRoom` (lines 796-1249): `bg-[#0e1411]`, `bg-[#131b16]`, `border-white/[0.08]`, `text-white`.
    - `StadiumProjectorDisplay` (lines 1250-1499): `bg-[#060a08]`, `bg-[#0b100d]`.
    - `FranchiseBiddingInterface` (lines 1500-1639): `bg-[#0b100d]`, `bg-[#121915]`.
    - `PublicLiveView` (lines 1640-1829): `bg-[#090d0b]`, `bg-[#111714]`.
    - `PlayerBoardView` (lines 1830-2019): Dark filter buttons, dark player cards.
    - `RegistrationRollParserView` (lines 2020-2159): Dark inputs and preview cards.
    - `ForensicUndoModal` (lines 2160-2219): Dark modal `bg-[#0d1310] border-white/10`.
    - `AcceptanceTestsModal` (lines 2220-2266): Dark modal `bg-[#0d1310] border-white/10`.
- **Required Transformation**:
  - Container: `min-h-screen bg-transparent text-slate-900`.
  - Header: `bg-white/90 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-xl`.
  - Navigation tabs: `bg-slate-100/80 border-slate-200 text-slate-600`, active `bg-emerald-600 text-white shadow-sm`.
  - Sub-views: Convert all cards to `bg-white/90 border-slate-200 shadow-sm text-slate-900`.
  - Modals: `bg-white border-slate-200 text-slate-900 shadow-2xl`.

#### 2. Public Header (`acc-auction-portal/client/src/App.tsx` — lines 21-62)
- **Observations**:
  - Line 24: `header className="border-b border-[var(--border)] bg-[var(--background)] p-4 sticky top-0 z-10 shadow-sm"`
  - Line 27: `text-white hover:opacity-90`
  - Line 30: `bg-white/5 border border-white/10 text-xs`
  - Line 37: `option value="2026" className="bg-slate-900 text-white"`
  - Line 44-50: `text-[var(--muted-foreground)] hover:text-white`
- **Required Transformation**:
  - Replace `bg-[var(--background)]` with `bg-white/90 backdrop-blur-md border-b border-slate-200`.
  - Change `text-white` to `text-slate-900`.
  - Edition selector: `bg-slate-100 border border-slate-200 text-slate-800`.
  - Nav links: `text-slate-600 hover:text-slate-900 font-semibold`.

#### 3. Public Live Page (`acc-auction-portal/client/src/pages/LiveAuctionPage.tsx`)
- **Observations**:
  - Container is `bg-slate-50 text-slate-900`.
  - Header is `bg-white/95 border-slate-200/80`.
  - Remaining dark tokens: Line 384 (`bg-slate-800 text-amber-400 border border-slate-300`), Line 399 (`bg-slate-900`), Line 605 (`bg-slate-800 text-slate-600`).
- **Required Transformation**:
  - Clean up leftover dark pills and badges; ensure cards maintain soft shadows and clean borders.

#### 4. Player & Teams Boards (`PlayerBoardPage.tsx`, `TeamsBoardPage.tsx`)
- **Observations**:
  - Containers are `bg-slate-50 text-slate-900`.
  - In `PlayerBoardPage.tsx`: Line 230 has `bg-slate-800 hover:bg-slate-700 text-slate-300` for clear button.
  - In `TeamsBoardPage.tsx`: Minor dark slate tags.
- **Required Transformation**:
  - Convert clear/filter buttons to `bg-white hover:bg-slate-100 text-slate-700 border border-slate-200`.

---

### 3.2 Authentication & Protected Route Surrounds

#### 1. Login Page (`acc-auction-portal/client/src/pages/LoginPage.tsx` — 593 lines)
- **Observations**:
  - Suspended Screen (Line 272): `min-h-screen bg-slate-900 text-slate-100`, card `bg-slate-800/90 border-slate-700/80`.
  - Main Login Container (Line 303): `min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center`.
  - Main Card (Line 324): `backdrop-blur-2xl bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50`.
  - Tab Switcher (Line 326): `bg-slate-900/80 border border-slate-700/50`. Unselected buttons have `hover:bg-slate-800/60`.
  - Admin Inputs (Lines 467, 492): `bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500`.
  - Forgot Password Modal (Line 527): `bg-black/80 backdrop-blur-md`, modal card `bg-slate-800 border border-slate-700 text-white`.
- **Required Transformation**:
  - Container: `min-h-screen bg-transparent flex flex-col items-center justify-center p-4 md:p-6 font-sans`.
  - Card: `backdrop-blur-xl bg-white/95 border border-slate-200 shadow-xl rounded-3xl p-6 md:p-8 space-y-6 text-slate-900`.
  - Tab Switcher: `bg-slate-100 border border-slate-200 p-1.5 rounded-2xl`. Unselected buttons: `text-slate-600 hover:bg-white hover:text-slate-900`.
  - Form Inputs: `bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 shadow-xs`.
  - Modal: `bg-black/40 backdrop-blur-sm`, dialog card `bg-white border border-slate-200 text-slate-900 shadow-2xl`.

#### 2. Route Guard Surrounds (`acc-auction-portal/client/src/components/ProtectedRoute.tsx` — 191 lines)
- **Observations**:
  - Line 22 (Loading): `bg-slate-900`, pulse blocks `bg-white/10`.
  - Line 53 (Account Suspended): `bg-slate-950`, card `bg-slate-900 border-red-900/50`, button `bg-slate-800`.
  - Line 81 (Account Pending Approval): `bg-slate-950`, card `bg-slate-900 border-slate-800`, inner dossier `bg-slate-950`, button `bg-slate-800`.
  - Line 152 (Access Denied / Role Mismatch): `bg-slate-950`, card `bg-slate-900 border-slate-800`, inner dossier `bg-slate-950`, button `bg-slate-800`.
- **Required Transformation**:
  - Convert all 4 boundary screens to light theme:
    - Outer container: `bg-slate-50/80 text-slate-900`.
    - Card: `bg-white border border-slate-200 rounded-3xl shadow-xl p-8`.
    - Inner dossier preview: `bg-slate-50 border border-slate-200 text-slate-700`.
    - Secondary buttons: `bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200`.

---

### 3.3 Registration Portals

#### 1. Player Registration (`PlayerRegistrationPage.tsx` & `components/registration/*`)
- **Observations**:
  - Container (Line 470): `min-h-screen bg-slate-900 text-slate-100 py-8 px-4 md:px-8 font-sans transition-colors`.
  - Success screen (Line 411): `min-h-screen bg-slate-900 text-slate-100`, cards `bg-slate-800/90`, `bg-slate-900/80`.
  - Card surface (Line 488): `backdrop-blur-2xl bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl`.
  - Step 6 preview (Line 568): `bg-slate-900/80 border border-slate-700`.
  - Step Components:
    - `ProgressBar.tsx`: `dark:bg-slate-800`, `dark:text-slate-100`.
    - `IdentityStep.tsx`: `dark:bg-slate-900/60`, `dark:border-slate-700`.
    - `PhotoStep.tsx`: `dark:bg-slate-900/40`, canvas `ctx.fillStyle = '#0f172a'`, crop modal `bg-[#0e1411] border-white/10`.
    - `SkillProfileStep.tsx`: `dark:bg-slate-900/50`, `dark:bg-slate-800`.
    - `StatsCricHeroesStep.tsx`: `dark:bg-slate-900/50`, `dark:bg-slate-800`.
    - `ReferenceBasePriceStep.tsx`: `dark:bg-slate-900/50`, `dark:bg-slate-800`.
    - `ActionBar.tsx`: `dark:bg-slate-900/90`, `dark:border-slate-800`.
- **Required Transformation**:
  - Outer page container: `min-h-screen bg-transparent py-8 px-4 md:px-8 text-slate-900`.
  - Card: `backdrop-blur-xl bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl p-6 md:p-8 text-slate-900`.
  - Step components: Remove all `dark:*` classes, set input backgrounds to pure white with `border-slate-300`, set focus states to `focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`.

#### 2. Franchise Registration (`FranchiseRegistrationPage.tsx` — 957 lines)
- **Observations**:
  - Container (Line 478): `min-h-screen bg-slate-900 text-slate-100 py-8 px-4 md:px-8`.
  - Success screen (Line 417): `min-h-screen bg-slate-900 text-slate-100`, cards `bg-slate-800/90`, `bg-slate-900/80`.
  - Step cards (Line 538): `bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl`.
  - Form selects & inputs (e.g. Line 552): `bg-slate-900/70 border border-slate-700 text-white`.
  - Step tabs (Line 524): `bg-slate-900/50 border-slate-800 text-slate-500`.
  - Bottom action bar (Line 926): `bg-slate-800 hover:bg-slate-700 text-slate-300`.
- **Required Transformation**:
  - Container: `min-h-screen bg-transparent py-8 px-4 md:px-8 text-slate-900`.
  - Card: `backdrop-blur-xl bg-white/95 border border-slate-200 shadow-xl rounded-3xl p-6 md:p-8 text-slate-900`.
  - Selects & inputs: `bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500`.
  - Step tabs: `bg-slate-100 border-slate-200 text-slate-600`, active `bg-blue-600 text-white shadow-sm`.
  - Previous button: `bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300`.

---

### 3.4 Dashboards & Command Surfaces

#### 1. Player Dashboard (`PlayerDashboardPage.tsx` — 492 lines)
- **Observations**:
  - Line 158: `min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans`.
  - Line 160: `bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800`.
  - Lines 206, 245, etc.: `bg-white/70 dark:bg-slate-900/70 border-white/60 dark:border-white/10`.
  - Discrepancy modal: `dark:bg-slate-900 dark:border-slate-800`.
- **Required Transformation**:
  - Strip all `dark:*` prefixes across the entire file.
  - Enforce pure light styling: `bg-slate-50`, cards `bg-white/90 border-slate-200 shadow-sm text-slate-900`.

#### 2. Franchise Dashboard & Bidding (`FranchiseBiddingPage.tsx` & `App.tsx` FranchiseDashboardPage)
- **Observations**:
  - In `App.tsx` (Line 113): `min-h-screen bg-[var(--background)]`, `text-white`, `bg-[var(--card)]`.
  - In `FranchiseBiddingPage.tsx`: Line 239 has `bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`.
  - Bidding panels (Line 339, 376, 422): `bg-white/80 dark:bg-slate-900/85 border-white/60 dark:border-white/10`.
  - Pass/Re-enter button (Line 406): `bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700`.
- **Required Transformation**:
  - In `App.tsx`: Replace `bg-[var(--background)]` and `text-white` with `bg-slate-50` and `text-slate-900`.
  - In `FranchiseBiddingPage.tsx`: Strip all `dark:*` classes, enforce `bg-white border-slate-200 shadow-md`.

#### 3. Admin Dashboard Page (`AdminDashboardPage.tsx` — 2,172 lines)
- **Observations**:
  - Line 608: `<div className="min-h-screen bg-[#080c0a] text-[#f5f7f6] flex flex-col font-sans antialiased">`.
  - Line 624: Top Header: `h-16 border-b border-white/[0.08] bg-[#0b100d] px-4 lg:px-6`.
  - Line 678: Aside Sidebar: `w-64 bg-[#090d0b] border-r border-white/[0.08]`.
  - Line 698: Aside Nav Buttons: `text-slate-400 hover:bg-white/5 hover:text-white`.
  - Every workspace view (Overview, Players table, Verification queue, Franchise manager, Audit timeline, Settings) uses dark backgrounds: `bg-[#0e1411]`, `bg-[#131b16]`, `border-white/[0.08]`, `text-white`.
- **Required Transformation**:
  - Root container: `min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans`.
  - Header: `bg-white border-b border-slate-200 text-slate-900 shadow-xs`.
  - Sidebar: `bg-white border-r border-slate-200 text-slate-700`.
  - Sidebar Nav Buttons: `text-slate-600 hover:bg-slate-100 hover:text-slate-900`, active `bg-emerald-600 text-white shadow-sm`.
  - Content Cards & Tables: `bg-white border-slate-200 shadow-sm text-slate-900`, table headers `bg-slate-50 text-slate-700 font-semibold`, alternating rows `hover:bg-slate-50/80`.

#### 4. Admin Live Dashboard (`AdminLiveDashboard.tsx` — 1,901 lines)
- **Observations**:
  - Container is `bg-slate-100 text-slate-900`.
  - Header is `bg-white border-slate-200`.
  - Leftover dark tokens: Lines 946, 1172, 1187, 1195, 1211 use `bg-slate-800 hover:bg-slate-700 text-slate-200`, `bg-red-950/40 text-red-300`, `bg-amber-950/30`, `bg-emerald-950/40`.
- **Required Transformation**:
  - Replace leftover dark button/pill styles with clean light classes: `bg-white hover:bg-slate-100 text-slate-800 border-slate-300`, soft alert badges (`bg-red-50 text-red-700 border-red-200`, `bg-emerald-50 text-emerald-700 border-emerald-200`).

#### 5. Admin Auction Page (`AdminAuctionPage.tsx` — 464 lines)
- **Observations**:
  - Line 147: `min-h-screen bg-slate-950 text-slate-200 font-inter p-4 flex flex-col`.
  - Lines 188, 224, 241, 271, 304, 324: `border border-slate-800 bg-slate-900 rounded-lg`.
  - Action buttons (Line 256): `border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200`.
  - Modals (Lines 354, 419): `bg-slate-900 border border-slate-700`.
- **Required Transformation**:
  - Container: `min-h-screen bg-slate-50 text-slate-900 font-inter p-4 flex flex-col`.
  - Panels: `border border-slate-200 bg-white rounded-lg shadow-sm text-slate-900`.
  - Action buttons: `border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold`.
  - Modals: `bg-white border border-slate-200 shadow-2xl text-slate-900`.

#### 6. Projector Page (`ProjectorPage.tsx` — 366 lines)
- **Observations**:
  - Line 187: `<div className="h-screen w-screen bg-[#04070e] text-slate-900 font-sans overflow-hidden flex flex-col justify-between select-none">`.
  - Line 227: Fullscreen button has `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-300`.
  - Line 248: Lot badge has `bg-black/80 text-amber-400`.
  - Line 340: Bottom 11-franchise ticker cards have `bg-[#0b1322] border-slate-200` with `text-slate-900` text (black text on dark navy background!).
- **Required Transformation**:
  - Container: `h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans`.
  - Fullscreen button: `bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs`.
  - Lot badge: `bg-emerald-600 text-white font-bold`.
  - Ticker strip cards: `bg-slate-50 border-slate-200 text-slate-900`, leader card `bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 text-amber-950`.

---

## 4. R5: Escaped Unicode Sequences Audit & Replacement Matrix

A ripgrep search (`\\u[0-9a-fA-F]{4}`) across the repository identified 44 escaped Unicode occurrences in 12 source files, in addition to several raw Unicode symbols (`✓`, `→`, `·`, `⚠`, `⚐`, `🔨`).

### 4.1 Master Unicode Elimination Catalog

| # | File Path | Line | Token | Raw Character & Meaning | Recommended Replacement |
|---|---|---|---|---|---|
| 1 | `components/registration/StatsCricHeroesStep.tsx` | 74 | `\u2713` | `✓` (Check mark) | `<Check className="w-4 h-4 mr-1.5 inline text-emerald-600" />` |
| 2 | `components/registration/StatsCricHeroesStep.tsx` | 74 | `\u2014` | `—` (Em dash) | Typographic em dash `—` or `--` |
| 3 | `components/registration/StatsCricHeroesStep.tsx` | 74 | `\u2019` | `’` (Right single quote) | Standard ASCII `'` |
| 4 | `components/registration/StatsCricHeroesStep.tsx` | 80 | `\u24D8` | `ⓘ` (Circled small i) | `<Info className="w-4 h-4 mr-1.5 inline text-amber-600" />` |
| 5 | `components/registration/StatsCricHeroesStep.tsx` | 124 | `\u24D8` | `ⓘ` (Circled small i) | `<HelpCircle className="w-4 h-4 mr-1.5 inline text-emerald-600" />` |
| 6 | `components/registration/StatsCricHeroesStep.tsx` | 130 | `\u2192` | `→` (Right arrow) | `<ChevronRight className="w-3.5 h-3.5 inline mx-1 text-slate-400" />` |
| 7 | `components/registration/StatsCricHeroesStep.tsx` | 159 | `\u2212` | `−` (Minus sign) | `<Minus className="w-4 h-4" />` |
| 8 | `components/registration/StatsCricHeroesStep.tsx` | 166 | `\u24D8` | `ⓘ` (Circled small i) | `<Info className="w-4 h-4 mr-1.5 inline text-slate-500" />` |
| 9 | `components/registration/ReferenceBasePriceStep.tsx` | 120 | `\u24D8` | `ⓘ` (Circled small i) | `<Info className="w-4 h-4 mr-1.5 inline text-slate-500" />` |
| 10 | `components/registration/ReferenceBasePriceStep.tsx` | 138 | `\u2014` | `—` (Em dash) | Typographic em dash `—` |
| 11 | `components/registration/ProgressBar.tsx` | 25 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 12 | `components/registration/ProgressBar.tsx` | 65 | `\u2713` | `✓` (Check mark) | `<Check className="w-3.5 h-3.5 stroke-[3]" />` |
| 13 | `components/registration/IdentityStep.tsx` | 76 | `✓` (Raw) | `✓` (Check mark) | `<Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />` |
| 14 | `components/registration/IdentityStep.tsx` | 117 | `\u26A0` | `⚠` (Warning sign) | `<AlertTriangle className="w-4 h-4 mr-1.5 inline text-red-500" />` |
| 15 | `components/registration/IdentityStep.tsx` | 175 | `\u2691` | `⚑` (Black flag) | `<Flag className="w-4 h-4 mr-1.5 inline text-amber-500" />` |
| 16 | `components/registration/PhotoStep.tsx` | 138 | `✓` (Raw) | `✓` (Check mark) | `<Check className="w-4 h-4 mr-1.5 inline text-emerald-600" />` |
| 17 | `components/registration/PhotoStep.tsx` | 184 | `⚠` (Raw) | `⚠` (Warning sign) | `<AlertTriangle className="w-4 h-4 mr-1.5 inline text-red-500" />` |
| 18 | `components/registration/ActionBar.tsx` | 39 | `\u2190` | `←` (Left arrow) | `<ArrowLeft className="w-4 h-4 mr-2" /> Back` |
| 19 | `components/registration/ActionBar.tsx` | 60 | `\u2192` | `→` (Right arrow) | `Submit Registration <ArrowRight className="w-4 h-4 ml-2" />` |
| 20 | `components/registration/ActionBar.tsx` | 74 | `\u2192` | `→` (Right arrow) | `Continue <ArrowRight className="w-4 h-4 ml-2" />` |
| 21 | `pages/PlayerRegistrationPage.tsx` | 419 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 22 | `pages/PlayerDashboardPage.tsx` | 172-174 | `\u00B7`, `\u2014` | `·`, `—` | Typographic interpunct `·`, em dash `—` |
| 23 | `pages/PlayerDashboardPage.tsx` | 188 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 24 | `pages/PlayerDashboardPage.tsx` | 219 | `\uD83D\uDD12` | `🔒` (Lock emoji) | `<Lock className="w-3.5 h-3.5 mr-1.5 inline" />` |
| 25 | `pages/PlayerDashboardPage.tsx` | 238 | `\u2691` | `⚑` (Black flag) | `<Flag className="w-3.5 h-3.5 mr-1.5 inline" />` |
| 26 | `pages/PlayerDashboardPage.tsx` | 341 | `\u2022` | `•` (Bullet) | Standard bullet `••••••` |
| 27 | `pages/PlayerDashboardPage.tsx` | 469 | `\u2713` | `✓` (Check mark) | `<CheckCircle2 className="w-4 h-4 mr-1.5 inline text-emerald-600" />` |
| 28 | `pages/LoginPage.tsx` | 209, 319 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 29 | `pages/LoginPage.tsx` | 404 | `\u2192` | `→` (Right arrow) | `Register for ACC 2026 <ArrowRight className="w-3.5 h-3.5 ml-1" />` |
| 30 | `pages/LoginPage.tsx` | 440 | `\u2192` | `→` (Right arrow) | `Register Departmental Franchise <ArrowRight className="w-3.5 h-3.5 ml-1" />` |
| 31 | `pages/LoginPage.tsx` | 489 | `\u2022` | `•` (Bullet) | `placeholder="••••••••"` |
| 32 | `pages/LoginPage.tsx` | 520 | `\u2190` | `←` (Left arrow) | `<ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Public Home` |
| 33 | `pages/LoginPage.tsx` | 535 | `\u2715` | `✕` (Multiplication X) | `<X className="w-4 h-4" />` |
| 34 | `pages/FranchiseRegistrationPage.tsx` | 423, 491, 759 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 35 | `pages/FranchiseRegistrationPage.tsx` | 497, 928 | `\u2190` | `←` (Left arrow) | `<ArrowLeft className="w-3.5 h-3.5 mr-1" />` |
| 36 | `pages/FranchiseRegistrationPage.tsx` | 557, 692, 711 | `\u2014` | `—` (Em dash) | Typographic em dash `—` |
| 37 | `pages/FranchiseBiddingPage.tsx` | 243 | `\u2713` | `✓` (Check mark) | `<Check className="w-4 h-4 text-emerald-600" />` |
| 38 | `pages/FranchiseBiddingPage.tsx` | 265 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |
| 39 | `pages/FranchiseBiddingPage.tsx` | 289, 416 | `\u26A0` | `⚠` (Warning sign) | `<AlertTriangle className="w-4 h-4 mr-1.5 inline text-amber-500" />` |
| 40 | `pages/AdminAuctionPage.tsx` | 422 | `\uD83D\uDD28` | `🔨` (Hammer emoji) | `<Gavel className="w-6 h-6 text-amber-500" />` |
| 41 | `components/ProtectedRoute.tsx` | 60 | `\u00B7` | `·` (Middle dot) | Typographic interpunct `·` |

---

## 5. R5: Multi-Step Registration Forms Deep Dive

### 5.1 Player Registration Form Audit (`PlayerRegistrationPage.tsx` + `components/registration/*`)

#### 1. Stepper Architecture & Grid Bug
- **Current Flow**: 6 Steps:
  1. `Identity`
  2. `Photograph`
  3. `Skill Profile`
  4. `Stats & CricHeroes`
  5. `Price & Reference`
  6. `Google Account`
- **Defect in `ProgressBar.tsx`**:
  - Line 48: `<div className="grid grid-cols-5 gap-1 mt-3">`
  - When 6 step labels are rendered, the 6th element wraps onto a second row, misaligning step labels with the progress bar.
- **Fix**: Update container to `<div className="grid grid-cols-6 gap-1 mt-3">` with responsive truncation:
  ```tsx
  <div className="grid grid-cols-6 gap-1.5 mt-3">
    {stepLabels.map((label, idx) => { ... })}
  </div>
  ```

#### 2. Step 1: Student Identity & Roll Number Input (`IdentityStep.tsx`)
- **Roll Number Handling**:
  - Uses `rollInputRef` and `cursorRef` with `useLayoutEffect` to maintain caret position during uppercase conversion.
  - Calls `useRollParser(rollNumber, 2026)` to classify B.Tech Regular, B.Tech Lateral, Polytechnic Diploma, or PG unbucketed.
  - Live classification preview card immediately reflects Academic Bucket (`B1`-`B5`), Program, Branch, and Study Year.
- **Focus States & Light Styling**:
  - Current input: `bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`.
  - Fix: Standardize to `bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-xs`.

#### 3. Step 2: Player Photograph (`PhotoStep.tsx`)
- **Current Limitations**:
  - Line 68 hardcodes `ctx.fillStyle = '#0f172a'` on the 800x600 canvas.
  - Lacks aspect ratio presets (4:3 default, optional 1:1), pan/drag gesture handler, rotation, reset, fit, and fill controls.
  - Modal uses dark theme `bg-[#0e1411] border-white/10`.
- **Requirements for R4/R5 Integration**:
  - Canvas background should fill with `#FFFFFF` or maintain transparency.
  - Interactive crop container must support mouse/touch pan/drag, rotation (+90°), zoom slider (1x - 3x), and preset aspect ratio pills (4:3 and 1:1).
  - Modal styling must be light-themed: `bg-white border-slate-200 shadow-2xl text-slate-900`.

#### 4. Step 3: Cricket Skill Profile (`SkillProfileStep.tsx`)
- **Questionnaire Logic**:
  - Section A (Batting): Yes/No skilled batter selector. Batting arm (Right/Left) is always required. Batting style (`ROTATOR`, `AGGRESSIVE`, `BIG_HITTER`) and Preferred position (`OPENER`, `TOP_ORDER`, `MIDDLE_ORDER`, `FINISHER`) conditionally reveal when `isBatter === true`.
  - Section B (Bowling): Yes/No skilled bowler selector. Bowling arm (Right/Left) and discipline (`FAST`, `SPIN`) conditionally reveal when `isBowler === true`.
  - Section C (Wicket Keeping): Yes/No specialized keeper selector.
  - Live preview derives role (`WICKET_KEEPER_BATTER`, `WICKET_KEEPER`, `ALL_ROUNDER`, `BATTER`, `BOWLER`, `FIELDER`) via `derivePlayerType`.
- **Styling Fix**: Remove all `dark:*` classes, set option pills to `bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800`, selected pills to `bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold`.

#### 5. Step 4: Stats & CricHeroes (`StatsCricHeroesStep.tsx`)
- **Non-blocking Flow**:
  - Allows entering CricHeroes Profile URL and registered mobile.
  - Toggle button: `[ SKIP FOR NOW — I'LL ADD LATER ]` sets `cricHeroesPending: true`, allowing registration to proceed without blocking.
  - Expandable Career Cricket Statistics accordion for self-declared metrics.
- **Styling Fix**: Remove all `dark:*` classes and Unicode escapes (`\u2713`, `\u24D8`, `\u2192`, `\u2212`).

#### 6. Step 5: Reference Declaration & Base Price Ladder (`ReferenceBasePriceStep.tsx`)
- **Business Logic**:
  - Reference declaration is conditionally visible only if `isReferenceEligible` is true (fresh admission year 2026).
  - Base price selection strictly constrained to the 16 authorized ladder steps in `BASE_PRICE_LADDER` (20 to 250).
- **Styling Fix**: Remove all `dark:*` classes, replace `\u24D8` with Lucide `<Info />`, replace `\u2014` with em dash.

#### 7. Step 6: Google Account Review & Action Bar (`ActionBar.tsx`)
- **Action Bar**:
  - Sticky bottom bar: `bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg`.
  - Replace `\u2190 BACK` with Lucide `<ArrowLeft className="w-4 h-4 mr-2" /> Back`.
  - Replace `CONTINUE \u2192` with `Continue <ArrowRight className="w-4 h-4 ml-2" />`.

---

### 5.2 Franchise Registration Form Audit (`FranchiseRegistrationPage.tsx`)

#### 1. Stepper Architecture
- 6 Steps:
  1. `Team Info`
  2. `Coordinator`
  3. `Leadership`
  4. `Referred`
  5. `Google Account`
  6. `Review & Submit`
- Stepper header grid: `<div className="grid grid-cols-3 md:grid-cols-6 gap-2">`.

#### 2. Step 4: Referred Players & Roll Number Caret Stability Defect
- **Observation**:
  - Lines 787-788 render:
    ```tsx
    <input
      type="text"
      placeholder="e.g. 26811A0501"
      value={referredDraft.rollNumber}
      onChange={(e) => setReferredDraft(p => ({ ...p, rollNumber: e.target.value }))}
      className="w-full min-h-[44px] px-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs font-mono text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    ```
- **Defects Identified**:
  1. Dark styling: `bg-slate-900/70 border-slate-700 text-white`.
  2. Unstable caret: Although styled with CSS `uppercase`, the raw state variable contains lowercase characters until submitted. When calling `.toUpperCase()`, React loses caret position if not stabilized with a ref and selection range.
  3. Missing live validation: Does not indicate whether the draft roll number matches academic year 2026 for reference eligibility.
- **Recommended Implementation**:
  - Mirror the caret-stabilization pattern from `IdentityStep.tsx`:
    ```tsx
    const refRollCursor = useRef<number | null>(null);
    const handleReferredRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      refRollCursor.current = e.target.selectionStart;
      const upper = e.target.value.toUpperCase();
      setReferredDraft(p => ({ ...p, rollNumber: upper }));
    };
    ```

---

## 6. Implementation Checklist & Risk Management

### 6.1 Exact Changes Required by Requirement

#### R1: Global Light Theme
- [ ] Update `acc-auction-portal/client/src/index.css`: Replace dark `:root` tokens with Authoritative ACC Light Token Palette (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#E2E8F0`, etc.). Update `.soft-card`, `html`, `body`.
- [ ] Update `acc-auction-portal/client/index.html`: Set `<meta name="theme-color" content="#F8FAFC" />`.
- [ ] Update `acc-auction-portal/client/src/main.tsx`: Set `ErrorBoundary` fallback to light theme.
- [ ] Update `acc-auction-portal/client/src/App.tsx`: Light theme for `PublicHeader`, `PlayerProfilePage`, `FranchiseDashboardPage`, and 404 route.
- [ ] Update `acc-auction-portal/client/src/pages/Home.tsx`: Remove dark wrappers, convert all 6 subcomponents and 2 modals to light glassmorphism.
- [ ] Update `acc-auction-portal/client/src/pages/LoginPage.tsx`: Replace dark cards, inputs, and modal with white cards, light borders, and high-contrast labels.
- [ ] Update `acc-auction-portal/client/src/pages/PlayerRegistrationPage.tsx` & `components/registration/*`: Remove all `dark:*` classes, set light cards and high-contrast inputs.
- [ ] Update `acc-auction-portal/client/src/pages/FranchiseRegistrationPage.tsx`: Light cards, white selects/inputs, light progress indicators.
- [ ] Update `acc-auction-portal/client/src/pages/PlayerDashboardPage.tsx`: Strip all `dark:*` classes, ensure all stats cards and discrepancy modal are light-themed.
- [ ] Update `acc-auction-portal/client/src/pages/FranchiseBiddingPage.tsx`: Strip all `dark:*` classes, light cards, clear status tags.
- [ ] Update `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx`: Convert root from `bg-[#080c0a]` to `bg-slate-50`, header/sidebar to white, tables/cards to light theme.
- [ ] Update `acc-auction-portal/client/src/pages/AdminLiveDashboard.tsx`: Clean up residual dark button and badge tokens.
- [ ] Update `acc-auction-portal/client/src/pages/AdminAuctionPage.tsx`: Convert from `bg-slate-950` to `bg-slate-50`, white panels, light action buttons.
- [ ] Update `acc-auction-portal/client/src/pages/ProjectorPage.tsx`: Convert container from `bg-[#04070e]` to `bg-[#F8FAFC]`, fix contrast bug on 11-franchise bottom ticker cards.
- [ ] Update `acc-auction-portal/client/src/components/ProtectedRoute.tsx`: Convert Loading, Suspended, Pending Approval, and Access Denied screens to light theme.

#### R5: Unicode Cleanup & Registration Form UX
- [ ] Replace all 44 escaped Unicode sequences across the 12 files listed in Section 4 with semantic Lucide icons or standard typography.
- [ ] In `ProgressBar.tsx`: Fix column grid from `grid-cols-5` to `grid-cols-6` to fit all 6 steps.
- [ ] In `IdentityStep.tsx`: Add explicit high-contrast focus ring (`focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600`).
- [ ] In `FranchiseRegistrationPage.tsx`: Add caret-stable roll number input with uppercase transformation for referred player draft.
- [ ] In `PhotoStep.tsx`: Change canvas background fill from `#0f172a` to `#FFFFFF` and convert crop modal to light theme.

### 6.2 Verification & Regression Defense
- Run Vitest test suite: `pnpm test` (all 75 tests must pass).
- Run TypeScript compilation: `pnpm check` (0 errors).
- Run production build: `pnpm build` (build must succeed and `sync-dist.js` must update `dist/`).
- Run root acceptance tests:
  - `node tests/test_part_d_and_dashboard_acceptance.js` (47 tests pass, byte parity verified).
  - `node tests/test_section52_acceptance.js` (40 tests pass).
- Verify zero regression in bidding engine, roll number parsing, player type derivation, and Firestore security rules.
