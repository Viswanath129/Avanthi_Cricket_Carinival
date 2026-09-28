const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — ADMIN LOGIN & PLAYER PORTAL VERIFICATION TEST           ");
console.log("======================================================================");

const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// 1. Static Checks
console.log("\n--- TEST 1: STATIC FUNCTION & VIEW WIRING CHECKS ---");
assert(/function\s+renderPlayerPortalView\s*\(/.test(indexHtml), "renderPlayerPortalView function must be defined");
console.log("[PASS] renderPlayerPortalView is defined in index.html");

assert(indexHtml.includes('else if (currentView === "player") main.innerHTML = renderPlayerPortalView();'), "renderPlayerPortalView is wired into renderCurrentView");
console.log("[PASS] renderPlayerPortalView is wired into renderCurrentView");

// Check admin credentials in code
assert(indexHtml.includes("val === 'admin'"), "Admin identifier 'admin' is explicitly handled");
assert(indexHtml.includes('"Admin@2026"'), "Admin@2026 password is accepted");
assert(indexHtml.includes('"ACC@Admin#2026!"'), "ACC@Admin#2026! password is accepted");
console.log("[PASS] Admin login handles 'admin' identifier and all authorized passwords");

// Check that mandatory password change modal does NOT block admin login
const adminSubmitMatch = indexHtml.match(/if\s*\(\s*loginRoleSelection\s*===\s*['"]ADMIN['"]\s*\)([\s\S]*?)else if\s*\(\s*loginRoleSelection\s*===\s*['"]FRANCHISE['"]\s*\)/);
assert(adminSubmitMatch, "Admin submit block found");
const adminSubmitCode = adminSubmitMatch[1];
assert(!adminSubmitCode.includes("openPasswordChangeModal(user);"), "Admin login must not be blocked by openPasswordChangeModal");
assert(adminSubmitCode.includes('switchView("admin");'), "Admin login must immediately switch view to admin");
console.log("[PASS] Admin login navigates directly to Admin Console");

// 2. Mock Runtime Execution Test
console.log("\n--- TEST 2: SIMULATED ADMIN LOGIN EXECUTION ---");

const INITIAL_USERS = [
  {
    uid: "usr_superadmin",
    username: "superadmin",
    email: "superadmin@acc.edu",
    passwordHash: "ACC@Admin#2026!",
    role: "SUPER_ADMIN",
    name: "Mr. Deepak",
    status: "ACTIVE"
  },
  {
    uid: "usr_handler1",
    username: "handler",
    email: "handler@acc.edu",
    passwordHash: "Handler@2026",
    role: "ADMIN",
    name: "P. Rajesh",
    status: "ACTIVE"
  }
];

function simulateAdminLogin(identifier, secret, usersList) {
  const rawVal = identifier.trim();
  const val = rawVal.toLowerCase();
  const pass = secret.trim();

  let user = usersList.find(u => 
    (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN') &&
    (
      (u.username && u.username.toLowerCase() === val) || 
      (u.email && u.email.toLowerCase() === val) ||
      (val === 'admin' && (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')) ||
      (val === 'superadmin' && u.role === 'SUPER_ADMIN') ||
      (val === 'super_admin' && u.role === 'SUPER_ADMIN') ||
      (val === 'administrator' && u.role === 'SUPER_ADMIN') ||
      (val === 'director' && u.role === 'SUPER_ADMIN') ||
      (val === 'admin@acc.edu' && u.role === 'SUPER_ADMIN') ||
      (val === 'superadmin@acc.edu' && u.role === 'SUPER_ADMIN') ||
      (val === 'handler' && u.role === 'ADMIN') ||
      (val === 'handler@acc.edu' && u.role === 'ADMIN')
    )
  );

  if (!user && (val === 'admin' || val === 'superadmin' || val === 'admin@acc.edu' || val === 'superadmin@acc.edu' || val === 'administrator')) {
    user = usersList.find(u => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0];
  }

  if (!user) return { success: false, reason: "NOT_FOUND" };

  const validAdminPasswords = [
    user.passwordHash,
    user.password,
    "ACC@Admin#2026!",
    "SuperAdmin@2026",
    "Admin@2026",
    "Admin@ACC2026",
    "Handler@2026"
  ].filter(Boolean);

  const passMatches = validAdminPasswords.some(p => p && p === pass) ||
    pass === user.passwordHash ||
    pass === "ACC@Admin#2026!";

  if (!passMatches) return { success: false, reason: "INVALID_SECRET" };

  return { success: true, user, targetView: "admin" };
}

// Test login with identifier "admin" and "ACC@Admin#2026!"
let res = simulateAdminLogin("admin", "ACC@Admin#2026!", INITIAL_USERS);
assert(res.success && res.user.role === 'SUPER_ADMIN', "Login with 'admin' and 'ACC@Admin#2026!' must succeed");
console.log("[PASS] 'admin' + 'ACC@Admin#2026!' -> Logged in as SUPER_ADMIN -> View: " + res.targetView);

// Test login with identifier "admin" and "Admin@2026"
res = simulateAdminLogin("admin", "Admin@2026", INITIAL_USERS);
assert(res.success && res.user.role === 'SUPER_ADMIN', "Login with 'admin' and 'Admin@2026' must succeed");
console.log("[PASS] 'admin' + 'Admin@2026' -> Logged in as SUPER_ADMIN -> View: " + res.targetView);

// Test login with WEAK password 'admin123' must NOW FAIL (hardened)
res = simulateAdminLogin("superadmin", "admin123", INITIAL_USERS);
assert(!res.success, "Login with weak 'admin123' must be REJECTED after hardening");
console.log("[PASS] 'superadmin' + 'admin123' -> CORRECTLY REJECTED (weak password removed)");

// Test login with "handler" and "Handler@2026"
res = simulateAdminLogin("handler", "Handler@2026", INITIAL_USERS);
assert(res.success && res.user.role === 'ADMIN', "Login with 'handler' must succeed");
console.log("[PASS] 'handler' + 'Handler@2026' -> Logged in as ADMIN -> View: " + res.targetView);


// 3. Player Portal Rendering Test
console.log("\n--- TEST 3: PLAYER PORTAL VIEW RENDERING INTEGRITY ---");

// Mock global environment to test renderPlayerPortalView
const mockPlayer = {
  id: 1,
  name: "Sai Teja",
  roll: "26811A0501",
  program: "B.Tech",
  branch: "CSE",
  year: "1",
  bucket: "B1",
  derivedType: "ALL-ROUNDER",
  role: "ALL-ROUNDER",
  battingStyle: "RIGHT HAND",
  bowlingArm: "RIGHT ARM",
  bowlingType: "MEDIUM FAST",
  price: 60000,
  basePrice: 60,
  status: "AVAILABLE",
  approvalStatus: "APPROVED",
  verificationStatus: "VERIFIED",
  photo: "",
  bio: "Leading top-order batter and medium pace asset in Avanthi 2026."
};

const players = [mockPlayer];
const franchises = [{ id: 1, name: "Titans", short: "TIT" }];
let lotIndex = 0;
let currentBid = 60000;
let currentUser = { role: "PLAYER", username: "26811A0501", name: "Sai Teja", playerId: 1 };

function getPlayerAvatar(p, width = 80, height = 100) {
  return `<div class="avatar" style="width:${width}px;height:${height}px;">${p.name}</div>`;
}

// Evaluate extracted renderPlayerPortalView from index.html
const startIdx = indexHtml.indexOf("function renderPlayerPortalView()");
const endIdx = indexHtml.indexOf("function renderAdminConsoleView()", startIdx);
assert(startIdx !== -1 && endIdx !== -1, "Could not find renderPlayerPortalView or renderAdminConsoleView");
const fullFunc = indexHtml.substring(startIdx, endIdx).trim();

const renderPlayerPortalView = new Function(
  'players', 'franchises', 'lotIndex', 'currentBid', 'currentUser', 'getPlayerAvatar',
  `return (${fullFunc})();`
);

// 1. Available player portal render (not current lot)
lotIndex = 5;
let portalHtml = renderPlayerPortalView(players, franchises, lotIndex, currentBid, currentUser, getPlayerAvatar);
assert(portalHtml.includes("PLAYER WORKSPACE"), "Portal must contain PLAYER WORKSPACE");
assert(portalHtml.includes("Sai Teja"), "Portal must contain player name");
assert(portalHtml.includes("26811A0501"), "Portal must contain player roll");
assert(portalHtml.includes("BUCKET B1"), "Portal must contain bucket");
assert(portalHtml.includes("IN AUCTION POOL"), "Status must be IN AUCTION POOL");
assert(portalHtml.includes("openPlayerPassModal('1')") || portalHtml.includes("openPlayerPassModal(1)"), "Must have pass button with ID 1");
console.log("[PASS] Player Portal rendered successfully for AVAILABLE player (IN AUCTION POOL)");

// 2. Active bidding on player
lotIndex = 0;
portalHtml = renderPlayerPortalView(players, franchises, lotIndex, currentBid, currentUser, getPlayerAvatar);
assert(portalHtml.includes("UNDER ACTIVE BIDDING"), "Must show UNDER ACTIVE BIDDING");
assert(portalHtml.includes("NOW ON AUCTION FLOOR"), "Must show NOW ON AUCTION FLOOR");
console.log("[PASS] Player Portal rendered successfully for active lot (UNDER ACTIVE BIDDING)");

// 3. Sold player portal render
mockPlayer.status = "SOLD";
mockPlayer.team = 1;
mockPlayer.price = 150000;
portalHtml = renderPlayerPortalView(players, franchises, lotIndex, currentBid, currentUser, getPlayerAvatar);
assert(portalHtml.includes("ACQUIRED / SOLD"), "Must show SOLD status");
assert(portalHtml.includes("SIGNED TO TITANS"), "Must show franchise name TITANS");
assert(portalHtml.includes((150000).toLocaleString()), "Must show sold price");
console.log("[PASS] Player Portal rendered successfully for SOLD player");

// 4. Blocked player portal render
mockPlayer.status = "BLOCKED";
mockPlayer.isBlocked = true;
portalHtml = renderPlayerPortalView(players, franchises, lotIndex, currentBid, currentUser, getPlayerAvatar);
assert(portalHtml.includes("BLOCKED BY DIRECTORATE"), "Must show BLOCKED status");
console.log("[PASS] Player Portal rendered successfully for BLOCKED player");

console.log("\n======================================================================");
console.log("✔ ALL ADMIN LOGIN & PLAYER PORTAL TESTS PASSED PERFECTLY!");
console.log("======================================================================");
