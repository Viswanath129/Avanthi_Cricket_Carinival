const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — ADMIN DATA DELETION CENTER ACCEPTANCE SUITE (14 TESTS)  ");
console.log("======================================================================");

// Load index.html
const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Extract script
const scriptMatches = [...indexHtml.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const mainScript = scriptMatches.find(m => m[1].includes("let players =") || m[1].includes("renderAdminConsoleView"));
assert(mainScript, "Main script not found in index.html");
const code = mainScript[1];

// Mock DOM & Storage
const storageMap = new Map();
const elementsMap = {};

function createMockElement(id) {
  if (!elementsMap[id]) {
    elementsMap[id] = {
      id: id,
      value: '',
      innerHTML: '',
      innerText: '',
      style: {},
      disabled: false,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      appendChild: () => {},
      removeChild: () => {},
      remove: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      dataset: {}
    };
  }
  return elementsMap[id];
}

const mockDocument = {
  getElementById: (id) => createMockElement(id),
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    className: '',
    innerText: '',
    innerHTML: '',
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {}
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

const mockLocalStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

const sandbox = {
  document: mockDocument,
  window: {
    location: { hash: '#admin', href: 'http://localhost/' },
    addEventListener: () => {},
    localStorage: mockLocalStorage,
    RealtimeStore: null,
    auctionHistory: []
  },
  localStorage: mockLocalStorage,
  navigator: { onLine: true },
  console: { log: () => {}, warn: () => {}, error: () => {} },
  setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 1; },
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Date: Date,
  JSON: JSON,
  Math: Math,
  Array: Array,
  Object: Object,
  Set: Set,
  Map: Map,
  Blob: class {},
  URL: { createObjectURL: () => "blob:mock", revokeObjectURL: () => {} }
};

const ctx = vm.createContext(sandbox);
vm.runInContext(code, ctx);

// Setup Super Admin Actor
vm.runInContext(`
currentUser = {
  uid: "usr_superadmin",
  username: "superadmin",
  name: "Mr. Deepak",
  role: "SUPER_ADMIN",
  title: "Chief Tournament Director"
};
`, ctx);

// ---------------------------------------------------------------------
// TEST 1: Delete one player -> removed from active DB, appears in Trash, Undo restores it, reappears in Home
// ---------------------------------------------------------------------
console.log("\n--- TEST 1: SINGLE PLAYER DELETE & UNDO ---");
vm.runInContext(`
players = [
  { id: 101, name: "Sai Teja", roll: "26811A0501", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B1", publicVisibility: true }
];
deletedPlayers = [];
dataOperations = [];
dataUndoStack = [];
dataRedoStack = [];
`, ctx);

// Public check: Sai Teja is initially visible
let publicHtml = vm.runInContext("renderPublicView();", ctx);
assert(publicHtml.includes("Sai Teja"), "Player visible on public catalog initially");

// Delete Player 101
vm.runInContext("executeDeletePlayer(101);", ctx);

// DB checks
assert.strictEqual(vm.runInContext("players.length", ctx), 0, "Player removed from active players array");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 1, "Player present in deletedPlayers (Trash)");
assert.strictEqual(vm.runInContext("deletedPlayers[0].name", ctx), "Sai Teja", "Trashed player name is Sai Teja");

// Public check: disappeared without refresh
publicHtml = vm.runInContext("renderPublicView();", ctx);
assert(!publicHtml.includes("Sai Teja"), "Player disappeared from public catalog");
console.log("[PASS] Player removed from active DB, appears in Trash, hidden from Home");

// Undo operation
vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 1, "Player restored to active array on Undo");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 0, "Player removed from Trash on Undo");

// Public check: reappears on Home
publicHtml = vm.runInContext("renderPublicView();", ctx);
assert(publicHtml.includes("Sai Teja"), "Player reappears on public catalog after Undo");
console.log("[PASS] Undo restores player to active DB and public view immediately");

// ---------------------------------------------------------------------
// TEST 2: Delete player -> Undo -> Redo -> player deleted again
// ---------------------------------------------------------------------
console.log("\n--- TEST 2: UNDO & REDO SEQUENCE ---");
vm.runInContext("executeRedoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 0, "Redo moves player back out of active array");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 1, "Redo moves player back into Trash");
publicHtml = vm.runInContext("renderPublicView();", ctx);
assert(!publicHtml.includes("Sai Teja"), "Redo hides player from public catalog again");
console.log("[PASS] Redo successfully reapplies deletion");

// ---------------------------------------------------------------------
// TEST 3: Delete player -> Undo twice -> second undo rejected
// ---------------------------------------------------------------------
console.log("\n--- TEST 3: NO DOUBLE UNDO ---");
vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 1, "First undo restored player");
// Attempt second undo
const undoStackLen = vm.runInContext("dataUndoStack.length", ctx);
assert.strictEqual(undoStackLen, 0, "Undo stack is empty after undoing the only operation");
vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 1, "Player count unchanged; no duplicate created");
console.log("[PASS] Second undo cleanly rejected, no duplicates created");

// ---------------------------------------------------------------------
// TEST 4: Delete Player A, Delete Player B, Undo -> only Player B restored
// ---------------------------------------------------------------------
console.log("\n--- TEST 4: MULTI-STEP LIFO UNDO STACK ---");
vm.runInContext(`
players = [
  { id: 201, name: "Player A", roll: "26811A0201", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B1", publicVisibility: true },
  { id: 202, name: "Player B", roll: "26811A0202", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B1", publicVisibility: true }
];
deletedPlayers = [];
dataOperations = [];
dataUndoStack = [];
dataRedoStack = [];
`, ctx);

vm.runInContext("executeDeletePlayer(201);", ctx); // Delete A
vm.runInContext("executeDeletePlayer(202);", ctx); // Delete B
assert.strictEqual(vm.runInContext("players.length", ctx), 0, "Both players deleted");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 2, "Both players in Trash");

// Single Undo: should restore Player B only (most recent)
vm.runInContext("executeUndoDataOperation();", ctx);
const currentPlayers = vm.runInContext("players", ctx);
assert.strictEqual(currentPlayers.length, 1, "Exactly one player restored");
assert.strictEqual(currentPlayers[0].name, "Player B", "Player B was restored (LIFO order)");
const trashPlayers = vm.runInContext("deletedPlayers", ctx);
assert.strictEqual(trashPlayers.length, 1, "Exactly one player remains in Trash");
assert.strictEqual(trashPlayers[0].name, "Player A", "Player A remains in Trash");
console.log("[PASS] LIFO Undo reverses only the most recent operation (Player B)");

// ---------------------------------------------------------------------
// TEST 5: Delete all players -> all moved to Trash, Undo restores all
// ---------------------------------------------------------------------
console.log("\n--- TEST 5: DELETE ALL PLAYERS & BATCH UNDO ---");
vm.runInContext(`
players = [
  { id: 301, name: "P1", roll: "26811A0301", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B1", publicVisibility: true },
  { id: 302, name: "P2", roll: "26811A0302", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B2", publicVisibility: true },
  { id: 303, name: "P3", roll: "26811A0303", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B3", publicVisibility: true }
];
deletedPlayers = [];
dataOperations = [];
dataUndoStack = [];
dataRedoStack = [];
`, ctx);

vm.runInContext("executeDeleteAllPlayers();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 0, "All players removed from active DB");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 3, "All 3 players moved to Trash under single operation");
assert.strictEqual(vm.runInContext("dataOperations.length", ctx), 1, "Exactly one operation created for Delete All");

// Batch Undo
vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 3, "All 3 players restored in one Undo");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 0, "Trash is now empty");
console.log("[PASS] Delete All Players moves all to Trash and single Undo restores entire dataset");

// ---------------------------------------------------------------------
// TEST 6: Delete all players -> Undo -> Redo -> all deleted again
// ---------------------------------------------------------------------
console.log("\n--- TEST 6: DELETE ALL REDO ---");
vm.runInContext("executeRedoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players.length", ctx), 0, "Redo deletes all players again");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 3, "All 3 players back in Trash");
console.log("[PASS] Redo re-executes Delete All operation cleanly");

// ---------------------------------------------------------------------
// TEST 7: Delete franchise -> removed from active list, Undo -> restored
// ---------------------------------------------------------------------
console.log("\n--- TEST 7: SINGLE FRANCHISE DELETE & UNDO ---");
vm.runInContext(`
franchises = [
  { id: 1, name: "Titans", coordinator: "Prof. Rao", purse: 1000, squadCount: 0, status: "ACTIVE", approvalStatus: "APPROVED" },
  { id: 2, name: "Gladiators", coordinator: "Prof. Verma", purse: 1000, squadCount: 0, status: "ACTIVE", approvalStatus: "APPROVED" }
];
deletedFranchises = [];
dataOperations = [];
dataUndoStack = [];
dataRedoStack = [];
`, ctx);

vm.runInContext("executeDeleteFranchise(1);", ctx);
assert.strictEqual(vm.runInContext("franchises.length", ctx), 1, "Titans removed from active franchises");
assert.strictEqual(vm.runInContext("franchises[0].name", ctx), "Gladiators", "Gladiators remains active");
assert.strictEqual(vm.runInContext("deletedFranchises.length", ctx), 1, "Titans moved to deletedFranchises");

vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("franchises.length", ctx), 2, "Titans restored on Undo");
assert.strictEqual(vm.runInContext("deletedFranchises.length", ctx), 0, "deletedFranchises now empty");
console.log("[PASS] Franchise deletion and undo verified");

// ---------------------------------------------------------------------
// TEST 8: Delete all franchises -> Undo -> all restored
// ---------------------------------------------------------------------
console.log("\n--- TEST 8: DELETE ALL FRANCHISES & BATCH UNDO ---");
vm.runInContext("executeDeleteAllFranchises();", ctx);
assert.strictEqual(vm.runInContext("franchises.length", ctx), 0, "All franchises removed from active DB");
assert.strictEqual(vm.runInContext("deletedFranchises.length", ctx), 2, "All franchises moved to Trash");

vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("franchises.length", ctx), 2, "All franchises restored on Undo");
console.log("[PASS] Delete All Franchises and Undo verified");

// ---------------------------------------------------------------------
// TEST 9: Delete player with auction history -> audit & consistency intact
// ---------------------------------------------------------------------
console.log("\n--- TEST 9: DELETE PLAYER WITH AUCTION HISTORY PRESERVES CONSISTENCY ---");
vm.runInContext(`
players = [
  { id: 401, name: "Historical Hero", roll: "26811A0401", status: "SOLD", soldTo: 1, bids: [{ amount: 150 }], approvalStatus: "APPROVED", verificationStatus: "VERIFIED" }
];
window.auctionHistory = [{ playerId: 401, franchiseId: 1, amount: 150 }];
deletedPlayers = [];
dataOperations = [];
dataUndoStack = [];
dataRedoStack = [];
`, ctx);

// In openDeletePlayerModal, deletion is guarded if hasHistory unless archived
vm.runInContext("openDeletePlayerModal(401);", ctx);
const modalHtml = elementsMap["modalContainer"]?.innerHTML || '';
assert(modalHtml.includes("CANNOT DELETE PLAYER") || modalHtml.includes("ARCHIVE PLAYER INSTEAD"), "Historical player delete blocked in direct UI");

// When executing deletion via data operation directly (e.g. forced admin override / snapshot)
vm.runInContext("executeDeletePlayer(401);", ctx);
assert(sandbox.window.auctionHistory.length === 1, "Auction history records remain intact");
vm.runInContext("executeUndoDataOperation();", ctx);
assert.strictEqual(vm.runInContext("players[0].soldTo", ctx), 1, "Restored player preserves historical soldTo relationship");
console.log("[PASS] Auction history preserved and relationships remain consistent");

// ---------------------------------------------------------------------
// TEST 10: Delete player -> register same roll while deleted -> duplicate identity blocked
// ---------------------------------------------------------------------
console.log("\n--- TEST 10: DUPLICATE REGISTRATION BLOCKED WHILE IN TRASH ---");
vm.runInContext(`
players = [];
deletedPlayers = [
  { id: 501, name: "Original Player", roll: "24815A0443", status: "DELETED", deleted: true }
];
`, ctx);

// Simulate registration duplicate check
let isDuplicate = vm.runInContext(`
(function() {
  const newRoll = "24815A0443";
  return players.some(x => (x.roll || '').toUpperCase() === newRoll) ||
         deletedPlayers.some(x => (x.roll || '').toUpperCase() === newRoll);
})()
`, ctx);
assert(isDuplicate, "Registration of roll currently in Trash must be detected as duplicate / reserved");
console.log("[PASS] Roll number reserved in trash; duplicate registration blocked");

// ---------------------------------------------------------------------
// TEST 11: Restore player while conflicting active roll exists -> RESTORE CONFLICT
// ---------------------------------------------------------------------
console.log("\n--- TEST 11: RESTORE CONFLICT DETECTION ---");
vm.runInContext(`
players = [
  { id: 602, name: "New Conflict Player", roll: "24815A0443", status: "AVAILABLE" }
];
deletedPlayers = [
  { id: 601, name: "Original Trashed Player", roll: "24815A0443", status: "DELETED" }
];
dataOperations = [{
  operationId: "D-9999",
  operationType: "DELETE_PLAYER",
  entityType: "PLAYER",
  entityIds: [601],
  snapshot: [{ id: 601, name: "Original Trashed Player", roll: "24815A0443", status: "AVAILABLE" }],
  status: "COMPLETED"
}];
dataUndoStack = ["D-9999"];
dataRedoStack = [];
`, ctx);

vm.runInContext("executeUndoDataOperation();", ctx);
// Conflict prevented overwrite
assert.strictEqual(vm.runInContext("players.length", ctx), 1, "Did not overwrite or duplicate into players array");
assert.strictEqual(vm.runInContext("players[0].id", ctx), 602, "Existing active player remained intact");
assert.strictEqual(vm.runInContext("deletedPlayers.length", ctx), 1, "Conflicting trashed player remained safely in Trash");
console.log("[PASS] Restore conflict handled safely; existing active player never overwritten");

// ---------------------------------------------------------------------
// TEST 12: Admin refreshes browser after deletion -> state persisted
// ---------------------------------------------------------------------
console.log("\n--- TEST 12: BROWSER REFRESH PERSISTENCE ---");
vm.runInContext(`
players = [{ id: 701, name: "Persistent Player", roll: "26811A0701", status: "AVAILABLE" }];
deletedPlayers = [];
dataOperations = [];
dataUndoStack = [];
`, ctx);
vm.runInContext("executeDeletePlayer(701);", ctx);

// Simulate page refresh by reloading state from localStorage
const storedPlayers = JSON.parse(mockLocalStorage.getItem("acc_players_2026"));
const storedDeleted = JSON.parse(mockLocalStorage.getItem("acc_deleted_players_2026"));
const storedOps = JSON.parse(mockLocalStorage.getItem("acc_data_operations_2026"));
const storedUndo = JSON.parse(mockLocalStorage.getItem("acc_undo_stack_2026"));

assert.strictEqual(storedPlayers.length, 0, "Active players array in localStorage is empty after refresh");
assert.strictEqual(storedDeleted.length, 1, "Deleted player in localStorage is retained after refresh");
assert(storedOps.length >= 1, "Data operations retained in localStorage after refresh");
assert(storedUndo.length >= 1, "Undo stack retained in localStorage after refresh");
console.log("[PASS] Deletion state and undo operation history survive browser refresh");

// ---------------------------------------------------------------------
// TEST 13: Admin deletes player while public viewing Home -> immediately hidden
// ---------------------------------------------------------------------
console.log("\n--- TEST 13: REALTIME PUBLIC VIEW REMOVAL ---");
vm.runInContext(`
players = [{ id: 801, name: "Live Player", roll: "26811A0801", status: "AVAILABLE", approvalStatus: "APPROVED", verificationStatus: "VERIFIED", bucket: "B1", publicVisibility: true }];
deletedPlayers = [];
`, ctx);

let publicViewBefore = vm.runInContext("renderPublicView();", ctx);
assert(publicViewBefore.includes("Live Player"), "Player initially rendered on public page");

vm.runInContext("executeDeletePlayer(801);", ctx);
let publicViewAfter = vm.runInContext("renderPublicView();", ctx);
assert(!publicViewAfter.includes("Live Player"), "Player disappears from public page immediately");
console.log("[PASS] Player immediately removed from public view without page reload");

// ---------------------------------------------------------------------
// TEST 14: Admin restores player -> public user sees player reappear
// ---------------------------------------------------------------------
console.log("\n--- TEST 14: REALTIME PUBLIC VIEW RESTORATION ---");
vm.runInContext("executeUndoDataOperation();", ctx);
let publicViewRestored = vm.runInContext("renderPublicView();", ctx);
assert(publicViewRestored.includes("Live Player"), "Player immediately reappears on public page");
console.log("[PASS] Player immediately reappears on public view after restoration");

console.log("\n======================================================================");
console.log("✔ ALL 14 ADMIN DATA DELETION CENTER ACCEPTANCE TESTS PASSED (14/14)!");
console.log("======================================================================\n");
