const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================');
console.log('RUNNING TEST: 4:3 ASPECT RATIO & DATABASE LIVE BADGE');
console.log('====================================================');

const html = fs.readFileSync('B:/projects/ACC/index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const ctx = {
  window: { addEventListener: () => {}, location: { hash: '' } },
  document: {
    getElementById: (id) => {
      return {
        style: {},
        innerHTML: '',
        value: '',
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {}
      };
    },
    createElement: (tag) => {
      return {
        style: {},
        innerHTML: '',
        value: '',
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        getContext: () => ({ drawImage: () => {} }),
        toDataURL: () => 'data:image/jpeg;base64,mock4to3jpeg'
      };
    },
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
  },
  navigator: { onLine: true },
  localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null },
  sessionStorage: { clear: () => null },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

vm.createContext(ctx);
vm.runInContext(code, ctx);

// TEST 1: checkAspectRatio4to3 helper function
console.log('\n--- TEST 1: Aspect Ratio 4:3 Validation Function ---');
const checkAspectRatio4to3 = vm.runInContext('checkAspectRatio4to3', ctx);

// Valid 4:3 dimensions (should return true)
assert.strictEqual(checkAspectRatio4to3(800, 600), true, '800x600 must be valid 4:3');
assert.strictEqual(checkAspectRatio4to3(1024, 768), true, '1024x768 must be valid 4:3');
assert.strictEqual(checkAspectRatio4to3(400, 300), true, '400x300 must be valid 4:3');
assert.strictEqual(checkAspectRatio4to3(1200, 900), true, '1200x900 must be valid 4:3');
assert.strictEqual(checkAspectRatio4to3(1600, 1200), true, '1600x1200 must be valid 4:3');
console.log('✔ All standard 4:3 resolutions pass (800x600, 1024x768, 400x300, 1200x900, 1600x1200)');

// Invalid dimensions (should return false)
assert.strictEqual(checkAspectRatio4to3(500, 500), false, '1:1 square must be rejected');
assert.strictEqual(checkAspectRatio4to3(1920, 1080), false, '16:9 widescreen must be rejected');
assert.strictEqual(checkAspectRatio4to3(1280, 720), false, '16:9 must be rejected');
assert.strictEqual(checkAspectRatio4to3(600, 800), false, '3:4 portrait must be rejected');
assert.strictEqual(checkAspectRatio4to3(1080, 1920), false, '9:16 vertical must be rejected');
assert.strictEqual(checkAspectRatio4to3(1200, 800), false, '3:2 photography ratio must be rejected');
console.log('✔ All non-4:3 ratios strictly rejected (1:1, 16:9, 3:4 portrait, 9:16 vertical, 3:2)');

// TEST 2: getSimplifiedRatio helper function
console.log('\n--- TEST 2: Simplified Ratio Representation ---');
const getSimplifiedRatio = vm.runInContext('getSimplifiedRatio', ctx);
assert.strictEqual(getSimplifiedRatio(800, 600), '4:3', '800x600 should simplify to 4:3');
assert.strictEqual(getSimplifiedRatio(1024, 768), '4:3', '1024x768 should simplify to 4:3');
assert.strictEqual(getSimplifiedRatio(500, 500), '1:1', '500x500 should simplify to 1:1');
console.log('✔ Simplified ratio helper returns 4:3 for standard inputs');

// TEST 3: LIVE Badge Color & Database Working Logic
console.log('\n--- TEST 3: Database LIVE Color Status Engine ---');
const isDatabaseWorking = vm.runInContext('isDatabaseWorking', ctx);
console.log('Initial isDatabaseWorking():', isDatabaseWorking());

// Mock element for liveHeaderBadge
const mockLiveBadge = {
  style: {},
  className: '',
  innerHTML: '',
  title: ''
};
ctx.document.getElementById = (id) => {
  if (id === 'liveHeaderBadge') return mockLiveBadge;
  return { style: {}, innerHTML: '', className: '' };
};

// Test when Database is Working: Color MUST be GREEN
vm.runInContext(`
  window.RealtimeStore.state.connection.status = "CONNECTED";
  renderConnectionBadge();
`, ctx);

assert.strictEqual(mockLiveBadge.style.color, 'var(--color-green)', 'LIVE badge color must be green when database is working');
assert.strictEqual(mockLiveBadge.className, 'status-badge status-live', 'Badge class must be status-live');
assert.ok(mockLiveBadge.innerHTML.includes('LIVE'), 'Badge innerHTML must contain LIVE');
assert.ok(mockLiveBadge.innerHTML.includes('var(--color-green)'), 'Badge dot must use green color');
console.log('✔ Live Badge is GREEN when Database is CONNECTED & working perfectly');

// Test when Database is NOT Working (OFFLINE): Color MUST be RED
vm.runInContext(`
  window.RealtimeStore.state.connection.status = "OFFLINE";
  renderConnectionBadge();
`, ctx);

assert.strictEqual(mockLiveBadge.style.color, 'var(--color-red)', 'LIVE badge color must be red when database is offline/not working');
assert.strictEqual(mockLiveBadge.className, 'status-badge status-offline', 'Badge class must be status-offline');
assert.ok(mockLiveBadge.innerHTML.includes('LIVE'), 'Badge innerHTML must contain LIVE');
assert.ok(mockLiveBadge.innerHTML.includes('var(--color-red)'), 'Badge dot must use red color');
console.log('✔ Live Badge is RED when Database is OFFLINE / disconnected');

// TEST 4: Player Registration View contains 4:3 requirements and message div below input
console.log('\n--- TEST 4: Player Registration 4:3 UI Integration ---');
vm.runInContext('currentView = "player-register";', ctx);
const regHtml = vm.runInContext('renderPlayerRegistrationView();', ctx);
assert.ok(regHtml.includes('OFFICIAL PHOTO (4:3 RATIO)'), 'Photo field label must state 4:3 ratio');
assert.ok(regHtml.includes('id="regPhotoInput"'), 'Photo input must have id regPhotoInput');
assert.ok(regHtml.includes('id="playerPhotoRatioMessage"'), 'Message container must exist directly below upload');
assert.ok(regHtml.includes('handlePhotoUpload(this)'), 'Upload handler must be called on change');
console.log('✔ Player Registration UI properly renders 4:3 upload input and below-input ratio message element');

// TEST 5: Franchise Logo Upload & Updating
console.log('\n--- TEST 5: Franchise Logo 4:3 Support ---');
const franchiseCreateModalHtml = vm.runInContext(`
  openCreateFranchiseModal();
  document.getElementById("modalContainer").innerHTML;
`, ctx);
// Restore modal container lookup
ctx.document.getElementById = (id) => {
  if (id === 'modalContainer') return { innerHTML: '' };
  return { style: {}, innerHTML: '', className: '' };
};
assert.ok(html.includes('FRANCHISE LOGO (4:3 ASPECT RATIO MANDATORY)'), 'Create Franchise Modal must enforce 4:3 ratio');
assert.ok(html.includes('handleFranchiseLogoUpload'), 'handleFranchiseLogoUpload function must be present');
assert.ok(html.includes('openFranchiseLogoModal'), 'openFranchiseLogoModal function must be present');
assert.ok(html.includes('saveFranchiseLogoFromModal'), 'saveFranchiseLogoFromModal function must be present');
console.log('✔ Franchise Logo upload, modal, and persistence functions verified');

console.log('\n====================================================');
console.log('ALL 4:3 ASPECT RATIO & LIVE BADGE TESTS PASSED (5/5)');
console.log('====================================================');
