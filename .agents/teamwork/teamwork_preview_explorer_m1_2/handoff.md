# Milestone 1: Uiverse Speeder Loading Overlay Specification & Implementation Plan

**Author**: Explorer M1-2 (`teamwork_preview_explorer_m1_2`)  
**Target Milestone**: Milestone 1 (Design System & FeralUI Core + Speeder Loader)  
**Deliverable**: Comprehensive Architecture, CSS/HTML/JS Specifications, and Exact Implementation Code for the Worker  
**Target Files**: `b:/projects/ACC/build_acc_os.py` and `b:/projects/ACC/Acc-Auction-Os.html`  

---

## 1. Observation

Direct examination of the project repository reveals the following structure and code paths:

### 1.1 Generation Pipeline and File Relationship
- `build_acc_os.py` is the single source generator script (2,886 lines, 150,213 bytes). It contains `html_content = r'''<!DOCTYPE html>...'''` and writes to `Acc-Auction-Os.html` via lines 2882-2883:
  ```python
  with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
      f.write(html_content)
  ```
- Because of this generator model, any code change must be made in `build_acc_os.py` (and mirrored into `Acc-Auction-Os.html` or generated directly).

### 1.2 Existing Speeder CSS in `build_acc_os.py` (Lines 378–550) & `Acc-Auction-Os.html` (Lines 375–548)
```css
/* ========================================================
   UIVERSE SPEEDER LOADING ANIMATION
   ======================================================== */
.speeder-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(246, 249, 255, 0.88);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.45s ease, visibility 0.45s ease;
  pointer-events: all;
}
.speeder-overlay.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.speeder-wrapper {
  position: relative;
  width: 320px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.speeder-loader {
  animation: speeder-anim 0.4s linear infinite;
  position: relative;
}
.speeder-loader > span {
  height: 5px;
  width: 35px;
  background: #0F172A;
  position: absolute;
  top: -19px;
  left: 60px;
  border-radius: 2px 10px 1px 0;
}
.speeder-base span {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-right: 100px solid #059669;
  border-bottom: 6px solid transparent;
}
.speeder-base span:before {
  content: "";
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #059669;
  position: absolute;
  right: -110px;
  top: -16px;
}
.speeder-base span:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-top: 0 solid transparent;
  border-right: 55px solid #059669;
  border-bottom: 16px solid transparent;
  top: -16px;
  right: -98px;
}
.speeder-face {
  position: absolute;
  height: 12px;
  width: 20px;
  background: #059669;
  border-radius: 20px 20px 0 0;
  transform: rotate(-40deg);
  right: -125px;
  top: -15px;
}
.speeder-face:after {
  content: "";
  height: 12px;
  width: 12px;
  background: #0F172A;
  right: 4px;
  top: 7px;
  position: absolute;
  transform: rotate(40deg);
  transform-origin: 50% 50%;
  border-radius: 0 0 0 2px;
}
.speeder-loader > span > span {
  position: absolute;
  width: 30px;
  height: 1.5px;
  background: #0F172A;
}
.speeder-loader > span > span:nth-child(1) { animation: speeder-fazer1 0.2s linear infinite; }
.speeder-loader > span > span:nth-child(2) { top: 3px; animation: speeder-fazer2 0.4s linear infinite; }
.speeder-loader > span > span:nth-child(3) { top: 1px; animation: speeder-fazer3 0.4s linear infinite; animation-delay: -1s; }
.speeder-loader > span > span:nth-child(4) { top: 4px; animation: speeder-fazer4 1s linear infinite; animation-delay: -1s; }

@keyframes speeder-anim {
  0% { transform: translate(2px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -3px) rotate(-1deg); }
  20% { transform: translate(-2px, 0px) rotate(1deg); }
  30% { transform: translate(1px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 3px) rotate(-1deg); }
  60% { transform: translate(-1px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-2px, -1px) rotate(1deg); }
  90% { transform: translate(2px, 1px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
@keyframes speeder-fazer1 {
  0% { left: 0; }
  100% { left: -80px; opacity: 0; }
}
@keyframes speeder-fazer2 {
  0% { left: 0; }
  100% { left: -100px; opacity: 0; }
}
@keyframes speeder-fazer3 {
  0% { left: 0; }
  100% { left: -50px; opacity: 0; }
}
@keyframes speeder-fazer4 {
  0% { left: 0; }
  100% { left: -150px; opacity: 0; }
}

.longfazers {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}
.longfazers span {
  position: absolute;
  height: 2px;
  width: 25%;
  background: #059669;
}
.longfazers span:nth-child(1) { top: 20%; animation: lf1 0.6s linear infinite; animation-delay: -5s; }
.longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
.longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
.longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }

@keyframes lf1 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
@keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
@keyframes lf3 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
@keyframes lf4 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }

.speeder-msg {
  margin-top: 24px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-main);
}
.speeder-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-subtle);
}
```

### 1.3 Speeder HTML Markup (Lines 716–740 of `build_acc_os.py`)
```html
<!-- UIVERSE SPEEDER LOADING OVERLAY -->
<div id="speederOverlay" class="speeder-overlay">
  <div class="speeder-wrapper">
    <div class="speeder-loader">
      <span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <div class="speeder-base">
        <span></span>
        <div class="speeder-face"></div>
      </div>
    </div>
    <div class="longfazers">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
  <div id="speederMsg" class="speeder-msg">INITIALIZING ACC AUCTION OS...</div>
  <div id="speederSub" class="speeder-sub">Connecting live WebSockets & verifying purse integrity</div>
</div>
```

### 1.4 State & Firebase Cloud Engine Transition (Lines 1050–1085 of `build_acc_os.py`)
- Lines 1053–1068 contain the registration and search filter states, immediately followed by `DEFAULT_FIREBASE_CONFIG`:
  ```javascript
  let regBowling = "yes";
  let regBowlingType = "Fast";
  let regFielding = "no";
  let regName = "Arjun Kumar";
  let regMobile = "9876543210";

  // Search and Filters
  let publicSearch = "";
  let publicBucketFilter = "ALL";
  let publicRoleFilter = "ALL";

  // ========================================================
  // FIREBASE REAL-TIME CLOUD SYNCHRONIZATION ENGINE
  // ========================================================
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC3HX53aAbeWqYGTSUvl59xEBeQNefx0sA",
    authDomain: "studio-6471864054-30ce7.firebaseapp.com",
    projectId: "studio-6471864054-30ce7",
    storageBucket: "studio-6471864054-30ce7.firebasestorage.app",
    messagingSenderId: "830366253821",
    appId: "1:830366253821:web:74186cd15282b396053494",
    databaseURL: "https://studio-6471864054-30ce7-default-rtdb.firebaseio.com"
  };
  let currentRoomId = localStorage.getItem("acc_firebase_room") || "acc_session_2026";
  let syncStatus = "connecting"; // 'connected' | 'connecting' | 'local' | 'error'
  ```

### 1.5 Current Controller Implementation (Lines 1558–1574)
```javascript
// ========================================================
// UIVERSE SPEEDER LOADER CONTROLLER
// ========================================================
function showSpeeder(title, subtitle = "Processing state synchronization across 11 nodes", durationMs = 800) {
  const overlay = document.getElementById("speederOverlay");
  const titleEl = document.getElementById("speederMsg");
  const subEl = document.getElementById("speederSub");

  if (titleEl) titleEl.innerText = title;
  if (subEl) subEl.innerText = subtitle;
  overlay.classList.remove("hidden");

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, durationMs);
}
```

### 1.6 Current Boot Execution (Lines 2864–2876)
```javascript
// ========================================================
// INITIALIZATION ON PAGE BOOT
// ========================================================
window.addEventListener("DOMContentLoaded", () => {
  initFirebaseSync();
  renderCurrentView();
  startTimer();
  // Smooth fade-out of initial speeder overlay
  setTimeout(() => {
    const overlay = document.getElementById("speederOverlay");
    if (overlay) overlay.classList.add("hidden");
  }, 900);
});
```

---

## 2. Logic Chain

### 2.1 Zero Layout Shift (CLS = 0) Verification & Hardening
- **Theoretical Basis**: Cumulative Layout Shift (CLS) occurs when layout elements change their start positions between rendered frames.
- **Current Observation**: `#speederOverlay` is declared with `position: fixed; inset: 0;` (lines 382–383).
- **Deduction**: Because `position: fixed` removes the element entirely from the document flow, changing its opacity, visibility, or inner DOM tree causes 0 layout recalculations or position displacements to any sibling elements (`.header-nav`, `#appMain`, modals).
- **Deficiencies & Hardening**:
  1. `inset: 0` alone does not explicitly handle mobile browser address bars that resize viewport height dynamically. We must specify `top: 0; left: 0; width: 100vw; height: 100vh; height: 100dvh;`.
  2. `pointer-events: all;` should be standardized to `pointer-events: auto;` in active state, and strictly `pointer-events: none;` in `.hidden` state.
  3. `z-index: 9999;` can be overlapped by modals that have `z-index: 9000` or `10000`. It must be set to `z-index: 99999;` to ensure absolute dominance during screen transitions.
  4. Missing GPU acceleration hints: adding `transform: translateZ(0);` and `will-change: opacity, visibility;` ensures that composite layers are maintained on the GPU, eliminating composite thread stutter on low-power devices.

### 2.2 Race Condition in `showSpeeder` Controller
- **Current Observation**: `showSpeeder` creates an anonymous `setTimeout(() => { overlay.classList.add("hidden"); }, durationMs);` without storing or cancelling any previous timer.
- **Failure Scenario**:
  - Event A (e.g. view switch or registration) calls `showSpeeder("...", "...", 1200)`.
  - At t = 600ms, Event B (e.g. lot advance or sync update) calls `showSpeeder("...", "...", 800)`.
  - At t = 1200ms, the timer from Event A fires and adds `.hidden`, abruptly killing the overlay for Event B 200ms prematurely.
- **Resolution**: Introduce module-scoped `let speederTimeoutId = null;`. Before scheduling any dismissal timer, execute `if (speederTimeoutId) { clearTimeout(speederTimeoutId); speederTimeoutId = null; }`. Additionally, extract `hideSpeeder()` into an exported helper so that async tasks can dismiss the speeder explicitly on completion.

### 2.3 Accessibility & Text Contrast (WCAG AA / AAA)
- **Current Observation**: `.speeder-sub` uses `var(--text-subtle)` (`#64748B`, Slate 500) on a `rgba(246, 249, 255, 0.88)` background.
  - Calculated contrast ratio: ~4.7:1 (barely passes AA for small text).
- **Resolution**: Change `.speeder-sub` color to `var(--text-muted, #334155)` (Slate 700).
  - Calculated contrast ratio: ~7.2:1 (exceeds WCAG AAA requirements of 7:1 for enhanced legibility).
- Add `role="status"`, `aria-live="polite"`, and dynamic `aria-hidden` attribute updates to guarantee screen reader compatibility without interrupting screen reader speech synthesis.

### 2.4 Projector View Theme Continuity
- **Observation**: Projector Hall Display uses a dark auditorium aesthetic (`#0B0F19`, PROJECT.md line 12). If the user or admin is viewing Projector mode, triggering the speeder in bright white `#F6F9FF` creates a jarring flash on the auditorium projection screen.
- **Resolution**: Add CSS targeting `[data-view="projector"] .speeder-overlay`:
  - Background: `rgba(11, 15, 25, 0.94)`
  - Title: `#F8FAFC`
  - Subtitle: `#94A3B8`
  - Longfazers & accents: `#10B981` (Emerald 500)
  This provides aesthetic continuity without altering the pristine FeralUI glass look for all other views.

### 2.5 Verification of All 6 Dynamic Invocation Points
The dispatch mission mandates coverage across:
1. **View switches**: In `switchView(view)`, trigger `showSpeeder("LOADING " + view.toUpperCase() + " VIEW...", "Updating live reactive layout", 400);`.
2. **Lot advances**:
   - In `advanceLot()`, when advancing without a hammer sale, show `showSpeeder("LOT #" + nextPlayer.id + " ON STAGE", `${nextPlayer.name} (${nextPlayer.bucket} - ${nextPlayer.type}) • Base ${currentPrice}C`, 600);`.
   - In remote sync `applyIncomingState()`, when `prevLot !== lotIndex`, show `showSpeeder("LOT ADVANCED (REMOTE)", `Now on Lot #${players[lotIndex].id} — ${players[lotIndex].name}`, 600);`.
3. **Skips**: In `skipLot()`, trigger `showSpeeder("SKIPPING LOT...", `Lot #${p.id} ${p.name} marked UNSOLD`, 600);`.
4. **Undo execution**: In `executeUndo()`, trigger `showSpeeder("TRANSACTION UNDONE", "Purse refunded & bucket allocations recalculated", 1000);`.
5. **Registration submission**: In `submitRegistration()`, trigger `showSpeeder("REGISTRATION COMPLETE!", `${newP.name} added to auction lot pool (#${newP.id})`, 1200);`.
6. **Sync status updates**:
   - In `pushLocalStateToCloud()`: `showSpeeder("PUSHING TO FIREBASE...", "Uploading full auction ledger & franchise state", 800);`.
   - In `pullCloudState()`: `showSpeeder("PULLING FROM FIREBASE...", "Fetching authoritative state from Firestore", 800);`.
   - In `switchFirebaseRoom()`: `showSpeeder("SWITCHING TOURNAMENT ROOM...", `Connecting to ${currentRoomId}`, 700);`.
   - In `updateFirebaseStatusUI(status, label, notifySpeeder)`: when connection transitions, notify `showSpeeder("CLOUD SYNC ONLINE", ...)`.

---

## 3. Caveats

1. **Build Generation Step**: `Acc-Auction-Os.html` is generated by `build_acc_os.py`. Any edits made directly to `Acc-Auction-Os.html` would be overwritten if `python build_acc_os.py` is executed subsequently. Therefore, the worker MUST apply changes to `build_acc_os.py` and synchronize `Acc-Auction-Os.html`.
2. **Permission Boundary**: The test command execution timed out for interactive permission; hence, all verification must be conducted statically and by direct browser inspection of the single-file deliverable.
3. **High Frequency Bidding**: Placing a bid does NOT trigger the full-screen speeder overlay, which is by design — bidding requires real-time sub-100ms reaction times, and displaying an overlay on every bid increment would severely degrade auctioneer flow and captain UX. The speeder is reserved for phase transitions, view changes, lot advances, skips, undos, registrations, and sync changes.

---

## 4. Conclusion & Actionable Implementation Instructions

The implementation plan is 100% scoped and ready for Worker execution. Below are the verbatim code blocks that the Worker must apply.

### Step 1: CSS Specification for `build_acc_os.py` (Lines 378–550)

Replace lines 378–550 of `build_acc_os.py` with:

```css
    /* ========================================================
       UIVERSE SPEEDER LOADING ANIMATION (CLS = 0, HIGH CONTRAST)
       ======================================================== */
    .speeder-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 99999;
      background: rgba(246, 249, 255, 0.90);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.4s ease;
      will-change: opacity, visibility;
      contain: strict;
    }
    .speeder-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .speeder-wrapper {
      position: relative;
      width: 320px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateZ(0);
    }
    .speeder-loader {
      animation: speeder-anim 0.4s linear infinite;
      position: relative;
    }
    .speeder-loader > span {
      height: 5px;
      width: 35px;
      background: #0F172A;
      position: absolute;
      top: -19px;
      left: 60px;
      border-radius: 2px 10px 1px 0;
    }
    .speeder-base span {
      position: absolute;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-right: 100px solid #059669;
      border-bottom: 6px solid transparent;
    }
    .speeder-base span:before {
      content: "";
      height: 22px;
      width: 22px;
      border-radius: 50%;
      background: #059669;
      position: absolute;
      right: -110px;
      top: -16px;
    }
    .speeder-base span:after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      border-top: 0 solid transparent;
      border-right: 55px solid #059669;
      border-bottom: 16px solid transparent;
      top: -16px;
      right: -98px;
    }
    .speeder-face {
      position: absolute;
      height: 12px;
      width: 20px;
      background: #059669;
      border-radius: 20px 20px 0 0;
      transform: rotate(-40deg);
      right: -125px;
      top: -15px;
    }
    .speeder-face:after {
      content: "";
      height: 12px;
      width: 12px;
      background: #0F172A;
      right: 4px;
      top: 7px;
      position: absolute;
      transform: rotate(40deg);
      transform-origin: 50% 50%;
      border-radius: 0 0 0 2px;
    }
    .speeder-loader > span > span {
      position: absolute;
      width: 30px;
      height: 1.5px;
      background: #0F172A;
    }
    .speeder-loader > span > span:nth-child(1) { animation: speeder-fazer1 0.2s linear infinite; }
    .speeder-loader > span > span:nth-child(2) { top: 3px; animation: speeder-fazer2 0.4s linear infinite; }
    .speeder-loader > span > span:nth-child(3) { top: 1px; animation: speeder-fazer3 0.4s linear infinite; animation-delay: -1s; }
    .speeder-loader > span > span:nth-child(4) { top: 4px; animation: speeder-fazer4 1s linear infinite; animation-delay: -1s; }

    @keyframes speeder-anim {
      0% { transform: translate(2px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -3px) rotate(-1deg); }
      20% { transform: translate(-2px, 0px) rotate(1deg); }
      30% { transform: translate(1px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 3px) rotate(-1deg); }
      60% { transform: translate(-1px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-2px, -1px) rotate(1deg); }
      90% { transform: translate(2px, 1px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    @keyframes speeder-fazer1 {
      0% { left: 0; }
      100% { left: -80px; opacity: 0; }
    }
    @keyframes speeder-fazer2 {
      0% { left: 0; }
      100% { left: -100px; opacity: 0; }
    }
    @keyframes speeder-fazer3 {
      0% { left: 0; }
      100% { left: -50px; opacity: 0; }
    }
    @keyframes speeder-fazer4 {
      0% { left: 0; }
      100% { left: -150px; opacity: 0; }
    }

    .longfazers {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }
    .longfazers span {
      position: absolute;
      height: 2px;
      width: 25%;
      background: #059669;
    }
    .longfazers span:nth-child(1) { top: 20%; animation: lf1 0.6s linear infinite; animation-delay: -5s; }
    .longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
    .longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
    .longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }

    @keyframes lf1 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf3 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf4 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }

    .speeder-msg {
      margin-top: 24px;
      font-family: var(--font-display, "Space Grotesk", sans-serif);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-main, #0F172A);
      text-align: center;
      padding: 0 16px;
    }
    .speeder-sub {
      margin-top: 6px;
      font-family: var(--font-body, "Inter", sans-serif);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted, #334155);
      text-align: center;
      max-width: 90vw;
      padding: 0 16px;
    }

    /* Auditorium Projector Dark Mode Adaptation */
    body[data-view="projector"] .speeder-overlay,
    .view-projector .speeder-overlay {
      background: rgba(11, 15, 25, 0.94);
    }
    body[data-view="projector"] .speeder-msg,
    .view-projector .speeder-msg {
      color: #F8FAFC;
    }
    body[data-view="projector"] .speeder-sub,
    .view-projector .speeder-sub {
      color: #94A3B8;
    }
    body[data-view="projector"] .speeder-loader > span,
    body[data-view="projector"] .speeder-face:after,
    body[data-view="projector"] .speeder-loader > span > span {
      background: #E2E8F0;
    }
```

### Step 2: HTML Overlay Markup in `build_acc_os.py` (Lines 716–740)

Ensure the HTML overlay includes complete accessibility attributes:

```html
  <!-- UIVERSE SPEEDER LOADING OVERLAY -->
  <div id="speederOverlay" class="speeder-overlay" role="status" aria-live="polite" aria-label="Auction Operating System Status">
    <div class="speeder-wrapper">
      <div class="speeder-loader">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div class="speeder-base">
          <span></span>
          <div class="speeder-face"></div>
        </div>
      </div>
      <div class="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div id="speederMsg" class="speeder-msg">INITIALIZING ACC AUCTION OS...</div>
    <div id="speederSub" class="speeder-sub">Connecting live WebSockets & verifying purse integrity</div>
  </div>
```

### Step 3: Hardened Controller in `build_acc_os.py` (Lines 1558–1574)

Replace the controller with the race-condition-free implementation:

```javascript
    // ========================================================
    // UIVERSE SPEEDER LOADER CONTROLLER
    // ========================================================
    let speederTimeoutId = null;

    /**
     * Display the Uiverse speeder loading overlay.
     * @param {string} title - Primary status header
     * @param {string} subtitle - Explanatory details
     * @param {number|null} durationMs - Auto-dismiss delay (default: 800ms). If <= 0 or null, stays until hideSpeeder().
     */
    function showSpeeder(title, subtitle = "Processing state synchronization across 11 nodes", durationMs = 800) {
      const overlay = document.getElementById("speederOverlay");
      if (!overlay) return;
      const titleEl = document.getElementById("speederMsg");
      const subEl = document.getElementById("speederSub");

      if (titleEl && title) titleEl.innerText = title;
      if (subEl && subtitle) subEl.innerText = subtitle;

      // Clear any prior timer to prevent premature hide
      if (speederTimeoutId) {
        clearTimeout(speederTimeoutId);
        speederTimeoutId = null;
      }

      overlay.setAttribute("aria-hidden", "false");
      overlay.classList.remove("hidden");

      if (durationMs && durationMs > 0) {
        speederTimeoutId = setTimeout(() => {
          hideSpeeder();
        }, durationMs);
      }
    }

    /**
     * Smoothly hide the speeder loading overlay.
     */
    function hideSpeeder() {
      const overlay = document.getElementById("speederOverlay");
      if (!overlay) return;
      if (speederTimeoutId) {
        clearTimeout(speederTimeoutId);
        speederTimeoutId = null;
      }
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");
    }
```

### Step 4: Boot Sequence in `build_acc_os.py` (Lines 2864–2876)

```javascript
    // ========================================================
    // INITIALIZATION ON PAGE BOOT
    // ========================================================
    window.addEventListener("DOMContentLoaded", () => {
      try {
        initFirebaseSync();
      } catch (err) {
        console.error("Boot error (Firebase sync):", err);
      }
      try {
        renderCurrentView();
      } catch (err) {
        console.error("Boot error (Render view):", err);
      }
      try {
        startTimer();
      } catch (err) {
        console.error("Boot error (Timer):", err);
      }

      // Smooth fade-out of initial speeder overlay after 900ms boot
      setTimeout(() => {
        hideSpeeder();
      }, 900);
    });
```

### Step 5: Exact Dynamic Invocation Points

The worker must verify and ensure these exact invocation calls are in place:

1. **View switches** (`switchView(view)`):
   ```javascript
   function switchView(view) {
     currentView = view;
     document.querySelectorAll(".nav-tab-btn").forEach(btn => btn.classList.remove("active"));
     const activeBtn = document.getElementById("tab-" + view);
     if (activeBtn) activeBtn.classList.add("active");

     // Set view attribute on body for theme styling
     document.body.setAttribute("data-view", view);

     // Speeder transition overlay
     const viewLabels = {
       public: "PUBLIC LIVE BOARD",
       live: "LIVE AUCTION STAGE",
       franchise: "FRANCHISE BIDDING TERMINAL",
       player: "PLAYER REGISTRATION PORTAL",
       admin: "ADMIN / OPERATOR COCKPIT",
       projector: "PROJECTOR HALL DISPLAY"
     };
     showSpeeder(`LOADING ${viewLabels[view] || view.toUpperCase()}...`, "Updating live reactive layout", 400);

     renderCurrentView();
   }
   ```

2. **Lot advances** (`advanceLot(reason)`):
   ```javascript
   function advanceLot(reason = "ADVANCE") {
     lotIndex = (lotIndex + 1) % players.length;
     const nextPlayer = players[lotIndex];
     currentPrice = nextPlayer.basePrice || 80;
     leadingBidderId = null;
     passedFranchises.clear();
     resetTimer(20);

     if (reason === "ADVANCE") {
       showSpeeder(`LOT #${nextPlayer.id} ON STAGE`, `${nextPlayer.name} (${nextPlayer.bucket} - ${nextPlayer.type}) • Base ${currentPrice}C`, 600);
     }

     renderCurrentView();
     broadcastAuctionState("ADVANCE");
   }
   ```

3. **Skips** (`skipLot()`):
   ```javascript
   function skipLot() {
     const p = players[lotIndex];
     const timestamp = new Date().toLocaleTimeString();
     auditLog.unshift({
       id: auditLog.length + 1,
       time: timestamp,
       type: "SKIP",
       msg: `Admin skipped LOT ${p.id} ${p.name}`
     });

     showSpeeder("SKIPPING LOT...", `Lot #${p.id} ${p.name} marked UNSOLD`, 600);
     setTimeout(() => {
       advanceLot("SKIP");
     }, 300);
   }
   ```

4. **Undo execution** (`executeUndo()`):
   ```javascript
   function executeUndo() {
     // ... undo state restoration ...
     closeUndoModal();
     showSpeeder("TRANSACTION UNDONE", "Purse refunded & bucket allocations recalculated", 1000);
     setTimeout(() => {
       renderCurrentView();
       broadcastAuctionState("UNDO");
     }, 600);
   }
   ```

5. **Registration submission** (`submitRegistration()`):
   ```javascript
   function submitRegistration(e) {
     if (e && e.preventDefault) e.preventDefault();
     // ... parsed roll & player validation ...
     players.push(newP);
     auditLog.unshift({
       id: auditLog.length + 1,
       time: new Date().toLocaleTimeString(),
       type: "REGISTRATION",
       msg: `Player Registered: #${newP.id} ${newP.name} (${newP.bucket} - ${newP.type})`
     });
     broadcastAuctionState("NEW_REGISTRATION", `Registered ${newP.name}`);
     showSpeeder("REGISTRATION COMPLETE!", `${newP.name} added to auction lot pool (#${newP.id})`, 1200);

     setTimeout(() => {
       switchView('public');
     }, 1200);
   }
   ```

6. **Sync status updates** (Firebase & BroadcastChannel):
   - In `pushLocalStateToCloud(notify = true)`:
     ```javascript
     if (notify) showSpeeder("PUSHING TO FIREBASE...", "Uploading full auction ledger & franchise state", 800);
     ```
   - In `pullCloudState()`:
     ```javascript
     showSpeeder("PULLING FROM FIREBASE...", "Fetching authoritative state from Firestore", 800);
     ```
   - In `switchFirebaseRoom()`:
     ```javascript
     showSpeeder("SWITCHING TOURNAMENT ROOM...", `Connecting to ${currentRoomId}`, 600);
     ```
   - In `updateFirebaseStatusUI(status, label, notifySpeeder = false)`:
     ```javascript
     if (notifySpeeder) {
       if (status === "connected") {
         showSpeeder("CLOUD SYNC ONLINE", `Connected to Firebase (${currentRoomId})`, 600);
       } else if (status === "local") {
         showSpeeder("LOCAL SYNC ACTIVE", "High-speed multi-tab broadcast enabled", 600);
       } else if (status === "error") {
         showSpeeder("SYNC ERROR", "Check Firebase config or offline connection", 900);
       }
     }
     ```

---

## 5. Verification Method

To verify these specifications independently:

1. **Static Inspection**:
   - Check `build_acc_os.py` lines 378–550 to ensure `.speeder-overlay` has `position: fixed`, `width: 100vw; height: 100dvh; z-index: 99999; will-change: opacity, visibility; contain: strict;`.
   - Check `speederTimeoutId` declaration and `clearTimeout` call in `showSpeeder`.
   - Check `hideSpeeder()` presence and invocation in DOMContentLoaded.
2. **CLS Verification**:
   - Run Google Chrome DevTools Performance panel / Web Vitals extension against `Acc-Auction-Os.html`.
   - Verify Cumulative Layout Shift (CLS) = `0.000` during initial boot and during all 6 view switches.
3. **Interactive Verification**:
   - Load `Acc-Auction-Os.html` in browser: observe speeder bike and longfazers animating immediately upon load, then smoothly fading away at 900ms.
   - Click each tab in header nav (`Public`, `Live`, `Franchise`, `Player`, `Admin`, `Projector`): confirm crisp 400ms speeder transition.
   - In `Admin` console, click `SKIP LOT`: confirm speeder displays `SKIPPING LOT...`.
   - In `Player Registration`, submit valid form: confirm speeder displays `REGISTRATION COMPLETE!` for 1200ms before auto-transitioning to Public view.
   - In `Admin` console, trigger undo in Forensic Undo modal: confirm speeder displays `TRANSACTION UNDONE`.
   - Switch to Projector view: confirm speeder overlay adapts to auditorium dark mode without white flash.
