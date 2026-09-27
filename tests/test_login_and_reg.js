const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('B:/projects/ACC/index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

const ctx = {
  window: { addEventListener: () => {}, location: { hash: '' } },
  document: { getElementById: () => null, querySelectorAll: () => [], body: { classList: { add: () => {}, remove: () => {} } } },
  localStorage: { getItem: () => null, setItem: () => null },
  console: console
};
vm.createContext(ctx);
vm.runInContext(code, ctx);

console.log('--- TEST 1: LOGIN VIEW CHECKS ---');
vm.runInContext("loginRoleSelection = 'ADMIN';", ctx);
const loginHtml = vm.runInContext("renderLoginView();", ctx);

const hasStaff = loginHtml.includes('STAFF') || loginHtml.includes('Staff');
console.log('Does login HTML contain STAFF / Staff?', hasStaff ? 'FAIL' : 'PASS (Clean)');

console.log('Check ADMIN USERNAME OR EMAIL:', loginHtml.includes('ADMIN USERNAME OR EMAIL'));
console.log('Check ADMIN PASSWORD:', loginHtml.includes('ADMIN PASSWORD'));
console.log('Check FORGOT PASSWORD?:', loginHtml.includes('FORGOT PASSWORD?'));
console.log('Check AUTHENTICATE ADMIN:', loginHtml.includes('AUTHENTICATE ADMIN'));

console.log('\n--- TEST 2: ACADEMIC BUCKET DERIVATION CHECKS ---');
// B.Tech
console.log('B.Tech Year 1:', ctx.deriveBucketFromAcademic('B.Tech', 1), '(Expected: B1)');
console.log('B.Tech Year 2:', ctx.deriveBucketFromAcademic('B.Tech', 2), '(Expected: B2)');
console.log('B.Tech Year 3:', ctx.deriveBucketFromAcademic('B.Tech', 3), '(Expected: B3)');
console.log('B.Tech Year 4:', ctx.deriveBucketFromAcademic('B.Tech', 4), '(Expected: B4)');

// Diploma
console.log('Diploma Year 1:', ctx.deriveBucketFromAcademic('Diploma', 1), '(Expected: D5)');
console.log('Diploma Year 2:', ctx.deriveBucketFromAcademic('Diploma', 2), '(Expected: D5)');
console.log('Diploma Year 3:', ctx.deriveBucketFromAcademic('Diploma', 3), '(Expected: D5)');

// PG
console.log('PG Year 1:', ctx.deriveBucketFromAcademic('PG', 1), '(Expected: M6)');
console.log('PG Year 2:', ctx.deriveBucketFromAcademic('PG', 2), '(Expected: M6)');

console.log('\n--- TEST 3: REGISTRATION FRESH STATE ---');
const freshState = ctx.initFreshRegistrationState();
console.log('Fresh roll:', freshState.roll === '');
console.log('Fresh name:', freshState.name === '');
console.log('Fresh mobile:', freshState.mobile === '');
console.log('Fresh photo:', freshState.photo === '');
console.log('Fresh basePrice is null:', freshState.basePrice === null);

console.log('\n--- TEST 4: REGISTRATION VIEW RENDERING ---');
const regHtml = ctx.renderPlayerRegistrationView();
console.log('Contains AUTO-DERIVED · LOCKED:', regHtml.includes('AUTO-DERIVED · LOCKED'));
console.log('Contains 01 IDENTITY & ACADEMIC:', regHtml.includes('01 IDENTITY & ACADEMIC'));
console.log('Contains 02 CRICKET PROFILE:', regHtml.includes('02 CRICKET PROFILE'));
console.log('Contains continuous typing input for roll:', regHtml.includes('id="regRollInput"'));
console.log('Contains pointer-events: none on buckets:', regHtml.includes('pointer-events: none'));

console.log('\nALL UNIT CHECKS COMPLETED!');
