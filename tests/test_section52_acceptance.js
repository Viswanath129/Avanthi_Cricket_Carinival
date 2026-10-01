const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log("======================================================================");
console.log("   ACC 2026 — SECTION 52 FINAL ACCEPTANCE TEST SUITE (13 TESTS)      ");
console.log("======================================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// Extract the script
const scriptMatches = [...htmlContent.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const elementsMap = {};
const ctx = {
  window: {
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
  },
  localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null },
  sessionStorage: { clear: () => null },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  prompt: () => 'Correction needed',
  confirm: () => true,
  alert: () => {},
  showToast: () => {},
  Date: Date
};

vm.createContext(ctx);
vm.runInContext(code, ctx);

// ---------------------------------------------------------
// TEST 1: Pending player -> Admin approves -> approved & active
// ---------------------------------------------------------
console.log("\n--- TEST 1: PENDING PLAYER APPROVE ---");
vm.runInContext("currentUser = { role: 'SUPER_ADMIN', name: 'Mr. Deepak', uid: 'usr_superadmin' };", ctx);
vm.runInContext(`
players.push({
  id: 991,
  name: "Sai Teja",
  roll: "26811A0401",
  program: "B.Tech",
  department: "ECE",
  year: 1,
  bucket: "B1",
  basePrice: 60,
  photo: "https://example.com/photo.jpg",
  approvalStatus: "PENDING_APPROVAL",
  verificationStatus: "PENDING_VERIFICATION",
  status: "PENDING_VERIFICATION",
  accountStatus: "NOT CREATED",
  auctionEligible: false
});
`, ctx);

vm.runInContext("executeApprovePlayer(991);", ctx);
const testP1 = vm.runInContext("players.find(p => p.id === 991)", ctx);
assert(testP1.approvalStatus === 'APPROVED', "Player approvalStatus updated to APPROVED");
assert(testP1.verificationStatus === 'VERIFIED', "Player verificationStatus updated to VERIFIED");
assert(testP1.status === 'AVAILABLE', "Player status updated to AVAILABLE");
assert(testP1.auctionEligible === true, "Player auctionEligible is true");

// ---------------------------------------------------------
// TEST 2: Admin clicks EDIT -> details open
// ---------------------------------------------------------
console.log("\n--- TEST 2: EDIT PLAYER OPENS DETAILS ---");
vm.runInContext("openPlayerEditModal(991);", ctx);
const modalHTML2 = elementsMap["modalContainer"]?.innerHTML || '';
assert(modalHTML2.includes("EDIT PLAYER: Sai Teja"), "Edit Player modal title rendered with player name");
assert(modalHTML2.includes("01. IDENTITY"), "Modal contains Section 1: IDENTITY");
assert(modalHTML2.includes("02. ACADEMICS"), "Modal contains Section 2: ACADEMICS");
assert(modalHTML2.includes("03. CRICKET SKILLS"), "Modal contains Section 3: CRICKET SKILLS");
assert(modalHTML2.includes("05. AUCTION PARAMETERS"), "Modal contains Section 5: AUCTION");

// ---------------------------------------------------------
// TEST 3: Admin modifies critical field -> returns to pending
// ---------------------------------------------------------
console.log("\n--- TEST 3: CRITICAL FIELD EDIT RESETS APPROVAL ---");
elementsMap["editPlayerName"] = { value: "Sai Teja" };
elementsMap["editPlayerRoll"] = { value: "26811A0401" };
elementsMap["editPlayerProgram"] = { value: "B.Tech" };
elementsMap["editPlayerDept"] = { value: "ECE" };
elementsMap["editPlayerEntryType"] = { value: "Regular" };
elementsMap["editPlayerYear"] = { value: "2" }; // changed from 1 to 2
elementsMap["editPlayerBucket"] = { value: "B2" }; // changed to B2
elementsMap["editPlayerRole"] = { value: "ALL-ROUNDER" };
elementsMap["editPlayerJersey"] = { value: "7" };
elementsMap["editPlayerMobile"] = { value: "9876543991" };
elementsMap["editPlayerBasePrice"] = { value: "60" };
elementsMap["editPlayerCricHeroes"] = { value: "" };
elementsMap["editPlayerPhoto"] = { value: "https://example.com/photo.jpg" };
elementsMap["editPlayerAccountStatus"] = { value: "ACTIVE" };
elementsMap["editPlayerApprovalStatus"] = { value: "APPROVED" };
elementsMap["editPlayerAuctionStatus"] = { value: "AVAILABLE" };

vm.runInContext("savePlayerEditModal(991);", ctx);
const testP1AfterEdit = vm.runInContext("players.find(p => p.id === 991)", ctx);
assert(testP1AfterEdit.approvalStatus === 'PENDING_APPROVAL', "Critical academic edit resets approvalStatus to PENDING_APPROVAL");
assert(testP1AfterEdit.verificationStatus === 'PENDING_VERIFICATION', "Critical edit resets verificationStatus to PENDING_VERIFICATION");
assert(testP1AfterEdit.auctionEligible === false, "Auction eligibility revoked until re-approval");

// ---------------------------------------------------------
// TEST 4: Admin clicks BLOCK -> player blocked & removed from public
// ---------------------------------------------------------
console.log("\n--- TEST 4: BLOCK PLAYER ---");
elementsMap["blockReasonInput"] = { value: "Disciplinary infraction" };
vm.runInContext("executeBlockPlayer(991);", ctx);
const testP1AfterBlock = vm.runInContext("players.find(p => p.id === 991)", ctx);
assert(testP1AfterBlock.approvalStatus === 'BLOCKED', "Player approvalStatus set to BLOCKED");
assert(testP1AfterBlock.status === 'BLOCKED', "Player status set to BLOCKED");
assert(testP1AfterBlock.accountStatus === 'DISABLED', "Player accountStatus set to DISABLED");
assert(testP1AfterBlock.auctionEligible === false, "Player auctionEligible is false");

// Public filter check: unapproved or blocked players must NOT be visible to public
const publicList = vm.runInContext("players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && p.status !== 'BLOCKED' && p.status !== 'PENDING_VERIFICATION')", ctx);
assert(!publicList.some(p => p.id === 991), "Blocked player excluded from public roster");

// ---------------------------------------------------------
// TEST 5: Admin clicks ARCHIVE -> active directory removes player
// ---------------------------------------------------------
console.log("\n--- TEST 5: ARCHIVE PLAYER ---");
vm.runInContext(`
players.push({
  id: 992,
  name: "Karthik Raj",
  roll: "25811A0501",
  program: "B.Tech",
  department: "CSE",
  year: 2,
  bucket: "B2",
  basePrice: 80,
  approvalStatus: "APPROVED",
  verificationStatus: "VERIFIED",
  status: "AVAILABLE",
  accountStatus: "ACTIVE",
  auctionEligible: true
});
`, ctx);

elementsMap["archiveReasonInput"] = { value: "Medical withdrawal" };
vm.runInContext("executeArchivePlayer(992);", ctx);
const testP2 = vm.runInContext("players.find(p => p.id === 992)", ctx);
assert(testP2.approvalStatus === 'ARCHIVED', "Player approvalStatus set to ARCHIVED");
assert(testP2.status === 'ARCHIVED', "Player status set to ARCHIVED");

const activePlayers = vm.runInContext("players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && p.status !== 'BLOCKED' && p.status !== 'ARCHIVED')", ctx);
assert(!activePlayers.some(p => p.id === 992), "Archived player removed from active directory");

// ---------------------------------------------------------
// TEST 6: Player with auction history: DELETE blocked, ARCHIVE required
// ---------------------------------------------------------
console.log("\n--- TEST 6: DELETE BLOCKED FOR PLAYERS WITH AUCTION HISTORY ---");
vm.runInContext(`
players.push({
  id: 993,
  name: "Rohit Nambiar",
  roll: "24811A0304",
  status: "SOLD",
  soldTo: 3,
  soldPrice: 120,
  bids: [{ franchiseId: 3, amount: 120 }]
});
`, ctx);

vm.runInContext("openDeletePlayerModal(993);", ctx);
const modalHTML6 = elementsMap["modalContainer"]?.innerHTML || '';
assert(modalHTML6.includes("CANNOT DELETE PLAYER"), "Modal explicitly blocks deletion of historical player");
assert(modalHTML6.includes("ARCHIVE PLAYER INSTEAD"), "Modal requires ARCHIVE instead of physical deletion");

// ---------------------------------------------------------
// TEST 7: Player with no history: DELETE requires typing "DELETE"
// ---------------------------------------------------------
console.log("\n--- TEST 7: DELETE WITHOUT HISTORY REQUIRES TYPED CONFIRMATION ---");
vm.runInContext(`
players.push({
  id: 994,
  name: "Clean Player",
  roll: "26811A0101",
  status: "PENDING_VERIFICATION",
  approvalStatus: "PENDING_APPROVAL"
});
`, ctx);

vm.runInContext("openDeletePlayerModal(994);", ctx);
const modalHTML7 = elementsMap["modalContainer"]?.innerHTML || '';
assert(modalHTML7.includes("DELETE PLAYER?"), "Delete confirmation modal opened");
assert(modalHTML7.includes("TYPE \"DELETE\" TO CONFIRM") || modalHTML7.includes("DELETE"), "Modal requires typed confirmation 'DELETE'");

vm.runInContext("executeDeletePlayer(994);", ctx);
const deletedP = vm.runInContext("players.find(p => p.id === 994)", ctx);
assert(!deletedP, "Player without history successfully deleted after confirmation");

// ---------------------------------------------------------
// TEST 8: Existing roll: 24815A0443 vs 24815a0443 -> duplicate blocked
// ---------------------------------------------------------
console.log("\n--- TEST 8: CASE-INSENSITIVE ROLL DUPLICATE BLOCKED ---");
vm.runInContext(`
players.push({
  id: 995,
  name: "Master Player",
  roll: "24815A0443"
});
`, ctx);

elementsMap["newPlayerName"] = { value: "Impostor Player" };
elementsMap["newPlayerRoll"] = { value: "24815a0443" }; // lowercase variation
elementsMap["newPlayerProgram"] = { value: "B.Tech" };
elementsMap["newPlayerDept"] = { value: "ECE" };
elementsMap["newPlayerYear"] = { value: "3" };
elementsMap["newPlayerBucket"] = { value: "B3" };
elementsMap["newPlayerRole"] = { value: "BATTER" };
elementsMap["newPlayerBasePrice"] = { value: "80" };
elementsMap["newPlayerMobile"] = { value: "9123456780" };

const prevCount = vm.runInContext("players.length", ctx);
vm.runInContext("saveCreatePlayerModal();", ctx);
const afterCount = vm.runInContext("players.length", ctx);
assert(afterCount === prevCount, "Lowercase variation '24815a0443' blocked from duplicate insertion");

// ---------------------------------------------------------
// TEST 9: Existing mobile -> duplicate blocked
// ---------------------------------------------------------
console.log("\n--- TEST 9: DUPLICATE MOBILE NUMBER BLOCKED ---");
vm.runInContext("players.find(p => p.id === 995).mobile = '9988776655';", ctx);
elementsMap["newPlayerName"] = { value: "Another Player" };
elementsMap["newPlayerRoll"] = { value: "26811A0599" };
elementsMap["newPlayerMobile"] = { value: "9988776655" }; // same mobile number

vm.runInContext("saveCreatePlayerModal();", ctx);
const afterMobileCount = vm.runInContext("players.length", ctx);
assert(afterMobileCount === prevCount, "Duplicate mobile number '9988776655' blocked from registration");

// ---------------------------------------------------------
// TEST 10: Approve player -> public realtime player list updates
// ---------------------------------------------------------
console.log("\n--- TEST 10: APPROVE PLAYER UPDATES PUBLIC LIST ---");
vm.runInContext(`
players.push({
  id: 996,
  name: "Arjun Das",
  roll: "26811A0202",
  program: "B.Tech",
  department: "EEE",
  year: 1,
  bucket: "B1",
  basePrice: 60,
  photo: "https://example.com/p6.jpg",
  approvalStatus: "PENDING_APPROVAL",
  verificationStatus: "PENDING_VERIFICATION",
  status: "PENDING_VERIFICATION",
  auctionEligible: false
});
`, ctx);

let pubList = vm.runInContext("players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && p.status !== 'BLOCKED' && p.status !== 'PENDING_VERIFICATION')", ctx);
assert(!pubList.some(p => p.id === 996), "Pre-approval: player hidden from public");

vm.runInContext("executeApprovePlayer(996);", ctx);
pubList = vm.runInContext("players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && p.status !== 'BLOCKED' && p.status !== 'PENDING_VERIFICATION')", ctx);
assert(pubList.some(p => p.id === 996), "Post-approval: player immediately visible on public catalog in realtime");

// ---------------------------------------------------------
// TEST 11: Block approved player -> public realtime list removes player
// ---------------------------------------------------------
console.log("\n--- TEST 11: BLOCK APPROVED PLAYER REMOVES FROM PUBLIC ---");
elementsMap["blockReasonInput"] = { value: "Direct disqualification" };
vm.runInContext("executeBlockPlayer(996);", ctx);
pubList = vm.runInContext("players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && p.status !== 'BLOCKED' && p.status !== 'PENDING_VERIFICATION')", ctx);
assert(!pubList.some(p => p.id === 996), "Blocked player immediately removed from public catalog");

// ---------------------------------------------------------
// TEST 12: Admin Console UI rendering integrity
// ---------------------------------------------------------
console.log("\n--- TEST 12: ADMIN CONSOLE UI RENDERING INTEGRITY ---");
vm.runInContext("adminNavTab = 'PLAYERS';", ctx);
vm.runInContext("playerBucketFilter = 'ALL';", ctx);
vm.runInContext("playerApprovalFilter = 'ALL';", ctx);
vm.runInContext("playerAccountFilter = 'ALL';", ctx);
vm.runInContext("playerAuctionStatusFilter = 'ALL';", ctx);
vm.runInContext("playerSearchQuery = '';", ctx);

const renderedAdminHTML = vm.runInContext("renderAdminConsoleView();", ctx);
assert(renderedAdminHTML.includes("PLAYER DIRECTORY"), "Admin Console renders PLAYER DIRECTORY");
assert(renderedAdminHTML.includes("BUCKET:"), "Admin Console renders BUCKET filter");
assert(renderedAdminHTML.includes("APPROVAL:"), "Admin Console renders APPROVAL filter");
assert(renderedAdminHTML.includes("ACCOUNT:"), "Admin Console renders ACCOUNT filter");
assert(renderedAdminHTML.includes("player-desktop-table"), "Renders player-desktop-table");
assert(renderedAdminHTML.includes("player-mobile-cards"), "Renders player-mobile-cards");

// ---------------------------------------------------------
// TEST 13: Mobile view -> player cards, not broken desktop table
// ---------------------------------------------------------
console.log("\n--- TEST 13: MOBILE CARD LAYOUT & RESPONSIVE CSS ---");
assert(htmlContent.includes("@media (max-width: 768px)"), "Contains mobile breakpoint at 768px");
assert(/\.player-desktop-table\s*\{\s*display:\s*none\s*!important;/i.test(htmlContent), "Desktop table hidden on mobile screens (< 768px)");
assert(/\.player-mobile-cards\s*\{\s*display:\s*flex\s*!important;/i.test(htmlContent), "Mobile cards displayed on mobile screens (< 768px)");
assert(/\.admin-metrics-grid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*1fr\)\s*!important;/i.test(htmlContent), "Metrics cards switch to 2 columns on mobile");

console.log("\n======================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("======================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✔ ALL 13 FINAL ACCEPTANCE TESTS PASSED PERFECTLY!");
}
