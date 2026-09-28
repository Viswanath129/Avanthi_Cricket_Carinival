# ACC 2026 AUCTION PORTAL — UI WIREFRAMES & DESIGN TOKEN SPECIFICATIONS
**Design System Standard:** UI/UX Pro Max · Apple Human Interface Guidelines · Material Design 3  
**Target Viewports:** Mobile (375px–430px), Tablet (768px–1024px), Desktop (1440px+), Projector (1920x1080 / 3840x2160)

---

## 1. DESIGN TOKENS & SYSTEM PALETTE

### 1.1 Color Tokens
| Token Name | Hex Code | Role & Surface | Contrast Ratio |
|---|---|---|---|
| `--color-canvas-bg` | `#0B0F19` | Primary auditorium background (Dark) | 18.2:1 against white text |
| `--color-surface-card` | `#111827` | Elevated card & modal container | 14.5:1 against primary text |
| `--color-surface-border`| `#1F2937` | Card divider and stroke border | 3.5:1 against card surface |
| `--color-primary-gold` | `#F59E0B` | Live auction hammer, high-priority timer | 9.4:1 against dark bg |
| `--color-emerald-active`| `#10B981` | Leading bid, current high bidder badge | 8.8:1 against dark bg |
| `--color-danger-alert` | `#EF4444` | Scarcity warnings, destructive actions, undo | 7.1:1 against dark bg |
| `--color-brand-accent` | `#6366F1` | Bidding chips, active tabs, buttons | 6.5:1 against dark bg |
| `--color-text-primary` | `#F9FAFB` | Primary headings, player names, bid amounts | WCAG AAA compliant |
| `--color-text-secondary`| `#9CA3AF` | Subtitles, labels, stats metadata | WCAG AA compliant |

### 1.2 Typography & Sizing Scales
- **Display Big (Projector Bid)**: `clamp(4rem, 10vw, 8rem)`, `font-weight: 900`, `font-family: ui-monospace, SFMono-Regular, Menlo, monospace`, `letter-spacing: -0.05em`.
- **H1 (Screen Title)**: `2.25rem (36px)`, `font-weight: 800`, `line-height: 1.2`.
- **H2 (Card Headers / Section Titles)**: `1.5rem (24px)`, `font-weight: 700`, `line-height: 1.3`.
- **Body Regular**: `1rem (16px)`, `font-weight: 400`, `line-height: 1.5`.
- **Tabular Figures**: All bid counters, wallet amounts, and countdown clocks use `.font-mono` (`font-variant-numeric: tabular-nums`) to prevent layout shifts.

### 1.3 Touch Targets & Ergonomics
- **Minimum Target Dimension**: 48px $\times$ 48px for all mobile interactive elements (Apple HIG / MD3).
- **Active Bid Button**: 72px minimum height on mobile franchise bid pad, located in bottom thumb-zone (lower 35% of viewport).

---

## 2. WIREFRAME SPECIFICATIONS

### 2.1 Screen 1: Mobile Player Self-Registration (Mobile-First 390px)
```
+------------------------------------------+
|  ACC 2026 - PLAYER REGISTRATION      [X] |
+------------------------------------------+
| Progress: [==== 75% ======      ] Step 3 |
|                                          |
| [1. ACADEMIC INFO]                       |
|   Roll Number:    [ 26811A0501        ]  |
|   Full Name:      [ Sai Teja          ]  |
|   Degree & Year:  [ B.Tech - 3rd Year v] |
|   *Lateral Entry? ( ) Yes  (*) No        |
|                                          |
| [2. SKILL PROFILE]                       |
|   Batting Arm:    (*) Right   ( ) Left   |
|   Bowler?         (*) Yes     ( ) No     |
|   Bowling Type:   [ Fast / Medium    v]  |
|   Wicket-Keeper?  ( ) Yes     (*) No     |
|                                          |
| [3. SELF-DECLARED CAREER STATS]          |
|   Matches: [ 24 ]  Runs: [ 580 ]         |
|   Bat Avg: [29.0]  SR:   [138.2]         |
|   Wickets: [ 18 ]  Econ: [ 7.2 ]         |
|   Badge: [! Self-Declared Statistics !]  |
|                                          |
| [4. CRICHEROES & BASE PRICE]             |
|   CricHeroes:     [ Submit Link Later v] |
|   Base Price:     [ 50 Credits       v]  |
|   *Select from 16-point ladder (20-250)  |
|                                          |
| [5. PASSPORT PHOTO UPLOAD]               |
|   +------------------------------------+ |
|   |   [ Camera / Gallery Upload ]      | |
|   |   Client-side resized to 800x800px | |
|   +------------------------------------+ |
|                                          |
|   [   SUBMIT REGISTRATION (48px H)   ]   |
+------------------------------------------+
```

---

### 2.2 Screen 2: Franchise Mobile Bidding Pad (Franchise Captain / Coordinator)
Designed specifically for high-stress thumb operation with zero cognitive overload.

```
+------------------------------------------+
| TITANS (T03)        Purse: 840 Cr (Max: 680) |
+------------------------------------------+
| LOT #142 | BUCKET: B3 (B.Tech 3rd Yr)    |
| [Photo]  Sai Teja                        |
|          Right-Hand Bat · Right-Arm Fast |
|          Runs: 580 (SR: 138) · Wkts: 18  |
+------------------------------------------+
| LEADING BID:   160 Credits               |
| HELD BY:       [ TITANS (You) ]          |
| TIMER:         [ 00:18 ] (Running)       |
+------------------------------------------+
| SQUAD QUOTA STATUS:                      |
| [B3: 2/2 OK] [B4: 1/2] [B2: 1/2]         |
| [D5: 0/2 !]  [B1: 1/2] [PG: 0/0 OK]      |
| Remaining Slots: 10 | Unmet Quota: 4     |
+------------------------------------------+
| QUICK BID INCREMENT:                     |
| [ +10 (170) ]   [ +20 (180) ]            |
|                                          |
| +--------------------------------------+ |
| |                                      | |
| |       BID 170 CREDITS (72px H)       | |
| |       (Tap to outbid)                | |
| |                                      | |
| +--------------------------------------+ |
|                                          |
| [ PASS THIS LOT ]      [ LIVE STREAM > ] |
+------------------------------------------+
```

---

### 2.3 Screen 3: Single-Screen Admin Cockpit (1440px+ Zero-Scroll)
Command view for Super Admin and Auction Operator with hardware hotkey support.

```
+--------------------------------------------------------------------------------------------------+
| ACC 2026 AUCTION COMMAND COCKPIT                Operator: Mr. Deepak (Super Admin)   [14:32:05] |
+--------------------------------------------------------------------------------------------------+
| [HOTKEY BAR: [H] Hammer  [S] Skip  [P] Pause  [U] Undo  [B] Bid On Behalf  [D] Direct  [?] Help] |
+-----------------------------------+--------------------------------+-----------------------------+
| ACTIVE LOT #142                   | REAL-TIME BIDDING LADDER       | 11-TEAM FRANCHISE STATUS    |
| [ 220px Photo ]  Sai Teja         | Current Bid: 160 Cr            | T01 Strikers: 720 Cr (11/15)|
| Roll: 26811A0501 | CSE            | Leader:      TITANS (T03)      | T02 Warriors: 640 Cr (12/15)|
| Bucket: B3 (B.Tech 3rd Year)      | Increment:   +10 Cr (Next 170) |*T03 Titans:   840 Cr (05/15)|
| Base Price: 50 Cr                 | Status:      ACTIVE            | T04 Kings:    520 Cr (13/15)|
| Stats: 580 R, 18 W, SR 138.2      | Timer:       [ 18s ]           | T05 Royals:   400 Cr (14/15)|
| Self-Declared: YES (Verified)     |                                | T06 Panthers: 810 Cr (06/15)|
|                                   | In-Play: [T01, T03, T07]       | T07 Challengers: 690 (09/15)|
| Draw Mode: (*) Guest  ( ) Auto    | Passed:  [T02, T04, T05, ...]  | T08 Gladiators:  580 (11/15)|
|                                   |                                | T09 Dynamos:     740 (08/15)|
| [ CALL NEXT LOT ] [ SKIP LOT (S)] | [ HAMMER SALE (H) ] (2-Step)   | T10 Blasters:    360 (13/15)|
|                                   | [ PAUSE / RESUME (P) ]         | T11 Super Kings: 480 (12/15)|
+-----------------------------------+--------------------------------+-----------------------------+
| SCARCITY MONITOR: [!] D5 Supply: 8 available vs 9 needed (DEFICIT: 1) -> Warning active          |
+--------------------------------------------------------------------------------------------------+
| AUDIT RECENT TRAIL (Live-Sync):                                                                  |
| 14:31:55 - T03 bid 160 Cr on Lot #142 (Accepted, clock reset to 20s)                             |
| 14:31:42 - T01 bid 150 Cr on Lot #142 (Accepted)                                                |
| 14:31:02 - Lot #141 (R. Kumar) Sold to T05 for 90 Cr [COMPENSATING UNDO AVAILABLE]              |
+--------------------------------------------------------------------------------------------------+
```

---

### 2.4 Screen 4: Fullscreen Projector Display (1080p / 4K Ultra-Legibility)
Optimized for 50-foot viewing distance in a dimly lit auditorium.

```
+==================================================================================================+
|  AVANTHI CRICKET CARNIVAL 2026 — LIVE AUCTION                          ROUND 1 · BUCKET: B3      |
+==================================================================================================+
|                                                                                                  |
|   +-------------------+    LOT #142: SAI TEJA (B.TECH 3RD YR - CSE)                              |
|   |                   |    ---------------------------------------------------                   |
|   |                   |    BATTING: Right Hand Bat   BOWLING: Right Arm Fast                     |
|   |     HD PHOTO      |    STATS:   580 Runs (SR 138.2) · 18 Wickets (Econ 7.2)                  |
|   |    (360x360)      |    BASE:    50 Credits                                                   |
|   |                   |                                                                          |
|   +-------------------+    CURRENT BID:                                                          |
|                            # # # # # # # # # # # # # # # # # # # # # # # # #                     |
|                            #          160 CREDITS                          #                     |
|                            # # # # # # # # # # # # # # # # # # # # # # # # #                     |
|                            LEADING FRANCHISE:   TITANS (TEAM 03)                                 |
|                                                                                                  |
|                            COUNTDOWN TIMER:     [ 00:18 ]                                        |
|                                                                                                  |
+==================================================================================================+
| TEAM STANDINGS (Purse / Squad / Max Permissible Bid):                                            |
| T1: 720 Cr (11) | T2: 640 Cr (12) |*T3: 840 Cr (5) | T4: 520 Cr (13) | T5: 400 Cr (14)          |
| T6: 810 Cr (6)  | T7: 690 Cr (9)  | T8: 580 Cr (11)| T9: 740 Cr (8)  | T10: 360 (13)| T11: 480  |
+==================================================================================================+
| [!] CRITICAL SCARCITY ALERT: DIPLOMA 5TH SEM (D5) SHORTFALL DETECTED (SUPPLY: 8 < DEMAND: 9)     |
+==================================================================================================+
```

---

## 3. HARDWARE SHORTCUT SPECIFICATION (ADMIN CONSOLE)

| Key | Modifier | Action | Scope / Condition |
|---|---|---|---|
| `H` | None | Open 2-step Hammer confirmation modal | Lot has active bid $>0$ |
| `S` | None | Skip lot to recall queue | Active lot only |
| `P` | None | Pause or Resume auction clock | Global |
| `U` | None | Open Undo Lot selection modal | History has $\ge 1$ sold lot |
| `B` | None | Open "Bid on Behalf" modal | Operator override |
| `A` | None | Switch to Auto Lot draw | Idle auction |
| `D` | None | Direct Assign player modal | Offline / emergency sale |
| `R` | None | Recall skipped lots | Between bucket transitions |
| `Space`| None | Reset / restart 30s timer | Active lot |
| `E` | `Ctrl` | Export Full JSON/CSV backup | Immediate |
| `S` | `Ctrl` | Save snapshot backup | Immediate |
| `?` | None | Toggle Keyboard Shortcuts Help Cheat Sheet | Global |

---

## 4. AUDIT & LOGGING DRAWER (OFF-CANVAS)

- Activated via hotkey or toggle button.
- Slide-over panel (420px width) displaying chronologically descending system actions:
  - Event timestamp (`HH:mm:ss.SSS`).
  - Action category badge: `BID`, `SALE`, `UNDO`, `SKIP`, `DIRECT_ASSIGN`, `OVERRIDE`.
  - Operator identity (`OP_DEEPAK`).
  - Previous state $\rightarrow$ New state diff.
  - Export audit log button (JSON / CSV).
