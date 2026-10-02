const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — PLAYER VISIBILITY & REALTIME DATA-FLOW TEST SUITE       ");
console.log("======================================================================");

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract main application script
const scriptMatches = [...htmlContent.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const elementsMap = {};
const mockStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const ctx = {
  localStorage: mockStorage,
  sessionStorage: mockStorage,
  window: {
    addEventListener: () => {},
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    location: { hash: '' },
    auditLog: [],
    auctionHistory: []
  },
  document: {
    getElementById: (id) => {
      if (!elementsMap[id]) {
        elementsMap[id] = {
          value: '',
          innerHTML: '',
          style: {},
          classList: { add: () => {}, remove: () => {}, contains: () => false },
          appendChild: () => {},
          removeChild: () => {},
          disabled: false
        };
      }
      return elementsMap[id];
    },
    createElement: () => ({
      classList: { add: () => {}, remove: () => {} },
      style: {},
      innerHTML: '',
      appendChild: () => {},
      remove: () => {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null
  },
  navigator: { onLine: true },
  console: { log: () => {}, warn: () => {}, error: () => {} },
  setTimeout: (fn) => fn(),
  setInterval: () => 123,
  clearTimeout: () => {},
  clearInterval: () => {}
};

vm.createContext(ctx);
vm.runInContext(code, ctx);

console.log("\n--- TEST 1: CENTRALIZED isPlayerPubliclyVisible FUNCTION ---");
// 1. Approved & visible
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 101, name: "P1", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", publicVisibility: true })`, ctx), true, "Approved & publicVisibility true must be visible");

// 2. Pending
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 102, name: "P2", status: "PENDING_VERIFICATION", approvalStatus: "PENDING_APPROVAL", verificationStatus: "PENDING_VERIFICATION", publicVisibility: false })`, ctx), false, "Pending player must NOT be visible");

// 3. Blocked
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 103, name: "P3", status: "BLOCKED", approvalStatus: "BLOCKED", verificationStatus: "BLOCKED", publicVisibility: false })`, ctx), false, "Blocked player must NOT be visible");

// 4. Rejected
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 104, name: "P4", status: "REJECTED", approvalStatus: "REJECTED", verificationStatus: "REJECTED", publicVisibility: false })`, ctx), false, "Rejected player must NOT be visible");

// 5. Changes Required
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 105, name: "P5", status: "PENDING_VERIFICATION", approvalStatus: "CHANGES_REQUIRED", verificationStatus: "CHANGES_REQUIRED", publicVisibility: false })`, ctx), false, "Changes Required player must NOT be visible");

// 6. Deleted
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 106, name: "P6", status: "DELETED", approvalStatus: "DELETED", verificationStatus: "DELETED", publicVisibility: false })`, ctx), false, "Deleted player must NOT be visible");

// 7. Approved but publicVisibility false
assert.strictEqual(vm.runInContext(`isPlayerPubliclyVisible({ id: 107, name: "P7", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", publicVisibility: false })`, ctx), false, "Player with publicVisibility false must NOT be visible");

console.log("[PASS] isPlayerPubliclyVisible enforces strict lifecycle integrity across all 7 scenarios.");

console.log("\n--- TEST 2: ADMIN ACTIONS LIFECYCLE STATE & REALTIME SYNC ---");
vm.runInContext(`
players.push({
  id: 777,
  name: "Kiran Kumar",
  roll: "26811A0577",
  program: "B.Tech",
  department: "CSE",
  year: 2,
  bucket: "B2",
  role: "BATTER",
  basePrice: 60,
  approvalStatus: "PENDING_APPROVAL",
  verificationStatus: "PENDING_VERIFICATION",
  status: "PENDING_VERIFICATION",
  publicVisibility: false,
  auctionEligible: false
});
`, ctx);

// A. Approve
vm.runInContext("executeApprovePlayer(777);", ctx);
let afterApprove = vm.runInContext("players.find(p => p.id === 777)", ctx);
assert.strictEqual(afterApprove.status, "AVAILABLE");
assert.strictEqual(afterApprove.approvalStatus, "APPROVED");
assert.strictEqual(afterApprove.verificationStatus, "VERIFIED");
assert.strictEqual(afterApprove.publicVisibility, true);
assert.strictEqual(vm.runInContext("isPlayerPubliclyVisible(players.find(p => p.id === 777))", ctx), true);
console.log("[PASS] Admin APPROVE: status=AVAILABLE, approval=APPROVED, publicVisibility=true");

// B. Block
elementsMap["blockReasonInput"] = { value: "Disciplinary hold" };
vm.runInContext("executeBlockPlayer(777);", ctx);
let afterBlock = vm.runInContext("players.find(p => p.id === 777)", ctx);
assert.strictEqual(afterBlock.status, "BLOCKED");
assert.strictEqual(afterBlock.publicVisibility, false);
assert.strictEqual(vm.runInContext("isPlayerPubliclyVisible(players.find(p => p.id === 777))", ctx), false);
console.log("[PASS] Admin BLOCK: status=BLOCKED, publicVisibility=false, immediately hidden from public");

// C. Unblock
vm.runInContext("adminUnblockPlayerGovernance(777);", ctx);
let afterUnblock = vm.runInContext("players.find(p => p.id === 777)", ctx);
assert.strictEqual(afterUnblock.status, "AVAILABLE");
assert.strictEqual(afterUnblock.publicVisibility, true);
assert.strictEqual(vm.runInContext("isPlayerPubliclyVisible(players.find(p => p.id === 777))", ctx), true);
console.log("[PASS] Admin UNBLOCK: status=AVAILABLE, publicVisibility=true, restored to public");

// D. Archive: retain the canonical player identity and keep history references resolvable
elementsMap["deleteConfirmTypedInput"] = { value: "ARCHIVE" };
vm.runInContext("executeDeletePlayer(777);", ctx);
let afterDelete = vm.runInContext("players.find(p => p.id === 777)", ctx);
assert.strictEqual(afterDelete, undefined, "Deleted player removed from players array");
let inDeleted = vm.runInContext("deletedPlayers.find(p => p.id === 777)", ctx);
assert.notStrictEqual(inDeleted, undefined, "Deleted player recorded in deletedPlayers");
assert.strictEqual(inDeleted.status, "ARCHIVED");
assert.strictEqual(inDeleted.publicVisibility, false);
assert.strictEqual(inDeleted.roll, "26811A0577", "Canonical roll remains available to historical references");
console.log("[PASS] Admin ARCHIVE: profile retained in recoverable archive with canonical identity");

// E. Restore
vm.runInContext("adminRestorePlayerGovernance(777);", ctx);
let afterRestore = vm.runInContext("players.find(p => p.id === 777)", ctx);
assert.notStrictEqual(afterRestore, undefined, "Restored player returned to players array");
assert.strictEqual(afterRestore.approvalStatus, "APPROVED");
assert.strictEqual(afterRestore.status, "AVAILABLE");
assert.strictEqual(afterRestore.publicVisibility, true);
assert.strictEqual(vm.runInContext("isPlayerPubliclyVisible(players.find(p => p.id === 777))", ctx), true);
console.log("[PASS] Admin RESTORE: same canonical player and prior valid state restored");

console.log("\n--- TEST 3: NO RESURRECTION OF DELETED PLAYERS IN STATE MERGE ---");
vm.runInContext(`
applyAuthoritativeAuctionState({
  lotIndex: 0,
  currentBid: 60,
  players: [
    { id: 777, roll: "26811A0577", name: "Kiran Kumar", status: "DELETED" },
    { id: 888, roll: "26811A0588", name: "Surya Prakash", status: "AVAILABLE" }
  ],
  deletedPlayers: [
    { id: 777, roll: "26811A0577", name: "Kiran Kumar", status: "DELETED" }
  ]
});
`, ctx);

let check777 = vm.runInContext("players.find(p => p.id === 777 || p.roll === '26811A0577')", ctx);
assert.strictEqual(check777, undefined, "Deleted player was NOT resurrected by applyAuthoritativeAuctionState");
let check888 = vm.runInContext("players.find(p => p.id === 888)", ctx);
assert.notStrictEqual(check888, undefined, "Active player 888 successfully synced");
console.log("[PASS] applyAuthoritativeAuctionState eliminates the resurrection bug and filters deleted players.");

console.log("\n--- TEST 4: PUBLIC VIEW & HOME RENDERING INTEGRITY ---");
const publicHTML = vm.runInContext("renderPublicView();", ctx);
assert(publicHTML.includes("OFFICIAL PLAYER DIRECTORY"), "Public view renders player directory header");
assert(!publicHTML.includes("26811A0577"), "Deleted or unapproved player 777 is NOT rendered in public view");
console.log("[PASS] Home/Public view strictly queries and renders only isPlayerPubliclyVisible players.");

console.log("\n--- TEST 5: ADMIN CONSOLE UI STRUCTURE ---");
vm.runInContext("adminNavTab = 'PLAYERS'; playerApprovalFilter = 'ALL';", ctx);
const adminHTML = vm.runInContext("renderAdminConsoleView();", ctx);

// Check Top Bar
assert(adminHTML.includes("ACC 2026"), "Top bar renders ACC 2026");
assert(adminHTML.includes("Live Auction"), "Top bar has Live Auction button");
assert(adminHTML.includes("Projector"), "Top bar has Projector button");
assert(adminHTML.includes("Profile"), "Top bar has Profile button");
assert(adminHTML.includes("Logout"), "Top bar has Logout button");

// Check Overview KPI Cards
assert(adminHTML.includes("PENDING PLAYERS"), "Overview renders Pending Players KPI");
assert(adminHTML.includes("PENDING FRANCHISES"), "Overview renders Pending Franchises KPI");
assert(adminHTML.includes("PENDING MEMBERS"), "Overview renders Pending Members KPI");
assert(adminHTML.includes("APPROVED PLAYERS"), "Overview renders Approved Players KPI");
assert(adminHTML.includes("ACTIVE FRANCHISES"), "Overview renders Active Franchises KPI");
assert(adminHTML.includes("BLOCKED ACCOUNTS"), "Overview renders Blocked Accounts KPI");

// Check Sub-tabs
assert(adminHTML.includes("Pending ("), "Player Management has Pending sub-tab");
assert(adminHTML.includes("Approved ("), "Player Management has Approved sub-tab");
assert(adminHTML.includes("Changes Required ("), "Player Management has Changes Required sub-tab");
assert(adminHTML.includes("Blocked ("), "Player Management has Blocked sub-tab");
assert(adminHTML.includes("Deleted ("), "Player Management has Deleted sub-tab");

// Check Table Headers
assert(adminHTML.includes("PROGRAM"), "Table has PROGRAM header");
assert(adminHTML.includes("BRANCH"), "Table has BRANCH header");
assert(adminHTML.includes("YEAR"), "Table has YEAR header");
assert(adminHTML.includes("BUCKET"), "Table has BUCKET header");
assert(adminHTML.includes("ROLE"), "Table has ROLE header");
assert(adminHTML.includes("BASE PRICE"), "Table has BASE PRICE header");

// Check Action Buttons
assert(adminHTML.includes("Inspect"), "Table has Inspect action button");
assert(adminHTML.includes("Edit"), "Table has Edit action button");
assert(adminHTML.includes("Delete"), "Table has Delete action button");

console.log("[PASS] Admin Console UI matches the clean operational architecture.");

console.log("\n======================================================================");
console.log(">>> ALL PLAYER VISIBILITY & REALTIME DATA-FLOW TESTS PASSED! (5/5) <<<");
console.log("======================================================================\n");
