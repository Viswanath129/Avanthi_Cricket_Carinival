# Technical Audit Handoff Report: ACC Auction OS Feature Surfaces

**Target System**: `B:\projects\ACC\Acc-Auction-Os.html` (~17,078 lines single-file Web OS)  
**Audit Scope**: Read-Only Comprehensive Technical Audit across all 6 core user-facing feature surfaces (Admin Console, Player Registration & Photo Cropper, Franchise Registration & Approval, Auth & Identity Security, Auction Mechanics & Shortcuts, Public & Live Views).  
**Auditor**: Explorer Subagent (`explorer_survey_features_1`)  
**Target Recipient**: Orchestrator / Lead Architect (`66041fa3-be11-41c6-9f64-93d3c8cf496f`)

---

## 1. Observation

### Surface 1: Admin Console (Tabs, Player Governance, Buckets, Draw Modes, Lot Execution)
- **Obs 1.1 (DEMO_MODE Navigation Tab Suppression)**:
  - *Location*: Lines 12977–12981.
  - *Code*:
    ```javascript
    const navTabs = (window.DEMO_MODE)
      ? ['OVERVIEW', 'AUCTION', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS', 'FRANCHISES', 'ROUND 2', 'AUDIT', 'SETTINGS']
      : ['OVERVIEW', 'AUCTION', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS', 'FRANCHISES', 'ROUND 2', 'AUDIT', 'SETTINGS', 'ADMIN ACCOUNTS'];
    ```
  - *Finding*: When `DEMO_MODE` is enabled (`window.DEMO_MODE = true` at line 2755), `ADMIN ACCOUNTS` (implemented at lines 15247–15309) and `FRANCHISE MEMBERS` (lines 13218–13247) are excluded from the navigation bar array. Users navigating in demo mode cannot access admin account provisioning/management through the interface.
- **Obs 1.2 (Demo Mode Destructive Action Leaks)**:
  - *Location*: Lines 15189–15204, 15303, 11442.
  - *Code*:
    - Lines 15189–15204: In `renderSettingsTab()`, `CARD 2: TRASH & RESTORE` and `<button class="btn btn-secondary" onclick="openTrashManagementModal()">OPEN TRASH</button>` are rendered unconditionally without `!DEMO_MODE` guards.
    - Line 15303: In `renderAdminAccountsTab()`, `<button class="btn btn-danger btn-sm" onclick="deleteAdminAccount('${u.username}')">DELETE</button>` is rendered unconditionally without demo mode restriction.
    - Line 11442: In `openUserManagementModal()`, `<button class="btn btn-danger" onclick="openDeleteUserConfirmationModal('${u.uid}')">DELETE</button>` is rendered for every user.
  - *Finding*: Despite the system requirement that destructive operations (deleting users, emptying trash, purge) must be suppressed or gated in demo mode, these action buttons remain active and clickable.
- **Obs 1.3 (Synthetic Admin Account Provisioning Disconnect)**:
  - *Location*: Lines 8403–8420.
  - *Code*:
    ```javascript
    function handleCreateAdminSubmit(e) {
      ...
      const newAdmin = {
        uid: "usr_admin_" + Date.now(),
        username: uName,
        passwordHash: pass,
        role: "ADMIN",
        name: dName,
        ...
      };
      users.push(newAdmin);
      saveUsersToStorage();
      ...
    }
    ```
  - *Finding*: Newly created administrators are pushed solely to local in-memory array `users` and `localStorage`. No Firebase Auth account (`createUserWithEmailAndPassword`) or Firestore `/users` document is created. A newly provisioned admin cannot authenticate against Firebase services.
- **Obs 1.4 (Lot Index Desync on Player Deletion)**:
  - *Location*: Lines 4645–4646.
  - *Code*:
    ```javascript
    const [del] = players.splice(idx, 1);
    deletedPlayers.push(del);
    ```
  - *Finding*: When an administrator deletes a player from the player roster, `players.splice(idx, 1)` is called without adjusting `lotIndex` or bounds-checking. If the deleted player preceded or matched the current `lotIndex`, `lotIndex` now points to the wrong player or out-of-bounds `undefined`, causing the active auction panel to fail or render corrupted lot data.
- **Obs 1.5 (Direct Assign vs. Undo Cascade Breakage & Roll Truncation)**:
  - *Location*: Lines 12688, 12716–12720 vs. Lines 9133–9139.
  - *Code*:
    - Line 12688: `const pId = parseInt(document.getElementById("directAssignPlayerSelect").value, 10);`
    - Lines 12716–12720:
      ```javascript
      player.franchiseId = franchise.id;
      player.franchiseName = franchise.name;
      player.salePrice = price;
      player.status = 'SOLD';
      ```
    - Lines 9133–9139 in `executeUndoSale()`:
      ```javascript
      const leader = franchises.find(f => f.name === targetPlayer.soldTo);
      const refund = targetPlayer.soldPrice || targetPlayer.price || 0;
      ```
  - *Finding*: `executeDirectAssign` sets `player.franchiseName` and `player.salePrice`, but fails to set `player.soldTo` or `player.price`. When an admin executes "Undo Sale" on a directly assigned player, `executeUndoSale()` looks for `targetPlayer.soldTo`, which is `undefined`, causing purse refunding and squad deduction to fail silently. Furthermore, `parseInt(..., 10)` truncates alphanumeric roll numbers (e.g. `"26811A0501"` becomes `26811`), failing to find the player in `players`.
- **Obs 1.6 (Conflicting Draw Mode Definitions & Broken Manual Lot Modal)**:
  - *Location*: Lines 3027–3036 vs. Lines 12851–12855 & Line 6688.
  - *Code*:
    - Lines 3027–3036: Defines draw mode toggles between `'AUTO'` and `'MANUAL'`.
    - Lines 12851–12855:
      ```javascript
      function toggleDrawMode() {
        drawMode = (drawMode === 'AUTO') ? 'GUEST' : 'AUTO';
        ...
      }
      ```
    - Line 6688 in `drawNextPlayer()`:
      ```javascript
      if (drawMode === 'MANUAL') {
        openManualLotDrawModal();
        return;
      }
      ```
  - *Finding*: `toggleDrawMode` overwrites the state to `'GUEST'`, meaning `drawMode === 'MANUAL'` evaluates to `false`. Keyboard shortcut 'D' and draw button clicks never open `openManualLotDrawModal()`.
- **Obs 1.7 (Syntax Error / Unquoted Identifier in Manual Lot Modal)**:
  - *Location*: Line 6798.
  - *Code*:
    ```javascript
    ${isAvail ? `revealAndStartAuctionLot(${p.id})` : ''}
    ```
  - *Finding*: If `p.id` is a string (e.g., student roll number `"26811A0501"` or `"p_101"`), the rendered HTML `<div onclick="revealAndStartAuctionLot(26811A0501)">` or `<div onclick="revealAndStartAuctionLot(p_101)">` produces an uncaught JavaScript `SyntaxError` (invalid identifier) or `ReferenceError: p_101 is not defined`.
- **Obs 1.8 (Quick Lot Call Identifier Mismatch)**:
  - *Location*: Lines 6696–6705 vs. Line 6549.
  - *Code*:
    - Line 6701: `revealAndStartAuctionLot(num);` (where `num` is parsed from `quickLotNumberInput` labeled "Lot #").
    - Line 6549: `const p = players.find(x => x.id == playerId || x.roll == playerId);`
  - *Finding*: A lot number (e.g., Lot 5) does not equal a player's ID or Roll number for registered players. Entering "5" searches for player ID 5 or roll 5, resulting in "Player #5 not found in catalog".

---

### Surface 2: Player Registration & Photo Editor
- **Obs 2.1 (Canvas Dark Background Injection Ruining Assets)**:
  - *Location*: Lines 7483–7484 in `commitPhotoEditor()`.
  - *Code*:
    ```javascript
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, targetW, targetH);
    ```
  - *Finding*: The 4:3 cropper unconditionally fills the canvas with dark slate `#0b0f19` before rendering the cropped image. Any transparent PNGs, official portraits, or franchise logos lose their alpha channel and are permanently baked onto an opaque black/dark box, corrupting stadium and live stream assets.
- **Obs 2.2 (Duplicate Mobile Number Collision with Mock Defaults)**:
  - *Location*: Line 8013 vs. Line 2640.
  - *Code*:
    - Line 2640: Fills blank player records with dummy mobile numbers `9876543201`, `9876543202`, etc.
    - Line 8013:
      ```javascript
      const existingPlayerByMobile = players.find(p => p.mobile === mobileClean);
      if (existingPlayerByMobile) {
        showToast("MOBILE NUMBER ALREADY REGISTERED", "error");
        return;
      }
      ```
  - *Finding*: Any registrant entering a standard mock number or real numbers matching the generated dummy sequence is permanently blocked from registering.
- **Obs 2.3 (Duplicate Roll Check Omits Deleted / Archived Store)**:
  - *Location*: Line 8006.
  - *Code*:
    ```javascript
    const existingPlayerByRoll = players.find(p => (p.roll || '').toUpperCase() === rollClean.toUpperCase());
    ```
  - *Finding*: The check searches only active `players`. `deletedPlayers` and Firestore collections are ignored. Re-registering an archived or deleted student leads to key collisions and orphaned records in audit logs.

---

### Surface 3: Franchise Registration & Approval
- **Obs 3.1 (Franchise ID Generation Array-Length Collision Bug)**:
  - *Location*: Line 9962 in `submitFranchiseRegistration()`.
  - *Code*:
    ```javascript
    const nextId = franchises.length + 1;
    ```
  - *Finding*: Uses `franchises.length + 1` instead of `Math.max(...franchises.map(f => f.id), 0) + 1`. If franchises are filtered, deleted, or removed, duplicate IDs are assigned, causing state collisions in purse calculation and squad attribution.
- **Obs 3.2 (Missing Franchise Members Provisioning on Registration)**:
  - *Location*: Lines 9976–9990.
  - *Code*: Stores coordinator and captain strings on the `newFranchise` object, but never pushes records into `window.franchiseMembers`.
  - *Finding*: The Admin Console's 'FRANCHISE MEMBERS' tab (lines 13218–13247) iterates over `franchiseMembers`. Newly registered franchise teams show zero members in the administrative table.
- **Obs 3.3 (Captain Identity Account Skipped on Admin Approval)**:
  - *Location*: Lines 5473–5488 in `adminApproveFranchise()`.
  - *Code*:
    ```javascript
    users.push({
      uid: "usr_fran_" + f.id,
      username: (f.shortCode || "FRAN" + f.id).toLowerCase(),
      role: "FRANCHISE",
      franchiseId: f.id,
      identityRole: "COORDINATOR",
      ...
    });
    ```
  - *Finding*: The approval routine only creates the `COORDINATOR` account. The dual-identity `TEAM_LEADER` (Captain) account required by system specifications is never generated or seeded into `users`.

---

### Surface 4: Auth Flows & State Security
- **Obs 4.1 (Root Bypass / Auto-Login as Super Admin on Navigation)**:
  - *Location*: Lines 16736–16744.
  - *Code*:
    ```javascript
    if (window.DEMO_MODE && hash === "admin" && !currentUser) {
      currentUser = INITIAL_USERS[0];
      localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
      ...
    }
    ```
  - *Finding*: In `DEMO_MODE` (the default deployment state), any public visitor navigating to `#admin` is automatically granted `SUPER_ADMIN` credentials and written into `localStorage`, bypassing authentication entirely.
- **Obs 4.2 (Post-Logout Immediate Re-Login Loop via Stale View Key)**:
  - *Location*: Lines 16727–16732 & Lines 8809–8830.
  - *Code*:
    - Lines 8809–8830 (`logoutUser()`): Removes `acc_current_user_2026` from `localStorage`, but leaves `acc_last_active_view = "admin"`.
    - Line 16730: `const hash = location.hash.replace(/^#/, "") || localStorage.getItem("acc_last_active_view") || "public";`
  - *Finding*: When an admin clicks "Logout", the page reloads. Line 16730 reads `acc_last_active_view` ("admin"), triggering the auto-login bypass in Obs 4.1. The user can never log out of the admin panel.
- **Obs 4.3 (Hardcoded Universal Passwords Across All Roles)**:
  - *Location*: Lines 8581–8594, 8634–8645, 8769–8782.
  - *Code*:
    - Admin: Line 8589: `if (pass === "ACC@Admin#2026!" || pass === u.passwordHash)`
    - Franchise: Lines 8636–8640: `pass === expectedFranchisePass || pass === "TeamX@2026" || pass === "Franchise@2026"`
    - Player: Line 8774: `if (pass === "Player@2026" || pass === (p.mobile || "").slice(-4))`
  - *Finding*: Hardcoded master passwords bypass individual user authentication, allowing anyone with the static string to access any franchise, admin, or player account.
- **Obs 4.4 (Complete Absence of URL Search Parameter Route Isolation)**:
  - *Location*: Throughout `Acc-Auction-Os.html`.
  - *Finding*: `window.location.search` (`URLSearchParams`) is never inspected for `/login?mode=...`. The system renders all four login tabs (Player, Franchise, Super Admin, Operator) simultaneously without mode segregation.
- **Obs 4.5 (Player Portal Identity Hijack Fallback)**:
  - *Location*: Lines 12287–12291, 12106, 12193.
  - *Code*:
    ```javascript
    const targetPlayer = (currentUser && currentUser.playerId)
      ? players.find(p => p.id === currentUser.playerId)
      : (players.find(p => p.roll === getUrlParam('roll')) || players[0]);
    ```
  - *Finding*: If an unauthenticated guest visits the player portal (`#player-portal`), `players[0]` (Sai Teja) is selected as a fallback. The guest is granted complete access to Sai Teja's portal, including photo re-uploading and pass generation.

---

### Surface 5: Auction Mechanics & Shortcuts
- **Obs 5.1 (Unscoped Global Keyboard Shortcuts Execution)**:
  - *Location*: Lines 12892–12920.
  - *Code*:
    ```javascript
    window.addEventListener('keydown', (e) => {
      ...
      if (adminNavTab !== 'AUCTION') return;
      ...
    });
    ```
  - *Finding*: The key listener checks only `adminNavTab !== 'AUCTION'`. It does NOT verify `currentView === 'admin'` or `currentUser.role === 'ADMIN'`. If `adminNavTab` was left at `'AUCTION'`, a public viewer on the public screen who presses `H` (Hammer), `S` (Sold), `P` (Pass), `U` (Undo), or Space triggers administrative auction mutations.
- **Obs 5.2 (Timer Zero Auto-Popup of Admin Hammer Modal on All Clients)**:
  - *Location*: Lines 6348–6351 in `AuctionTimerEngine.renderTick()`.
  - *Code*:
    ```javascript
    if (remain <= 0) {
      ...
      openHammerConfirmModal();
    }
    ```
  - *Finding*: When the countdown timer reaches zero, `openHammerConfirmModal()` is invoked universally. It renders the admin "CONFIRM SALE" modal on all devices running the app, including projector screens and public viewports.
- **Obs 5.3 (Sold Price Property Mismatch in Squad Terminals)**:
  - *Location*: Line 9820 vs. Line 6892.
  - *Code*:
    - Line 6892 in `executeHammerSale`: `cur.price = currentBid;` (does not set `cur.soldPrice`).
    - Line 9820 in `renderFranchiseTerminalView`: `${p.soldPrice} C`
  - *Finding*: `p.soldPrice` evaluates to `undefined`, displaying literal `undefined C` on the franchise bidding console squad list.
- **Obs 5.4 (Dead / Stub Pass Button on Franchise Bidding Terminal)**:
  - *Location*: Line 9782 vs. Line 6163.
  - *Code*:
    - Line 9782: `<button class="btn btn-secondary" onclick="showToast('Passed on lot #' + cur.id, 'info')">PASS</button>`
    - Line 6163: `function passLot(franchiseId) { ... }`
  - *Finding*: The "PASS" button only triggers an informational toast. It never calls `passLot(myFranchise.id)`, failing to record the pass or lock out the franchise.

---

### Surface 6: Public & Live Views
- **Obs 6.1 (Wrong Player Lot Mismatch on Public View)**:
  - *Location*: Lines 9287–9288 in `renderPublicView()`.
  - *Code*:
    ```javascript
    const verifiedPool = players.filter(p => isPlayerPubliclyVisible(p));
    const cur = verifiedPool[lotIndex] || verifiedPool[0];
    ```
  - *Finding*: `lotIndex` tracks index position in the master `players` array, whereas `verifiedPool` is a filtered subset. Filtering causes an off-by-N offset, displaying an entirely different player to the public than the one currently on the auction block.
- **Obs 6.2 (Hardcoded "ACTIVE" Status Badge on Franchise Cards)**:
  - *Location*: Line 9850 in `render11FranchisesView()`.
  - *Code*:
    ```javascript
    <span class="status-badge status-connected">ACTIVE</span>
    ```
  - *Finding*: The status badge is hardcoded as `ACTIVE` for all franchises, failing to reflect `PENDING_APPROVAL` or `DISABLED` states.
- **Obs 6.3 (Firestore 1 MB Document Size Overflow on Live Broadcast)**:
  - *Location*: Lines 16353–16396 in `broadcastAuthoritativeState()`.
  - *Code*: Serializes `players` (with base64 data URL images), `franchises` (with base64 logos), and `auditLog` into a single document `acc_main_2026`.
  - *Finding*: Storing raw base64 photos in an array within a single Firestore document quickly exceeds Firestore's 1,048,576 byte (1 MB) document limit. Once exceeded, all live state synchronization fails permanently with `FirebaseError: Document exceeds maximum allowed size`.

---

## 2. Logic Chain

1. **Premise**: `Acc-Auction-Os.html` is engineered as a monolithic single-file web application combining Admin, Franchise, Player, and Public roles into a shared runtime.
2. **Analysis of State & Navigation (Obs 1.1, 4.1, 4.2, 4.5)**:
   - Because all roles share a global window context, security boundaries rely on client-side routing and flags (`DEMO_MODE`, `currentView`, `currentUser`).
   - The default `DEMO_MODE = true` triggers auto-assignment of `INITIAL_USERS[0]` whenever `#admin` is hit (Obs 4.1).
   - Incomplete logout cleanup (preserving `acc_last_active_view = "admin"`) creates an inescapable auto-login loop (Obs 4.2).
   - Unauthenticated visitors hitting `#player-portal` fall back to `players[0]` (Obs 4.5).
   - Together, these findings demonstrate that **role isolation is currently broken**, allowing unauthorized access and identity leakage across all user types.
3. **Analysis of Admin Operations & Auction Execution (Obs 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 5.4)**:
   - Data mutations lack relational consistency: `executeDirectAssign` does not populate `soldTo` or `soldPrice`, breaking `executeUndoSale` (Obs 1.5).
   - Deleting a player splices the array without adjusting `lotIndex`, corrupting subsequent lot references (Obs 1.4).
   - Draw modes are inconsistent (`AUTO` vs `GUEST` vs `MANUAL`), rendering manual lot selection unreachable (Obs 1.6).
   - Keyboard event listeners do not check user role or view context, enabling any connected client to mutate auction state (Obs 5.1).
   - The countdown timer automatically opens the hammer confirmation modal on all connected displays, rather than restricting it to the active auctioneer (Obs 5.2).
   - The franchise "PASS" button is a visual stub that does not invoke the state engine (Obs 5.4).
4. **Analysis of Media Assets & Live Synchronization (Obs 2.1, 6.1, 6.3)**:
   - The canvas photo cropper injects `#0b0f19`, corrupting transparent PNG assets and logos (Obs 2.1).
   - The public view maps `lotIndex` directly onto a filtered `verifiedPool`, desynchronizing public lot display from the auctioneer's screen (Obs 6.1).
   - Storing embedded base64 images directly inside `acc_main_2026` will exceed Firestore's 1 MB document ceiling as registrations grow, risking complete system lockup during live broadcast (Obs 6.3).

---

## 3. Caveats

1. **Simulation Environment**: All findings were identified through static code analysis of `Acc-Auction-Os.html`. Runtime interaction was validated against code execution logic, but live Firebase Firestore quota failures were not triggered against a production database.
2. **Network Mode**: Static analysis conducted locally. Third-party cloud functions or external Firebase security rules (if defined externally in Firebase Console) were not inspected.
3. **Browser Compatibility**: Canvas `#0b0f19` fill behavior is standard across HTML5 Canvas implementations, but individual browser rendering of unquoted IDs (Obs 1.7) will consistently throw JavaScript syntax errors across V8, JavaScriptCore, and SpiderMonkey.

---

## 4. Conclusion

`Acc-Auction-Os.html` contains critical operational flaws and security vulnerabilities across all six investigated surfaces:
1. **Critical Security & Auth Vulnerabilities**: Complete authentication bypass on `#admin` navigation, un-terminable admin sessions due to stale view storage, universal fallback identity hijacking in the player portal, and hardcoded master passwords.
2. **Critical Auction Engine Flaws**: Broken undo cascade on direct assignment, un-gated global keyboard shortcuts, universal modal popups on timer expiration, and index desynchronization on player deletion.
3. **Display & Asset Integrity Issues**: Dark background injection ruining transparent logos, off-by-N lot mismatches on public screens, and imminent Firestore 1 MB document overflow from embedded base64 media.

These issues must be resolved before conducting live auction operations.

---

## 5. Verification Method

### Step 1: Verify Auth Bypass & Session Loop
1. Open `Acc-Auction-Os.html` in an Incognito browser window.
2. Navigate directly to `Acc-Auction-Os.html#admin`.
3. Check `localStorage.getItem("acc_current_user_2026")` in DevTools Console.  
   *Result*: It returns `{ role: "ADMIN", ... }` and opens the full Super Admin dashboard without prompting for credentials.
4. Click "Logout".  
   *Result*: Page refreshes and immediately logs back in as Super Admin.

### Step 2: Verify Unquoted ID Syntax Error in Manual Lot Modal
1. In DevTools Console, inspect line 6798:
   ```javascript
   // Test string ID evaluation:
   const p = { id: "26811A0501" };
   const html = `<div onclick="revealAndStartAuctionLot(${p.id})"></div>`;
   console.log(html); // Outputs: <div onclick="revealAndStartAuctionLot(26811A0501)"></div>
   ```
2. Triggering click throws `Uncaught SyntaxError: Invalid or unexpected token`.

### Step 3: Verify Direct Assign Undo Cascade Failure
1. Perform Direct Assign of any player to any franchise.
2. Inspect the assigned player object in `players`: `player.soldTo` is `undefined`.
3. Call `executeUndoSale(player.id)`.  
   *Result*: `franchises.find(f => f.name === targetPlayer.soldTo)` returns `undefined`; purse is not refunded, squad count remains unchanged.

### Step 4: Verify Public Screen Lot Desynchronization
1. Add an unverified player at index 0 of `players`.
2. Advance `lotIndex` to 1 (Player B).
3. Switch view to `#public`.  
   *Result*: `verifiedPool[1]` resolves to Player C instead of Player B.
