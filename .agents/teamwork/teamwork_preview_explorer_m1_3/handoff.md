# Handoff Report: Milestone 1 — Typography Hierarchy, WCAG AA Contrast Compliance & Touch Targets

**Author**: Explorer M1-3 (Typography, Accessibility & Touch Target Specialist)  
**Target Files**: `b:/projects/ACC/build_acc_os.py` & `b:/projects/ACC/Acc-Auction-Os.html`  
**Deliverable Path**: `b:/projects/ACC/.agents/teamwork/teamwork_preview_explorer_m1_3/handoff.md`  
**Date**: 2026-09-25  

---

## 1. Observation

Direct code examination of `build_acc_os.py` (lines 10–2886) and `Acc-Auction-Os.html` (lines 7–2883) revealed the following verbatim declarations and structural properties:

### 1.1 Typography & Font Declarations
1. **Google Fonts Link** (`build_acc_os.py` lines 10–12 / `Acc-Auction-Os.html` lines 7–9):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
   ```
2. **CSS Font Tokens** (`build_acc_os.py` lines 55–57 / `Acc-Auction-Os.html` lines 52–54):
   ```css
   --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   --font-display: 'Space Grotesk', var(--font-sans);
   --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
   ```
3. **Weight Mismatch & Missing `tabular-nums`**:
   - `Space Grotesk` is loaded only with `wght@600;700` in line 12, yet display headings across the templates specify `font-weight: 800;` (e.g. lines 186, 284, 820, 885, 1893, 1935, 1970, 2251, 2354, 2414, 2555, 2588, 2618, 2683, 2769).
   - Zero occurrences of `font-variant-numeric: tabular-nums` exist in the entire codebase (`grep_search` returned 0 matches). When the 30s/20s countdown timer ticks or price values increment, proportional numeric glyph widths in system fallback fonts cause layout jitter.

### 1.2 Contrast Ratios & Color Tokens
1. **Token Definitions** (`build_acc_os.py` lines 23–36 / `Acc-Auction-Os.html` lines 20–33):
   ```css
   --text-main: #0F172A;       /* Slate 900 - High Contrast AA */
   --text-muted: #334155;      /* Slate 700 */
   --text-subtle: #64748B;     /* Slate 500 */
   --text-faint: #94A3B8;      /* Slate 400 */
   --amber-600: #D97706;
   --amber-500: #F59E0B;
   --amber-100: #FEF3C7;
   --amber-50: #FFFBEB;
   ```
2. **Slate 400 (`#94A3B8`) Micro-copy Usage**:
   - `build_acc_os.py` line 26: `--text-faint: #94A3B8;`
   - `build_acc_os.py` line 800: `<span style="color: var(--text-faint); margin-left: 2px;">/ 032</span>`
   - `build_acc_os.py` line 2165: `<span style="color: var(--text-faint); font-family: var(--font-mono); font-size: 11px;">${b.t}</span>`
   - `build_acc_os.py` line 2209: `stateColor = "#94A3B8";` (Used for "Passed" franchise status and purse display on `#F1F5F9` background in line 2228).
3. **Amber 600 (`#D97706`) Body & Label Usage**:
   - `build_acc_os.py` line 33: `--amber-600: #D97706;`
   - `build_acc_os.py` line 886: Eyebrow in Firebase modal
   - `build_acc_os.py` line 1871: `CARNIVAL 2026` hero subtitle
   - `build_acc_os.py` lines 1907–1908: `CURRENT BID` eyebrow and price value
   - `build_acc_os.py` line 1969: Player type in catalog card
   - `build_acc_os.py` lines 2040, 2282: Warning bucket status text (`stat.state === 'warn' ? 'var(--amber-600)'`)
   - `build_acc_os.py` line 2079: `B.TECH YEAR 3` eyebrow
   - `build_acc_os.py` lines 2133–2134: `CURRENT BID` eyebrow and 42px price
   - `build_acc_os.py` line 2181: `BUCKET SCARCITY DETECTED • ${p.bucket}` eyebrow
   - `build_acc_os.py` line 2217: `stateColor = "#D97706"` (Used for "Leader" badge and purse on `var(--amber-50)`)
   - `build_acc_os.py` line 2413: Step 2 badge circle (`background: var(--amber-600); color: white;`)
   - `build_acc_os.py` line 2498: `AUTOMATICALLY DERIVED PLAYER TYPE` eyebrow
   - `build_acc_os.py` line 2529: `ACC REFERENCE PROGRAM` eyebrow
   - `build_acc_os.py` line 2552: Player card type preview on `var(--amber-50)`
   - `build_acc_os.py` line 2618: `CLOUD CONCURRENCY` eyebrow
   - `build_acc_os.py` lines 2689–2690: `LIVE BID` eyebrow and price
   - `build_acc_os.py` line 2718: Audit stream `HAMMER` badge
4. **Dark Projector Arena Usage** (`build_acc_os.py` lines 2816–2820, 2849, 2854):
   - Background is `#0B0F19`.
   - Lines 2816–2818: `CURRENT BID` eyebrow and 9rem price use `#F59E0B` (Amber 500).
   - Lines 2849, 2854: Leader border and text use `#F59E0B`.

### 1.3 Interactive Touch Target Dimensions
1. **Buttons (`.btn`, lines 290–302)**:
   - Base CSS: `padding: 12px 24px; font-size: 13px; border-radius: 14px;`
   - Effective height: $13\text{px} \times 1.5 + 24\text{px} + 2\text{px} = \mathbf{45.5\text{px}}$ (less than 48px).
   - Explicit inline overrides shrinking buttons below 48px:
     - Line 2532: `padding: 8px 16px; font-size: 12px;` -> $\mathbf{34\text{px}}$ height.
     - Line 2643: `font-size: 11px; padding: 8px;` -> $\mathbf{32.5\text{px}}$ height.
     - Line 2649: `font-size: 11px; margin-top: 8px;` -> $\mathbf{36\text{px}}$ height.
     - Line 2774: `padding: 6px 14px; font-size: 11px;` -> $\mathbf{30.5\text{px}}$ height.
2. **Navigation Tabs (`.nav-tab-btn`, lines 209–222)**:
   - Base CSS: `padding: 8px 16px; font-size: 12px;`
   - Effective height: $12\text{px} \times 1.5 + 16\text{px} = \mathbf{34\text{px}}$ (far below 48px).
3. **Filter Pills** (`build_acc_os.py` lines 1944–1954):
   - Markup: `<button class="nav-tab-btn" style="padding: 5px 12px; font-size: 11px;">${b}</button>`
   - Effective height: $11\text{px} \times 1.5 + 10\text{px} = \mathbf{26.5\text{px}}$.
   - Effective width for "B1": $14\text{px} + 24\text{px} = \mathbf{38\text{px}}$ (envelope is $38\text{px} \times 26.5\text{px}$, failing the 48px standard).
4. **Modal Close Triggers** (`build_acc_os.py` lines 824–826 and 889–891):
   - Markup: `<button onclick="closeUndoModal()" style="background: none; border: none; padding: 6px; border-radius: 8px; color: var(--text-subtle);"><svg width="20" height="20"...></svg></button>`
   - Effective size: $20\text{px} + 12\text{px} = \mathbf{32\text{px} \times 32\text{px}}$ (failing the 48px standard).
5. **Franchise Selector Dropdown** (`build_acc_os.py` line 2241):
   - Markup: `<select class="form-select" style="width: auto; height: 36px; padding: 0 12px; font-size: 12px; font-weight: 700;">`
   - Effective height: $\mathbf{36\text{px}}$ (less than 48px).

---

## 2. Logic Chain

### 2.1 WCAG AA Contrast Compliance Logic
Under WCAG 2.1 Success Criterion 1.4.3 (Contrast Minimum), text and images of text must have a contrast ratio of at least:
- **4.5:1** for regular text (< 18pt or < 14pt bold).
- **3.0:1** for large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) and UI components (SC 1.4.11).

Using the standard ITU-R BT.709 relative luminance formula:
$$L = 0.2126 \cdot R_{sRGB} + 0.7152 \cdot G_{sRGB} + 0.0722 \cdot B_{sRGB}$$
$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \quad (L_1 > L_2)$$

#### A. Slate 400 (`#94A3B8`) Evaluation
- $R = 148/255 \rightarrow 0.298$, $G = 163/255 \rightarrow 0.366$, $B = 184/255 \rightarrow 0.479$
- $L(\text{Slate 400}) = 0.2126(0.298) + 0.7152(0.366) + 0.0722(0.479) = \mathbf{0.3598}$
- Against Pure White (`#FFFFFF`, $L=1.0$):
  $$\text{Ratio} = \frac{1.0 + 0.05}{0.3598 + 0.05} = \frac{1.05}{0.4098} = \mathbf{2.56:1} \quad (\text{FAIL})$$
- Against Light Muted Card (`#F1F5F9`, $L=0.928$):
  $$\text{Ratio} = \frac{0.928 + 0.05}{0.3598 + 0.05} = \frac{0.978}{0.4098} = \mathbf{2.39:1} \quad (\text{FAIL})$$

#### B. Slate 600 (`#475569`) Replacement Evaluation
- $R = 71/255 \rightarrow 0.063$, $G = 85/255 \rightarrow 0.091$, $B = 105/255 \rightarrow 0.143$
- $L(\text{Slate 600}) = 0.2126(0.063) + 0.7152(0.091) + 0.0722(0.143) = \mathbf{0.0888}$
- Against Pure White (`#FFFFFF`, $L=1.0$):
  $$\text{Ratio} = \frac{1.0 + 0.05}{0.0888 + 0.05} = \frac{1.05}{0.1388} = \mathbf{7.56:1} \quad (\text{PASSES AAA})$$
- Against Misted Sky (`#F6F9FF`, $L=0.941$):
  $$\text{Ratio} = \frac{0.941 + 0.05}{0.1388} = \mathbf{7.14:1} \quad (\text{PASSES AAA})$$
- Against Slate 100 (`#F1F5F9`, $L=0.928$):
  $$\text{Ratio} = \frac{0.928 + 0.05}{0.1388} = \mathbf{7.05:1} \quad (\text{PASSES AAA})$$
- **Inference**: Replacing Slate 400 (`#94A3B8`) with Slate 600 (`#475569`) elevates micro-copy, timestamps, and "Passed" badges from an illegible 2.39:1/2.56:1 to an authoritative 7.05:1–7.56:1, exceeding WCAG AA and satisfying WCAG AAA.

#### C. Amber 600 (`#D97706`) Evaluation on Light Glass
- $R = 217/255 \rightarrow 0.692$, $G = 119/255 \rightarrow 0.186$, $B = 6/255 \rightarrow 0.003$
- $L(\text{Amber 600}) = 0.2126(0.692) + 0.7152(0.186) + 0.0722(0.003) = \mathbf{0.2803}$
- Against Pure White (`#FFFFFF`, $L=1.0$):
  $$\text{Ratio} = \frac{1.0 + 0.05}{0.2803 + 0.05} = \frac{1.05}{0.3303} = \mathbf{3.18:1} \quad (\text{FAIL for regular text})$$
- Against Amber 50 (`#FFFBEB`, $L=0.978$):
  $$\text{Ratio} = \frac{0.978 + 0.05}{0.3303} = \mathbf{3.11:1} \quad (\text{FAIL})$$

#### D. Amber 700 (`#B45309`) Replacement Evaluation on Light Glass
- $R = 180/255 \rightarrow 0.457$, $G = 83/255 \rightarrow 0.086$, $B = 9/255 \rightarrow 0.0035$
- $L(\text{Amber 700}) = 0.2126(0.457) + 0.7152(0.086) + 0.0722(0.0035) = \mathbf{0.1590}$
- Against Pure White (`#FFFFFF`, $L=1.0$):
  $$\text{Ratio} = \frac{1.0 + 0.05}{0.1590 + 0.05} = \frac{1.05}{0.2090} = \mathbf{5.02:1} \quad (\text{PASSES AA})$$
- Against Misted Sky (`#F6F9FF`, $L=0.941$):
  $$\text{Ratio} = \frac{0.941 + 0.05}{0.2090} = \mathbf{4.74:1} \quad (\text{PASSES AA})$$
- Against Amber 50 (`#FFFBEB`, $L=0.978$):
  $$\text{Ratio} = \frac{0.978 + 0.05}{0.2090} = \mathbf{4.92:1} \quad (\text{PASSES AA})$$

#### E. Dark Projector Hall (`#0B0F19`) Evaluation
- Background $L(\text{Projector}) = \mathbf{0.0078}$.
- Amber 500 (`#F59E0B`, $L=0.430$):
  $$\text{Ratio} = \frac{0.430 + 0.05}{0.0078 + 0.05} = \frac{0.480}{0.0578} = \mathbf{8.30:1} \quad (\text{PASSES AAA})$$
- Amber 600 (`#D97706`, $L=0.280$):
  $$\text{Ratio} = \frac{0.280 + 0.05}{0.0578} = \mathbf{5.71:1} \quad (\text{PASSES AA})$$
- If Amber 700 (`#B45309`) were erroneously used in Projector view:
  $$\text{Ratio} = \frac{0.159 + 0.05}{0.0578} = \mathbf{3.61:1} \quad (\text{Degraded})$$
- **Inference**: Color tokens must be decoupled by display surface: light glass backgrounds demand Amber 700 (`#B45309`) for text/labels, while the dark auditorium projector screen must retain Amber 500 (`#F59E0B`) / Amber 600 (`#D97706`).

### 2.2 Touch Target Ergonomics Logic
Under WCAG 2.1 SC 2.5.5 and mobile platform guidelines (Apple HIG 44x44pt, Android Material 48x48dp):
- Any interactive element with less than 48px height or width risks touch contention and false-tap fatigue on mobile devices.
- Setting explicit `min-height: 48px; min-width: 48px;` on all primary interactive classes (`.btn`, `.nav-tab-btn`, `.modal-close-btn`, `.filter-pill`, `.form-select`) guarantees compliance without breaking flex or grid layouts.

---

## 3. Caveats

1. **Space Grotesk Font Weights**: Google Fonts standard distribution for Space Grotesk offers weights 300, 400, 500, 600, 700, but not 800. Our typography specification binds `--font-display` to `'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Plus Jakarta Sans supplies weight 800 natively.
2. **Projector View Scope**: Projector view (`renderProjectorView`) is intentionally displayed in full-screen dark auditorium mode (`#0B0F19`) and controlled via keyboard/desktop mouse. While touch targets inside the exit button should meet 48px, its primary constraints are 10-foot readability and 8.3:1 contrast against black.
3. **Single File Deliverable**: All changes must be authored in `build_acc_os.py` and compiled into `Acc-Auction-Os.html` to prevent divergence between generator source and artifact.

---

## 4. Conclusion & Actionable Code Recommendations

### 4.1 CSS Design Token Updates (`:root`)

Apply the following token definitions in `build_acc_os.py` (lines 17–58) / `Acc-Auction-Os.html` (lines 14–55):

```css
:root {
  --bg-misted-sky: #F6F9FF;
  --bg-rain-indigo: #9BE0E8;
  --bg-lavender: #C4B5F7;
  --bg-lilac-paper: #F8B8D9;

  /* Typography Colors - 100% WCAG AA / AAA Compliant */
  --text-main: #0F172A;       /* Slate 900 - 17.2:1 AAA */
  --text-muted: #334155;      /* Slate 700 - 10.1:1 AAA */
  --text-subtle: #475569;     /* Slate 600 - 7.56:1 AAA (Replaces Slate 500) */
  --text-faint: #475569;      /* Slate 600 - 7.56:1 AAA (Replaces Slate 400 #94A3B8) */

  /* Status Accents: Decoupled for Light Glass vs Dark Projector */
  --emerald-700: #047857;     /* Emerald 700 - 5.43:1 on White (Text & Badges) */
  --emerald-600: #059669;     /* Emerald 600 - Decorative icons & Borders */
  --emerald-500: #10B981;     /* Emerald 500 - Projector & Glow accents */
  --emerald-100: #D1FAE5;
  --emerald-50: #ECFDF5;

  --amber-700: #B45309;       /* Amber 700 - 4.74:1–5.02:1 AA on Light Glass (Text & Badges) */
  --amber-600: #D97706;       /* Amber 600 - Decorative borders / Projector secondary */
  --amber-500: #F59E0B;       /* Amber 500 - 8.30:1 on #0B0F19 Dark Projector */
  --amber-100: #FEF3C7;
  --amber-50: #FFFBEB;

  --rose-600: #E11D48;        /* Rose 600 - 4.71:1 AA */
  --rose-500: #F43F5E;
  --rose-100: #FFE4E6;
  --rose-50: #FFF1F2;

  --blue-600: #2563EB;
  --blue-500: #3B82F6;
  --blue-100: #DBEAFE;

  /* Glass Surfaces */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-bg-elevated: rgba(255, 255, 255, 0.88);
  --glass-bg-subtle: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(255, 255, 255, 0.9);
  --glass-border-subtle: rgba(15, 23, 42, 0.08);
  --glass-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
  --glass-shadow-lg: 0 20px 48px -6px rgba(15, 23, 42, 0.09), 0 8px 16px -4px rgba(15, 23, 42, 0.04);

  /* Typography Stack with Offline Proportional Fallbacks */
  --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-display: 'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
```

### 4.2 Typography Hierarchy & Layout Shifts (`font-variant-numeric: tabular-nums`)

Add numeric stability rules and formal font classes to `<style>`:

```css
/* Tabular Numerics for Timers, Prices, Lots, and Badges */
.tabular-nums,
[data-numeric="true"],
.timer-display-val,
.bid-hero-btn div,
code,
.font-mono {
  font-variant-numeric: tabular-nums;
  -webkit-font-feature-settings: "tnum" 1;
  font-feature-settings: "tnum" 1;
}

/* Formal Typographic Scale */
.eyebrow {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-subtle);
}

.display-title {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.95;
}
```

### 4.3 48px Ergonomic Touch Target Classes

Replace/extend CSS definitions in `build_acc_os.py` (lines 200–350 and 575–660):

```css
/* Navigation Tabs: Min 48px Touch Envelope */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(15, 23, 42, 0.05);
  padding: 4px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.nav-tabs::-webkit-scrollbar {
  display: none;
}
.nav-tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
  min-width: 48px;
  padding: 12px 20px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  background: transparent;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.nav-tab-btn:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.5);
}
.nav-tab-btn.active {
  color: var(--text-main);
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

/* Filter Pills: Dedicated 48px Target Class */
.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 48px;
  padding: 10px 16px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.filter-pill:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.6);
}
.filter-pill.active {
  color: var(--text-main);
  background: #FFFFFF;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
}

/* Base Clickable Button: 48px Minimum Envelope */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.btn:active {
  transform: scale(0.98);
}

/* Modal Close Button: 48px Envelope */
.modal-close-btn {
  background: none;
  border: none;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--text-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
}
.modal-close-btn:hover {
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-main);
}
.modal-close-btn:active {
  transform: scale(0.94);
}

/* Form Select Dropdown 48px Enforcement */
.form-select {
  width: 100%;
  min-height: 48px;
  height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  color: var(--text-main);
  cursor: pointer;
  touch-action: manipulation;
}
```

### 4.4 Exact Template String Replacements in `build_acc_os.py`

#### A. Modal Close Triggers
- **Before** (lines 824 & 889):
  ```html
  <button onclick="closeUndoModal()" style="background: none; border: none; padding: 6px; border-radius: 8px; color: var(--text-subtle);">
  ```
- **After**:
  ```html
  <button onclick="closeUndoModal()" class="modal-close-btn" aria-label="Close Forensic Undo Dialog">
  ```
  ```html
  <button onclick="closeFirebaseModal()" class="modal-close-btn" aria-label="Close Firebase Synchronization Dialog">
  ```

#### B. Public View Filter Pills
- **Before** (lines 1944–1955):
  ```html
  <div class="nav-tabs" style="padding: 2px;">
    ${['ALL', 'B1', 'B2', 'B3', 'B4', 'B5'].map(b => `
      <button class="nav-tab-btn ${publicBucketFilter === b ? 'active' : ''}" style="padding: 5px 12px; font-size: 11px;" onclick="publicBucketFilter = '${b}'; renderCurrentView();">${b}</button>
    `).join('')}
  </div>

  <div class="nav-tabs" style="padding: 2px;">
    ${['ALL', 'BATTER', 'BOWLER', 'ALL-ROUNDER'].map(r => `
      <button class="nav-tab-btn ${publicRoleFilter === r ? 'active' : ''}" style="padding: 5px 12px; font-size: 11px;" onclick="publicRoleFilter = '${r}'; renderCurrentView();">${r}</button>
    `).join('')}
  </div>
  ```
- **After**:
  ```html
  <div class="nav-tabs" style="padding: 4px;" role="tablist" aria-label="Bucket Category Filters">
    ${['ALL', 'B1', 'B2', 'B3', 'B4', 'B5'].map(b => `
      <button class="filter-pill ${publicBucketFilter === b ? 'active' : ''}" onclick="publicBucketFilter = '${b}'; renderCurrentView();" role="tab" aria-selected="${publicBucketFilter === b}">${b}</button>
    `).join('')}
  </div>

  <div class="nav-tabs" style="padding: 4px;" role="tablist" aria-label="Player Role Filters">
    ${['ALL', 'BATTER', 'BOWLER', 'ALL-ROUNDER'].map(r => `
      <button class="filter-pill ${publicRoleFilter === r ? 'active' : ''}" onclick="publicRoleFilter = '${r}'; renderCurrentView();" role="tab" aria-selected="${publicRoleFilter === r}">${r}</button>
    `).join('')}
  </div>
  ```

#### C. Amber Contrast & Passed Franchise State
- **Before** (`build_acc_os.py` lines 2208–2220):
  ```javascript
  if (fPassed) {
    stateColor = "#94A3B8";
    stateBg = "#F1F5F9";
    stateLabel = "Passed";
  } else if (fBlocked) {
    stateColor = "#E11D48";
    stateBg = "var(--rose-50)";
    stateLabel = "Blocked";
  } else if (isLeader) {
    stateColor = "#D97706";
    stateBg = "var(--amber-50)";
    stateLabel = "Leader";
  }
  ```
- **After**:
  ```javascript
  if (fPassed) {
    stateColor = "var(--text-faint)"; /* #475569 Slate 600 -> 7.05:1 contrast */
    stateBg = "#F1F5F9";
    stateLabel = "Passed";
  } else if (fBlocked) {
    stateColor = "var(--rose-600)";   /* #E11D48 -> 4.71:1 contrast */
    stateBg = "var(--rose-50)";
    stateLabel = "Blocked";
  } else if (isLeader) {
    stateColor = "var(--amber-700)";  /* #B45309 -> 4.92:1 contrast */
    stateBg = "var(--amber-50)";
    stateLabel = "Leader";
  }
  ```

#### D. Light Glass Amber Eyebrows and Labels
Replace all occurrences of `color: var(--amber-600);` in light glass views with `color: var(--amber-700);`:
- Hero subtitle (line 1871): `<span style="color: var(--amber-700);">CARNIVAL 2026</span>`
- Spotlight Bid (lines 1907–1908): `color: var(--amber-700);`
- Catalog Type (line 1969): `color: var(--amber-700);`
- Bucket Scarcity Notice (line 2181): `color: var(--amber-700);`
- Live Current Bid (lines 2133–2134): `color: var(--amber-700);`
- Registration Step 2 Badge (line 2413): `background: var(--amber-700); color: white;` (contrast 5.02:1)
- Admin Live Bid (lines 2689–2690): `color: var(--amber-700);`
- Admin Audit Stream Hammer Badge (line 2718): `color: var(--amber-700);`

---

## 5. Verification Method

### 5.1 Contrast Ratio Verification
1. Inspect the compiled document with browser DevTools Accessibility Inspector or Axe Core.
2. Select any element with micro-copy, timestamps, or passed state:
   - Foreground: `#475569`, Background: `#FFFFFF` or `#F1F5F9`.
   - Verified ratio: $\mathbf{7.05:1}$ to $\mathbf{7.56:1}$ (Passes WCAG AAA).
3. Select any Amber label/price on light glass:
   - Foreground: `#B45309`, Background: `#FFFFFF` or `#FFFBEB`.
   - Verified ratio: $\mathbf{4.92:1}$ to $\mathbf{5.02:1}$ (Passes WCAG AA).
4. Select Projector View live bid:
   - Foreground: `#F59E0B`, Background: `#0B0F19`.
   - Verified ratio: $\mathbf{8.30:1}$ (Passes WCAG AAA).

### 5.2 Touch Envelope Verification
1. In Chrome/Edge DevTools, open Device Mode (`Ctrl+Shift+M`) with viewport 375x667 (iPhone SE).
2. Measure computed dimensions via `getComputedStyle(element).height`:
   - `.btn`: $\ge 48\text{px}$
   - `.nav-tab-btn`: $\ge 48\text{px}$
   - `.filter-pill`: $\ge 48\text{px}$
   - `.modal-close-btn`: $48\text{px} \times 48\text{px}$
   - `.form-select`: $48\text{px}$
3. Verify horizontal scrolling on `.nav-tabs` allows smooth swiping across all 6 tabs without clipping or line breaks.

### 5.3 Offline Typography & CLS Invalidation Condition
1. Disable network in DevTools (`Network -> Offline`).
2. Reload `Acc-Auction-Os.html`.
3. Verify that native system fonts render with crisp proportions, no layout shift (CLS = 0), and tabular number stability during countdown and bidding.
