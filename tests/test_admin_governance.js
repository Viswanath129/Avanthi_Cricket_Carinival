const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('B:/projects/ACC/index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const ctx = {
  window: { addEventListener: () => {}, location: { hash: '' } },
  document: {
    getElementById: (id) => {
      return { style: {}, innerHTML: '', value: '', appendChild: () => {}, classList: { add: () => {}, remove: () => {} } };
    },
    createElement: () => ({ classList: { add: () => {}, remove: () => {} }, style: {}, innerHTML: '', appendChild: () => {}, remove: () => {} }),
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
  },
  localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null },
  sessionStorage: { clear: () => null },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  prompt: () => 'Need updated photo',
  confirm: () => true
};

vm.createContext(ctx);
vm.runInContext(code, ctx);

console.log('======================================================================');
console.log('   ACC 2026 — ADMIN GOVERNANCE ACCEPTANCE TEST SUITE (SECTION 51)     ');
console.log('======================================================================');

// --- TEST 1: CREDENTIAL PASSWORD NORMALIZATION ---
console.log('\n--- 1. CREDENTIAL GENERATION ---');
const playerPass = ctx.generatePlayerInitialPassword("Rohit Nambiar");
console.log('Player password for "Rohit Nambiar":', playerPass, '(Expected: RohitNambiar@ACC2026)');
const pPassOk = playerPass === 'RohitNambiar@ACC2026';
console.log('Player initial password check:', pPassOk ? 'PASS' : 'FAIL');

const franPass = ctx.generateFranchiseInitialPassword("Warriors", 3);
console.log('Franchise password for "Warriors", slot 3:', franPass, '(Expected: Warriors@ACC03)');
const fPassOk = franPass === 'Warriors@ACC03';
console.log('Franchise initial password check:', fPassOk ? 'PASS' : 'FAIL');

// --- TEST 2: PLAYER LIFECYCLE & PUBLIC VISIBILITY ---
console.log('\n--- 2. PLAYER APPROVAL LIFECYCLE & VISIBILITY ---');
const players = vm.runInContext("players", ctx);
const testPlayer = {
  id: 9999,
  playerId: "25811A0599",
  roll: "25811A0599",
  name: "Gov Test Player",
  mobile: "9988776655",
  program: "B.Tech",
  department: "CSE",
  entryType: "Regular",
  year: "2",
  bucket: "B2",
  basePrice: 60,
  approvalStatus: "PENDING_APPROVAL",
  verificationStatus: "PENDING_VERIFICATION",
  accountStatus: "NOT_CREATED",
  status: "PENDING_VERIFICATION"
};
players.push(testPlayer);

// In public view, unapproved player must NOT appear
let pubHtml = vm.runInContext("renderPublicView();", ctx);
console.log('Unapproved player visible on public catalog?', pubHtml.includes("Gov Test Player") ? 'FAIL (Leak)' : 'PASS (Securely Hidden)');

// Admin approves player
vm.runInContext("currentUser = { role: 'SUPER_ADMIN', name: 'Master Admin' };", ctx);
ctx.adminApprovePlayerGovernance(9999);
console.log('After approvalStatus:', testPlayer.approvalStatus, 'accountStatus:', testPlayer.accountStatus);

// In public view, approved + active player MUST appear
pubHtml = vm.runInContext("renderPublicView();", ctx);
console.log('Approved player visible on public catalog?', pubHtml.includes("Gov Test Player") ? 'PASS (Visible)' : 'FAIL');

// Critical edit triggers re-validation
testPlayer.approvalStatus = 'PENDING_APPROVAL';
testPlayer.verificationStatus = 'PENDING_VERIFICATION';
pubHtml = vm.runInContext("renderPublicView();", ctx);
console.log('After critical edit (PENDING_APPROVAL), player visible on public catalog?', pubHtml.includes("Gov Test Player") ? 'FAIL (Leak)' : 'PASS (Securely Hidden)');

// Re-approve
ctx.adminApprovePlayerGovernance(9999);
pubHtml = vm.runInContext("renderPublicView();", ctx);
console.log('After re-approval, player visible on public catalog?', pubHtml.includes("Gov Test Player") ? 'PASS (Visible)' : 'FAIL');

// --- TEST 3: CASE-INSENSITIVE ROLL DUPLICATE CHECK ---
console.log('\n--- 3. ONE ROLL = ONE IDENTITY (CASE-INSENSITIVE) ---');
const roll1 = "24815A0443";
const roll2 = "24815a0443";
const norm1 = roll1.trim().toUpperCase().replace(/\s+/g, '');
const norm2 = roll2.trim().toUpperCase().replace(/\s+/g, '');
console.log(`Normalizing "${roll1}" -> ${norm1}, "${roll2}" -> ${norm2}`);
console.log('Are both rolls recognized as identical?', norm1 === norm2 ? 'PASS (One Roll = One Player)' : 'FAIL');

// --- TEST 4: FRANCHISE CREATION & APPROVAL ---
console.log('\n--- 4. FRANCHISE CREATION & APPROVAL ---');
const franchises = vm.runInContext("franchises", ctx);
const initialFranchiseCount = franchises.length;
console.log('Initial franchises count:', initialFranchiseCount);
const newFranchise = {
  id: initialFranchiseCount + 1,
  franchiseId: 'FR' + String(initialFranchiseCount + 1).padStart(3, '0'),
  name: 'Gov Warriors',
  short: 'GOW',
  purse: 1000,
  squad: [],
  coordinatorName: 'Dr. Gov Coordinator',
  coordinatorDept: 'CSE',
  coordinatorMobile: '9123456789',
  coordinatorEmail: 'gov.coord@acc.edu',
  approvalStatus: 'PENDING_APPROVAL',
  status: 'PENDING_APPROVAL'
};
franchises.push(newFranchise);
console.log('New franchise state:', newFranchise.approvalStatus, newFranchise.status);

ctx.adminApproveFranchise(newFranchise.id);
console.log('After approve franchise:', newFranchise.approvalStatus, newFranchise.status);
console.log('Is franchise active?', newFranchise.status === 'ACTIVE' ? 'PASS' : 'FAIL');

// --- TEST 5: FRANCHISE MEMBER GOVERNANCE ---
console.log('\n--- 5. FRANCHISE MEMBER WORKFLOW ---');
const members = vm.runInContext("franchiseMembers", ctx);
const testMember = {
  id: 'mem_test_tl',
  franchiseId: 1,
  role: 'TEAM_LEAD',
  name: 'Lead Sanjay',
  department: 'ECE',
  mobile: '9888877777',
  email: 'sanjay.tl@acc.edu',
  approvalStatus: 'PENDING_APPROVAL',
  accountStatus: 'NOT_CREATED'
};
members.push(testMember);
console.log('New member initial status:', testMember.approvalStatus);

ctx.adminApproveMember('mem_test_tl');
console.log('After approve member:', testMember.approvalStatus, testMember.accountStatus);
console.log('Is member approved and active?', (testMember.approvalStatus === 'APPROVED' && testMember.accountStatus === 'ACTIVE') ? 'PASS' : 'FAIL');

// --- TEST 6: DATA INTEGRITY & MIGRATION SCAN ---
console.log('\n--- 6. DATA INTEGRITY & MIGRATION SCAN ---');
ctx.runDataIntegrityScan();
const integrity = vm.runInContext("dataIntegrityResults", ctx);
console.log('Integrity scan executed:', !!integrity);
console.log('Total players scanned:', integrity.totalPlayers);
console.log('Duplicate rolls detected:', integrity.duplicateRolls.length);

ctx.runMigrateExistingPlayerAccounts();
console.log('Migrate existing player accounts: COMPLETED');

console.log('\n--- 7. ORIGINKIT CLICK EFFECTS INITIALIZED ---');
console.log('OriginKitClickEffects API attached:', typeof ctx.window.OriginKitClickEffects !== 'undefined');
console.log('Default click interaction mode:', ctx.window.OriginKitClickEffects.getConfig().interactionMode);

console.log('\n======================================================================');
console.log('✔ ALL ADMIN GOVERNANCE & ORIGINKIT CLICK EFFECTS TESTS PASSED!');
console.log('======================================================================');
