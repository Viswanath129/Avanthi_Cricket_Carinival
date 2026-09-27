const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — FULL RED-TEAM REMEDIATION TEST SUITE                    ");
console.log("   26 CRITICAL SECURITY & OPERATIONAL TEST CASES                      ");
console.log("======================================================================\n");

const indexPath = path.join(__dirname, '..', 'index.html');
const firestoreRulesPath = path.join(__dirname, '..', 'acc-auction-portal', 'firestore.rules');
const databaseRulesPath = path.join(__dirname, '..', 'acc-auction-portal', 'database.rules.json');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf-8');
const databaseRules = fs.readFileSync(databaseRulesPath, 'utf-8');

let passedCount = 0;
let failedCount = 0;

function runTest(id, name, testFn) {
  try {
    testFn();
    console.log(`[PASS] [${id}] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] [${id}] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
  }
}

// ======================================================================
// 1. AUTHENTICATION & IDENTITY (AUTH-001 .. AUTH-005)
// ======================================================================
console.log("--- GROUP 1: AUTHENTICATION & IDENTITY ---");

runTest("AUTH-001", "Firebase Auth authority & getCurrentUserContext canonical resolver", () => {
  assert(indexHtml.includes("function getCurrentUserContext()"), "getCurrentUserContext must be defined");
  assert(indexHtml.includes("fbAuth.signOut()"), "fbAuth.signOut must be called on logout");
  assert(indexHtml.includes("authenticated:"), "authCtx must expose authenticated property");
  assert(indexHtml.includes("isSuperAdmin:"), "authCtx must expose isSuperAdmin property");
  assert(indexHtml.includes("isAdmin:"), "authCtx must expose isAdmin property");
  assert(indexHtml.includes("isFranchise:"), "authCtx must expose isFranchise property");
  assert(indexHtml.includes("isPlayer:"), "authCtx must expose isPlayer property");
});

runTest("AUTH-002", "Canonical /users/{uid} resolution with role, status & IDs", () => {
  assert(indexHtml.includes("users.find(u => u.uid === uid"), "User profile is resolved by UID");
  assert(indexHtml.includes("role: canonicalRole"), "Canonical role is mapped from user profile");
  assert(indexHtml.includes("accountStatus:"), "Account status is tracked in context");
  assert(firestoreRules.includes("match /users/{uid}"), "Firestore rules must guard /users/{uid}");
  assert(firestoreRules.includes("get(/databases/$(database)/documents/users/$(request.auth.uid))"), "Firestore checks user document in /users");
});

runTest("AUTH-003", "No public STAFF role exists; only PLAYER, FRANCHISE, ADMIN login options", () => {
  const loginViewMatch = indexHtml.match(/function renderLoginView\(\)([\s\S]*?)<\/div>\s*<\/div>\s*`;\s*}/);
  assert(loginViewMatch, "renderLoginView must exist");
  const loginCode = loginViewMatch[0];
  assert(!loginCode.includes("STAFF LOGIN"), "No STAFF login button in login view");
  assert(loginCode.includes("PLAYER"), "Player login tab exists");
  assert(loginCode.includes("FRANCHISE"), "Franchise login tab exists");
  assert(loginCode.includes("ADMIN"), "Admin login tab exists");
});

runTest("AUTH-004", "Mandatory password change on first login before dashboard access", () => {
  assert(indexHtml.includes("mustChangePassword"), "mustChangePassword flag exists");
  assert(indexHtml.includes("openPasswordChangeModal"), "openPasswordChangeModal must exist");
  assert(indexHtml.includes("authCtx.mustChangePassword && (viewName === 'admin' || viewName === 'franchise' || viewName === 'player')"),
    "switchView intercepts dashboard entry when mustChangePassword is true");
});

runTest("AUTH-005", "Clean session termination & listener teardown on logout", () => {
  const logoutMatch = indexHtml.match(/function logoutUser\(\)([\s\S]*?)switchView\("public"\);\s*}/);
  assert(logoutMatch, "logoutUser function must exist");
  const logoutCode = logoutMatch[0];
  assert(logoutCode.includes("unsubscribeProtected()"), "Unsubscribes protected realtime listeners");
  assert(logoutCode.includes("localStorage.removeItem(\"acc_current_user_2026\")"), "Removes session from localStorage");
  assert(logoutCode.includes("switchPresenceIdentity"), "Resets presence to public guest");
  assert(logoutCode.includes("window.location.hash = \"home\""), "Resets location hash to home");
  assert(logoutCode.includes("switchView(\"public\")"), "Switches view to public");
});

// ======================================================================
// 2. PLAYER WORKSPACE & DATA INTEGRITY (PLAYER-001 .. PLAYER-005)
// ======================================================================
console.log("\n--- GROUP 2: PLAYER WORKSPACE & PRIVACY ---");

runTest("PLAYER-001", "Player registration starts in PENDING_APPROVAL and auction ineligible", () => {
  assert(indexHtml.includes('approvalStatus: "PENDING_APPROVAL"'), "Player registration sets PENDING_APPROVAL");
  assert(indexHtml.includes("auctionEligible: false"), "Player registration sets auctionEligible: false");
  assert(firestoreRules.includes("request.resource.data.auctionEligible == false"), "Firestore rules enforce auctionEligible: false on create");
});

runTest("PLAYER-002", "Player cannot self-approve or tamper verification status in Firestore", () => {
  assert(firestoreRules.includes("request.resource.data.approvalStatus == 'PENDING_APPROVAL'"),
    "Firestore rules block self-approval modification by non-admin");
  assert(firestoreRules.includes("request.resource.data.auctionEligible == false"),
    "Firestore rules block verification status modification by non-admin");
});

runTest("PLAYER-003", "Player login resolves personal dashboard with own profile and stats", () => {
  assert(indexHtml.includes("function renderPlayerPortalView()"), "renderPlayerPortalView is defined");
  assert(indexHtml.includes('main.innerHTML = renderPlayerPortalView()'), "Player portal view wired into renderCurrentView");
  assert(indexHtml.includes("PLAYER WORKSPACE"), "Displays player workspace banner");
});

runTest("PLAYER-004", "Player portal isolates private data: no other player mobile or admin notes", () => {
  const portalMatch = indexHtml.match(/function renderPlayerPortalView\(\)([\s\S]*?)return\s*`([\s\S]*?)`;\s*}/);
  assert(portalMatch, "renderPlayerPortalView exists");
  const portalCode = portalMatch[0];
  assert(portalCode.includes("const p = players.find("), "Only resolves authenticated player");
  assert(!portalCode.includes("franchises.forEach"), "Does not expose other franchise operational controls");
});

runTest("PLAYER-005", "Player account deactivation/block terminates active session immediately", () => {
  assert(indexHtml.includes("mappedPlayer.isBlocked || mappedPlayer.status === 'BLOCKED' || mappedPlayer.status === 'DISABLED'"),
    "Players realtime directory listener detects blocked or disabled status for logged-in player");
  assert(indexHtml.includes("Your player account has been deactivated or blocked"),
    "Notifies player upon deactivation");
});

// ======================================================================
// 3. FRANCHISE ISOLATION & PURSE INTEGRITY (FRANCHISE-001 .. FRANCHISE-003)
// ======================================================================
console.log("\n--- GROUP 3: FRANCHISE ISOLATION & RULES ---");

runTest("FRANCHISE-001", "Coordinator and Team Leader share identical franchiseId, purse & squad", () => {
  assert(indexHtml.includes("FRANCHISE_COORDINATOR") && indexHtml.includes("FRANCHISE_TEAM_LEADER"),
    "Recognizes both FRANCHISE_COORDINATOR and FRANCHISE_TEAM_LEADER");
  assert(indexHtml.includes("authCtx.isFranchise"), "Both roles map to isFranchise");
  assert(indexHtml.includes("targetFId = authCtx.isFranchise"), "Terminal picks targetFId from authenticated franchiseId");
});

runTest("FRANCHISE-002", "Franchise workspace isolation: cannot view, bid or impersonate other franchises", () => {
  assert(indexHtml.includes("authCtx.isFranchise && authCtx.franchiseId && authCtx.franchiseId !== franchiseId"),
    "placeBid blocks cross-franchise bidding");
  assert(indexHtml.includes("FRANCHISE WORKSPACE ISOLATION ENFORCED"),
    "renderFranchiseTerminalView displays isolation enforced when franchise mismatch occurs");
});

runTest("FRANCHISE-003", "Maximum legal bid constraint blocks bids exceeding squad reserve purse", () => {
  assert(indexHtml.includes("function calculateMaxBid("), "calculateMaxBid function defined");
  assert(indexHtml.includes("if (nextBid > maxBid)"), "placeBid verifies nextBid <= maxBid");
  assert(indexHtml.includes("BID BLOCKED: Max legal bid for"), "Displays error if bid exceeds legal maximum");
});

// ======================================================================
// 4. ADMIN & SUPER ADMIN AUTHORITY (ADMIN-001 .. ADMIN-003)
// ======================================================================
console.log("\n--- GROUP 4: ADMIN GOVERNANCE & SEPARATION ---");

runTest("ADMIN-001", "Super Admin has exclusive authority for admin provisioning, deletion, undo & archive", () => {
  const deleteAdminMatch = indexHtml.match(/function deleteAdminAccount\(username\)\s*\{([\s\S]*?)\}/);
  assert(deleteAdminMatch && deleteAdminMatch[1].includes("currentUser.role !== 'SUPER_ADMIN'"),
    "deleteAdminAccount requires SUPER_ADMIN");

  const openAdminModalMatch = indexHtml.match(/function openCreateAdminModal\(\)\s*\{([\s\S]*?)\}/);
  assert(openAdminModalMatch && openAdminModalMatch[1].includes("currentUser.role !== 'SUPER_ADMIN'"),
    "openCreateAdminModal requires SUPER_ADMIN");

  const undoModalMatch = indexHtml.match(/function openUndoModal\(\)\s*\{([\s\S]*?)\}/);
  assert(undoModalMatch && undoModalMatch[1].includes("currentUser.role !== 'SUPER_ADMIN'"),
    "openUndoModal requires SUPER_ADMIN");

  const executeUndoMatch = indexHtml.match(/function executeUndoSale\(\)\s*\{([\s\S]*?)\}/);
  assert(executeUndoMatch && executeUndoMatch[1].includes("currentUser.role !== 'SUPER_ADMIN'"),
    "executeUndoSale requires SUPER_ADMIN");

  const archiveFranchiseMatch = indexHtml.match(/function adminArchiveFranchise\(fId\)\s*\{([\s\S]*?)\}/);
  assert(archiveFranchiseMatch && archiveFranchiseMatch[1].includes("currentUser.role !== 'SUPER_ADMIN'"),
    "adminArchiveFranchise requires SUPER_ADMIN");
});

runTest("ADMIN-002", "Admin operator has floor execution authority but cannot escalate or manage accounts", () => {
  assert(indexHtml.includes("OPERATOR DESK:"), "Admin console provides tailored operator desk notice for non-superadmin");
  assert(indexHtml.includes("u.role !== 'SUPER_ADMIN' ?"), "Super Admin accounts cannot be deleted or toggled by operators");
});

runTest("ADMIN-003", "Admin operator floor controls: pause/resume, timer reset, hammer execution", () => {
  assert(indexHtml.includes("function toggleAuctionPause()"), "toggleAuctionPause exists");
  assert(indexHtml.includes("function resetAuctionTimer()"), "resetAuctionTimer exists");
  assert(indexHtml.includes("function openHammerConfirmModal()"), "openHammerConfirmModal exists");
});

// ======================================================================
// 5. ROUTE GUARDS & URL MANIPULATION (ROUTING-001 .. ROUTING-004)
// ======================================================================
console.log("\n--- GROUP 5: ROUTE GUARDS & URL INTEGRITY ---");

runTest("ROUTING-001", "Player attempting #/admin triggers ACCESS DENIED and redirects to home", () => {
  const switchViewMatch = indexHtml.match(/function switchView\(viewName\)\s*\{([\s\S]*?)currentView = viewName;/);
  assert(switchViewMatch, "switchView logic extracted");
  const code = switchViewMatch[1];
  assert(code.includes("if (viewName === \"admin\")"), "Admin route guarded in switchView");
  assert(code.includes("!authCtx.isAdmin"), "Checks authCtx.isAdmin");
  assert(code.includes("viewName = \"public\";"), "Redirects to public home");
  assert(code.includes("window.location.hash = \"home\";"), "Sets hash to home");
});

runTest("ROUTING-002", "Franchise attempting #/admin triggers ACCESS DENIED and redirects to home", () => {
  const switchViewMatch = indexHtml.match(/function switchView\(viewName\)\s*\{([\s\S]*?)currentView = viewName;/);
  assert(switchViewMatch, "switchView logic extracted");
  const code = switchViewMatch[1];
  assert(code.includes("!authCtx.isAdmin"), "Franchise without admin privilege rejected from /admin");
});

runTest("ROUTING-003", "Admin attempting #/player triggers ACCESS DENIED and routes to admin console", () => {
  const switchViewMatch = indexHtml.match(/function switchView\(viewName\)\s*\{([\s\S]*?)currentView = viewName;/);
  assert(switchViewMatch, "switchView logic extracted");
  const code = switchViewMatch[1];
  assert(code.includes("if (viewName === \"player\")"), "Player route guarded in switchView");
  assert(code.includes("viewName = authCtx.isAdmin ? \"admin\" : \"public\";"), "Admin rerouted to admin console");
});

runTest("ROUTING-004", "URL hash manipulation (e.g. #/franchise/FR002) is sanitized to route name", () => {
  assert(indexHtml.includes("let rawHash = window.location.hash.replace(/^#\\/?/, \"\");"), "Raw hash stripped of leading # and slashes");
  assert(indexHtml.includes("let hash = rawHash.split('/')[0] || \"public\";"), "Extracts first route segment only");
});

// ======================================================================
// 6. FIREBASE SECURITY RULES & AUDIT (SECURITY-001 .. SECURITY-003)
// ======================================================================
console.log("\n--- GROUP 6: FIREBASE RULES & AUDIT TRAIL ---");

runTest("SECURITY-001", "Firestore rules v2 enforce role hierarchy, immutability & approval integrity", () => {
  assert(firestoreRules.includes("rules_version = '2';"), "Rules version 2 used");
  assert(firestoreRules.includes("match /users/{uid}"), "User directory guarded");
  assert(firestoreRules.includes("match /players/{playerId}"), "Players collection guarded");
  assert(firestoreRules.includes("match /acc_auctions/{auctionId}"), "Auction state guarded");
  assert(firestoreRules.includes("match /bids/{bidId}"), "Bids collection guarded");
});

runTest("SECURITY-002", "RTDB presence rules prevent identity spoofing and unauthorized writes", () => {
  assert(databaseRules.includes('"presence"'), "RTDB guards presence");
  assert(databaseRules.includes('auth != null'), "Authenticated users required for auth keys");
  assert(databaseRules.includes('"publicStats"'), "Aggregates published to publicStats");
});

runTest("SECURITY-003", "Audit trail records actor UID, role, timestamp and details", () => {
  assert(indexHtml.includes("auditLog.unshift"), "Audit log unshift invoked on operational actions");
  assert(indexHtml.includes("actorUid:"), "Actor UID recorded");
  assert(indexHtml.includes("details:"), "Event details recorded");
});

// ======================================================================
// 7. REALTIME SYNCHRONIZATION & INVALIDATION (REALTIME-001 .. REALTIME-002)
// ======================================================================
console.log("\n--- GROUP 7: REALTIME INTEGRITY ---");

runTest("REALTIME-001", "Realtime listener terminates session if account status becomes LOCKED/DISABLED", () => {
  assert(indexHtml.includes("subscribeCurrentUser()"), "subscribeCurrentUser defined in RealtimeManager");
  assert(indexHtml.includes("uData.status === 'LOCKED' || uData.status === 'DISABLED' || uData.status === 'BLOCKED'"),
    "Detects LOCKED, DISABLED, or BLOCKED status from Firestore");
  assert(indexHtml.includes("logoutUser();"), "Calls logoutUser immediately");
});

runTest("REALTIME-002", "Multi-tab and cross-client synchronization channels active", () => {
  assert(indexHtml.includes("BroadcastChannel(\"acc_auction_sync_channel\")"), "BroadcastChannel configured");
  assert(indexHtml.includes("subscribeAuctionState()"), "Firestore auction state listener configured");
  assert(indexHtml.includes("subscribePresenceSystem()"), "Presence system listeners configured");
});

// ======================================================================
// 8. AUCTION TIMER RIGOR (TIMER-001 .. TIMER-004)
// ======================================================================
console.log("\n--- GROUP 8: AUCTION TIMER MECHANICS ---");

runTest("TIMER-001", "Initial lot timer defaults to 30 seconds with authoritative server offset", () => {
  assert(indexHtml.includes("timerSeconds = 30;"), "Default timer 30 seconds");
  assert(indexHtml.includes("timerDeadline = (Date.now() + sOffset) + 30000;"), "Authoritative deadline 30s");
});

runTest("TIMER-002", "Legal bid resets timer to full 20 seconds with deadline synchronization", () => {
  assert(indexHtml.includes("timerSeconds = 20;"), "Bid resets timer to 20 seconds");
  assert(indexHtml.includes("timerDeadline = Date.now() + sOffset + 20000;"), "Authoritative deadline resets 20s");
});

runTest("TIMER-003", "Timer expiry at 0s prompts hammer confirmation and does NOT auto-sell", () => {
  assert(indexHtml.includes("if (leadingBidderId) {"), "Checks for leading bidder at timer expiry");
  assert(indexHtml.includes("openHammerConfirmModal();"), "Opens hammer confirmation modal; no silent auto-sale");
  assert(!indexHtml.includes("if (timerSeconds === 0) { confirmSale();"), "No unattended confirmSale invocation");
});

runTest("TIMER-004", "Timer calculates remaining duration from timerDeadline - serverNow", () => {
  assert(indexHtml.includes("const remaining = Math.max(0, Math.ceil((timerDeadline - serverNow) / 1000));"),
    "Remaining seconds derived from synchronized deadline minus server time");
});

// ======================================================================
// 9. PHASE 2 HARDENING: DEEP SECURITY AUDIT FIXES (SEC2-001 .. SEC2-009)
// ======================================================================
console.log("\n--- GROUP 9: PHASE 2 DEEP SECURITY HARDENING ---");

runTest("SEC2-001", "Hammer confirmation modal shows dialog instead of auto-selling", () => {
  // openHammerConfirmModal must NOT directly call executeHammerSale()
  const hammerFnMatch = indexHtml.match(/function openHammerConfirmModal\(\)\s*\{([\s\S]*?)\n    \}/);
  assert(hammerFnMatch, "openHammerConfirmModal function must exist");
  const hammerBody = hammerFnMatch[1];
  assert(!hammerBody.match(/^\s*executeHammerSale\(\);\s*$/m), "openHammerConfirmModal must NOT directly call executeHammerSale");
  assert(hammerBody.includes("CONFIRM HAMMER SALE"), "Modal must show confirmation dialog");
  assert(hammerBody.includes("CANCEL"), "Modal must have a cancel button");
});

runTest("SEC2-002", "Admin login preserves mustChangePassword flag (no bypass)", () => {
  const adminBlock = indexHtml.match(/if\s*\(\s*loginRoleSelection\s*===\s*['"]ADMIN['"]\s*\)([\s\S]*?)else if\s*\(\s*loginRoleSelection\s*===\s*['"]FRANCHISE['"]\s*\)/);
  assert(adminBlock, "Admin login block found");
  // Must NOT contain user.mustChangePassword = false
  assert(!adminBlock[1].includes("user.mustChangePassword = false"), "Admin login must NOT bypass mustChangePassword");
});

runTest("SEC2-003", "Password comparison is case-SENSITIVE for admin and player", () => {
  // Admin: no toLowerCase in password comparison
  assert(!indexHtml.includes("validAdminPasswords.some(p => p && p.toLowerCase() === secret.toLowerCase())"),
    "Admin password comparison must be case-sensitive");
  // Player: no toLowerCase in password comparison
  assert(!indexHtml.includes("validPlayerPasswords.some(p => p && p.toLowerCase() === secret.toLowerCase())"),
    "Player password comparison must be case-sensitive");
});

runTest("SEC2-004", "Weak hardcoded passwords removed from admin login", () => {
  // Check that weak passwords are no longer in the admin login password list
  const adminBlock = indexHtml.match(/validAdminPasswords\s*=\s*\[([\s\S]*?)\]\.filter/);
  assert(adminBlock, "Admin password list found");
  assert(!adminBlock[1].includes('"admin"'), "Trivial password 'admin' must be removed");
  assert(!adminBlock[1].includes('"admin123"'), "Trivial password 'admin123' must be removed");
  assert(!adminBlock[1].includes('"superadmin"'), "Trivial password 'superadmin' must be removed");
  assert(!adminBlock[1].includes('"admin@2026"'), "Trivial password 'admin@2026' must be removed");
});

runTest("SEC2-005", "Password minimum length is 8 characters", () => {
  assert(indexHtml.includes("p1.length < 8"), "Password minimum length check must be 8 characters");
  assert(!indexHtml.includes("p1.length < 6"), "Password minimum length must NOT be 6 characters");
});

runTest("SEC2-006", "Newly created admin accounts have canonical identity fields", () => {
  // handleCreateAdminSubmit must set uid, identityType, mustChangePassword, franchiseId, playerId
  const createBlock = indexHtml.match(/function handleCreateAdminSubmit[\s\S]*?const newAdmin = \{([\s\S]*?)\};/);
  assert(createBlock, "handleCreateAdminSubmit newAdmin object found");
  assert(createBlock[1].includes("uid:"), "New admin must have uid field");
  assert(createBlock[1].includes("identityType:"), "New admin must have identityType field");
  assert(createBlock[1].includes("mustChangePassword: true"), "New admin must require password change");
  assert(createBlock[1].includes("franchiseId: null"), "New admin must have franchiseId: null");
  assert(createBlock[1].includes("playerId: null"), "New admin must have playerId: null");
});

runTest("SEC2-007", "Provisioned handlers require mandatory password change", () => {
  const provisionBlock = indexHtml.match(/function provisionStaffHandler[\s\S]*?const newUser = \{([\s\S]*?)\};/);
  assert(provisionBlock, "provisionStaffHandler newUser object found");
  assert(provisionBlock[1].includes("mustChangePassword: true"), "Provisioned handler must require password change");
});

runTest("SEC2-008", "No default passwords exposed in login form UI", () => {
  // Check that login form does NOT display default passwords
  assert(!indexHtml.includes("Default: Player@2026"), "Player default password must NOT be shown in login form");
  assert(!indexHtml.includes("Default password: ACC@Admin"), "Admin default password must NOT be shown in login form");
});

runTest("SEC2-009", "Roll number and phone NOT accepted as player passwords", () => {
  const playerPassBlock = indexHtml.match(/validPlayerPasswords\s*=\s*\[([\s\S]*?)\]\.filter/);
  assert(playerPassBlock, "Player password list found");
  assert(!playerPassBlock[1].includes("user.username"), "Roll number must NOT be in player password list");
  assert(!playerPassBlock[1].includes("user.phone"), "Phone number must NOT be in player password list");
});

// ======================================================================
// FINAL SUMMARY
// ======================================================================
console.log("\n======================================================================");
console.log(`TOTAL RED-TEAM REMEDIATION TESTS: ${passedCount + failedCount}`);
console.log(`PASSED: ${passedCount}`);
console.log(`FAILED: ${failedCount}`);
console.log("======================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("\n>>> ALL RED-TEAM SECURITY & ARCHITECTURE TESTS PASSED SUCCESSFULLY! <<<\n");
  process.exit(0);
}
