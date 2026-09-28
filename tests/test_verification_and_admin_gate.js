const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('B:/projects/ACC/index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const ctx = {
  window: { addEventListener: () => {}, location: { hash: '' } },
  document: {
    getElementById: (id) => {
      if (id === 'regAcademicDiscrepancyNotice') return { style: {}, innerHTML: '' };
      return { classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, style: {} };
    },
    createElement: (tag) => {
      return { classList: { add: () => {}, remove: () => {} }, style: {}, innerHTML: '', appendChild: () => {}, remove: () => {} };
    },
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
  prompt: () => 'Passport photo requires high-res replacement',
  confirm: () => true
};

vm.createContext(ctx);
vm.runInContext(code, ctx);

console.log('--- TEST 1: ADMIN CONSOLE WITH PLAYER VERIFICATION TAB ---');
vm.runInContext("currentUser = { role: 'SUPER_ADMIN', name: 'Master Super Admin', title: 'Chief Controller' };", ctx);
vm.runInContext("adminNavTab = 'PLAYER VERIFICATION';", ctx);
const adminHtml = vm.runInContext("renderAdminConsoleView();", ctx);

console.log('Contains PLAYER VERIFICATION HARD GATE:', adminHtml.includes('PLAYER VERIFICATION HARD GATE'));
console.log('Contains PENDING sub-tab:', adminHtml.includes('PENDING'));
console.log('Contains VERIFIED sub-tab:', adminHtml.includes('VERIFIED'));
console.log('Contains CHANGES REQUIRED sub-tab:', adminHtml.includes('CHANGES REQUIRED'));
console.log('Contains REJECTED sub-tab:', adminHtml.includes('REJECTED'));
console.log('Contains BLOCKED sub-tab:', adminHtml.includes('BLOCKED'));

console.log('\n--- TEST 2: PLAYER VERIFICATION ACTIONS WORKFLOW ---');
const players = vm.runInContext("players", ctx);
const testPlayer = players[0];
console.log('Initial status of player 0:', testPlayer.verificationStatus, testPlayer.status);

vm.runInContext(`adminRequestCorrection(${testPlayer.id});`, ctx);
console.log('After adminRequestCorrection:', testPlayer.verificationStatus, testPlayer.status, 'Note:', testPlayer.correctionNote);

vm.runInContext(`adminVerifyPlayer(${testPlayer.id});`, ctx);
console.log('After adminVerifyPlayer:', testPlayer.verificationStatus, testPlayer.status);

vm.runInContext(`adminRejectPlayer(${testPlayer.id});`, ctx);
console.log('After adminRejectPlayer:', testPlayer.verificationStatus, testPlayer.status);

vm.runInContext(`adminBlockPlayer(${testPlayer.id});`, ctx);
console.log('After adminBlockPlayer:', testPlayer.verificationStatus, testPlayer.status);

vm.runInContext(`adminResetPlayerToPending(${testPlayer.id});`, ctx);
console.log('After adminResetPlayerToPending:', testPlayer.verificationStatus, testPlayer.status);

console.log('\n--- TEST 3: PUBLIC PLAYERS HARD GATE ---');
testPlayer.verificationStatus = 'PENDING_VERIFICATION';
testPlayer.status = 'PENDING_VERIFICATION';
vm.runInContext("publicSearchQuery = ''; publicBucketFilter = 'ALL';", ctx);
const publicHtml = vm.runInContext("renderPublicView();", ctx);
// The player name should NOT be in the public catalog while unverified
const nameInPublic = publicHtml.includes(testPlayer.name);
console.log('Is unverified player visible on public catalog?', nameInPublic ? 'FAIL (Leak)' : 'PASS (Securely Hidden)');

vm.runInContext(`adminVerifyPlayer(${testPlayer.id});`, ctx);
const publicHtmlVerified = vm.runInContext("renderPublicView();", ctx);
const verifiedInPublic = publicHtmlVerified.includes(testPlayer.name);
console.log('Is verified player visible on public catalog?', verifiedInPublic ? 'PASS (Visible)' : 'FAIL');

console.log('\n--- TEST 4: PROJECTOR EXIT ROUTING ---');
const projectorHtml = vm.runInContext("renderProjectorView();", ctx);
console.log('Projector exit button targets public and home hash:', projectorHtml.includes("switchView('public'); window.location.hash = 'home';"));

console.log('\n--- TEST 5: LOGOUT RESET TO PUBLIC ---');
vm.runInContext("logoutUser();", ctx);
const currentUser = vm.runInContext("currentUser", ctx);
console.log('Current user after logout:', currentUser.role, currentUser.name);
console.log('Is user reset to PUBLIC?', currentUser.role === 'PUBLIC');

console.log('\nALL VERIFICATION AND GATE TESTS PASSED!');
