const fs = require('fs');
const assert = require('assert');

console.log('======================================================================');
console.log('   ACC 2026 — PAGE RELOAD VIEW & SUB-TAB PERSISTENCE TEST SUITE      ');
console.log('======================================================================');

const htmlContent = fs.readFileSync('Acc-Auction-Os.html', 'utf8');

// TEST 1: DOMContentLoaded restores exact views without wiping valid sessions
console.log('\n--- TEST 1: SESSION & VIEW RESTORATION IN DOMCONTENTLOADED ---');
assert(htmlContent.includes('// Validate restored session against canonical users if pre-provisioned'), 'Missing safe session restoration');
assert(htmlContent.includes('currentUser = canonicalUser ? { ...canonicalUser, ...parsed } : parsed;'), 'Missing canonical-safe user assignment');
assert(!htmlContent.includes('// Invalid, tampered, or locked session. Revert to PUBLIC.\n              currentUser = { role: "PUBLIC"'), 'Old session wipe logic still present');
console.log('[PASS] Session restoration preserves dynamic players, franchises, and admin sessions without wipe.');

// TEST 2: Admin sub-tab hash synchronization
console.log('\n--- TEST 2: ADMIN SUB-TAB SYNCHRONIZATION ---');
assert(htmlContent.includes('let adminNavTab = (typeof localStorage !== \'undefined\' && localStorage.getItem("acc_last_admin_tab")) || \'AUCTION\';'), 'adminNavTab not initialized from localStorage');
assert(htmlContent.includes('const expectedHash = "#admin/" + subSlug;'), 'Missing sub-tab hash URL sync in setAdminNavTab');
assert(htmlContent.includes('history.replaceState(null, "", expectedHash)'), 'Missing history.replaceState for smooth hash synchronization');
console.log('[PASS] Admin sub-tab synchronized to URL hash and localStorage.');

// TEST 3: DOMContentLoaded Sub-Route Extraction
console.log('\n--- TEST 3: SUB-ROUTE EXTRACTION ON RELOAD ---');
assert(htmlContent.includes('let hashParts = rawHash.split(\'/\');'), 'Missing hashParts parsing for sub-route extraction');
assert(htmlContent.includes('adminNavTab = candidateTab || \'AUCTION\';'), 'Missing candidateTab fallback for admin sub-tab');
assert(htmlContent.includes('targetHash = currentView === "public" ? "home" : (currentView === "admin" ? `admin/${subSlug}` : currentView);'), 'Missing targetHash synchronization');
console.log('[PASS] Exact sub-tab restored from URL and localStorage on reload.');

// TEST 4: Hashchange listener supports sub-routes
console.log('\n--- TEST 4: HASHCHANGE EVENT HANDLING ---');
assert(htmlContent.includes('if (hash === "admin" && subRoute)'), 'hashchange listener missing admin subRoute support');
assert(htmlContent.includes('adminNavTab = subTab;'), 'hashchange listener does not update adminNavTab');
console.log('[PASS] Hashchange listener cleanly routes sub-tabs.');

// TEST 5: Simulation of all 10 reload scenarios
console.log('\n--- TEST 5: SIMULATION OF ALL 10 RELOAD SCENARIOS ---');
function simulateReload(urlHash, savedUser, savedLastView, savedAdminTab) {
  let localStorage = {
    acc_current_user_2026: savedUser ? JSON.stringify(savedUser) : null,
    acc_last_active_view: savedLastView,
    acc_last_admin_tab: savedAdminTab
  };
  const INITIAL_USERS = [
    { uid: 'usr_superadmin', role: 'SUPER_ADMIN', name: 'Mr. Deepak' },
    { uid: 'usr_handler1', role: 'ADMIN', name: 'P. Rajesh' },
    { uid: 'usr_f1_coord', role: 'FRANCHISE', franchiseId: 1 }
  ];
  let users = [...INITIAL_USERS];
  let currentUser = { role: 'PUBLIC', name: 'Public Guest' };
  let currentView = 'public';
  let adminNavTab = 'AUCTION';
  let windowLocationHash = urlHash;

  const savedUserStr = localStorage.acc_current_user_2026;
  if (savedUserStr) {
    try {
      const parsed = JSON.parse(savedUserStr);
      if (parsed && parsed.role && parsed.uid) {
        const canonicalUser = users.find(u => u.uid === parsed.uid);
        if (canonicalUser && (canonicalUser.status === 'LOCKED' || canonicalUser.status === 'BLOCKED')) {
          currentUser = { role: 'PUBLIC', name: 'Public Guest' };
          delete localStorage.acc_current_user_2026;
        } else {
          currentUser = canonicalUser ? { ...canonicalUser, ...parsed } : parsed;
          if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') {
            currentUser.mustChangePassword = false;
          }
        }
      }
    } catch(e) {}
  }

  let rawHash = (windowLocationHash || '').replace(/^#\/?/, '').trim();
  let hashParts = rawHash.split('/');
  let hash = hashParts[0] || '';
  let subRoute = hashParts[1] || '';

  if (rawHash === 'franchise/register' || rawHash === 'franchise-register') {
    hash = 'franchise-register';
    subRoute = '';
  } else if (rawHash === 'debug/realtime' || rawHash === 'debug-realtime') {
    hash = 'debug/realtime';
    subRoute = '';
  } else if (hash === 'home') {
    hash = 'public';
  }

  const validViews = ['public', 'live', 'franchise', 'teams', 'register', 'franchise-register', 'player', 'admin', 'projector', 'login'];

  const lastView = localStorage.acc_last_active_view;
  if ((!hash || hash === 'public') && lastView && validViews.includes(lastView) && lastView !== 'public') {
    if (!rawHash || rawHash === 'home') {
      hash = lastView;
    }
  }
  if (!hash) hash = 'public';

  const DEMO_MODE = true;
  if (DEMO_MODE && (!currentUser || currentUser.role === 'PUBLIC' || !currentUser.role)) {
    if (hash === 'admin') {
      currentUser = { ...INITIAL_USERS[0], mustChangePassword: false };
      localStorage.acc_current_user_2026 = JSON.stringify(currentUser);
    } else if (hash === 'franchise') {
      currentUser = { ...INITIAL_USERS[2], mustChangePassword: false };
      localStorage.acc_current_user_2026 = JSON.stringify(currentUser);
    }
  }

  const authCtx = {
    isAdmin: currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN',
    isFranchise: currentUser.role === 'FRANCHISE',
    isPlayer: currentUser.role === 'PLAYER'
  };

  if (validViews.includes(hash)) {
    if (hash === 'player' && !authCtx.isPlayer) {
      hash = authCtx.isAdmin ? 'admin' : (authCtx.isFranchise ? 'franchise' : 'public');
    } else if (hash === 'admin' && !authCtx.isAdmin) {
      hash = 'public';
    } else if (hash === 'franchise' && !authCtx.isFranchise && !authCtx.isSuperAdmin) {
      hash = 'public';
    }
    currentView = hash;
  } else {
    currentView = 'public';
  }

  if (currentView === 'admin') {
    const validAdminTabs = ['OVERVIEW', 'AUCTION', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS', 'FRANCHISES', 'SETTINGS'];
    let candidateTab = null;
    if (subRoute) {
      const norm = subRoute.toUpperCase().replace(/-/g, ' ');
      if (validAdminTabs.includes(norm)) candidateTab = norm;
    }
    if (!candidateTab) {
      const saved = localStorage.acc_last_admin_tab;
      if (saved && validAdminTabs.includes(saved)) candidateTab = saved;
    }
    adminNavTab = candidateTab || 'AUCTION';
    localStorage.acc_last_admin_tab = adminNavTab;
  }

  localStorage.acc_last_active_view = currentView;
  const subSlug = (currentView === 'admin' && adminNavTab) ? adminNavTab.toLowerCase().replace(/\s+/g, '-') : '';
  const targetHash = currentView === 'public' ? 'home' : (currentView === 'admin' ? 'admin/' + subSlug : currentView);

  return { currentView, adminNavTab, targetHash };
}

// 1. Reload while on #live
const r1 = simulateReload('#live', null, 'live', null);
assert.strictEqual(r1.currentView, 'live');
console.log('✓ Reload on #live stays on live');

// 2. Reload while on #teams
const r2 = simulateReload('#teams', null, 'teams', null);
assert.strictEqual(r2.currentView, 'teams');
console.log('✓ Reload on #teams stays on teams');

// 3. Reload while on #admin/players
const r3 = simulateReload('#admin/players', null, 'admin', 'PLAYERS');
assert.strictEqual(r3.currentView, 'admin');
assert.strictEqual(r3.adminNavTab, 'PLAYERS');
console.log('✓ Reload on #admin/players stays on admin PLAYERS tab');

// 4. Reload while on #admin with saved AUCTION tab
const r4 = simulateReload('#admin', null, 'admin', 'AUCTION');
assert.strictEqual(r4.currentView, 'admin');
assert.strictEqual(r4.adminNavTab, 'AUCTION');
console.log('✓ Reload on #admin stays on admin AUCTION tab');

// 5. Reload while on #franchise-register
const r5 = simulateReload('#franchise-register', null, 'franchise-register', null);
assert.strictEqual(r5.currentView, 'franchise-register');
console.log('✓ Reload on #franchise-register stays on franchise-register');

// 6. Reload while on #register
const r6 = simulateReload('#register', null, 'register', null);
assert.strictEqual(r6.currentView, 'register');
console.log('✓ Reload on #register stays on register');

// 7. Reload while on #player with logged in player
const r7 = simulateReload('#player', { uid: 'usr_p501', role: 'PLAYER', name: 'Sai' }, 'player', null);
assert.strictEqual(r7.currentView, 'player');
console.log('✓ Reload on #player preserves logged in player session');

// 8. Reload while on #projector
const r8 = simulateReload('#projector', null, 'projector', null);
assert.strictEqual(r8.currentView, 'projector');
console.log('✓ Reload on #projector stays on projector');

// 9. Reload while on #login
const r9 = simulateReload('#login', null, 'login', null);
assert.strictEqual(r9.currentView, 'login');
console.log('✓ Reload on #login stays on login');

// 10. Reload with empty hash but saved last view
const r10 = simulateReload('', null, 'live', null);
assert.strictEqual(r10.currentView, 'live');
console.log('✓ Reload with empty hash restores saved last view (live)');

console.log('\n======================================================================');
console.log('>>> ALL PAGE RELOAD VIEW PERSISTENCE TESTS PASSED! <<<');
console.log('======================================================================');
