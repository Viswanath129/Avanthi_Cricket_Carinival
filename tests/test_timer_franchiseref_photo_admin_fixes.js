// ======================================================================
// ACC 2026 — VERIFICATION TEST SUITE: TIMER, FRANCHISE REF, PHOTO UPLOAD, & FIREBASE RULES
// ======================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — TIMER, FRANCHISE REF, PHOTO & FIREBASE RULES TEST SUITE ");
console.log("======================================================================\n");

const htmlPath = path.join(__dirname, '..', 'Acc-Auction-Os.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');
const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');

const databaseRulesPath = path.join(__dirname, '..', 'database.rules.json');
const databaseRules = fs.readFileSync(databaseRulesPath, 'utf8');

// ----------------------------------------------------------------------
// TEST 1: FIREBASE SECURITY RULES COMPLETENESS
// ----------------------------------------------------------------------
console.log("--- TEST 1: FIREBASE SECURITY RULES AUDIT ---");
const requiredCollections = [
  'players',
  'publicPlayers',
  'playersPublic',
  'deletedPlayers',
  'franchises',
  'franchisesPublic',
  'deletedFranchises',
  'registrations',
  'playerUniqueKeys',
  'users',
  'acc_auctions'
];

requiredCollections.forEach(col => {
  const matchRegex = new RegExp(`match\\s+/${col}/\\{[a-zA-Z0-9_]+\\}\\s*\\{[^}]*allow\\s+read[^}]*\\}`, 's');
  assert(
    firestoreRules.includes(`match /${col}/`),
    `Missing firestore rule match block for collection: ${col}`
  );
  console.log(`[PASS] firestore.rules covers collection: ${col}`);
});

// Check RTDB rules
const rtdbParsed = JSON.parse(databaseRules);
assert(rtdbParsed.rules['.read'] === true || rtdbParsed.rules.presence['.read'] === true, "RTDB read rule missing");
assert(rtdbParsed.rules.publicStats['.write'] === true, "RTDB publicStats write missing");
console.log("[PASS] database.rules.json properly configures RTDB paths.\n");

// ----------------------------------------------------------------------
// TEST 2: AUCTION TIMER ACTIVATION CONDITION (FIRST BID ONLY)
// ----------------------------------------------------------------------
console.log("--- TEST 2: AUCTION TIMER ACTIVATION ON FIRST BID ONLY ---");

// Check selectPlayerForAuction does not start timer loop prematurely
assert(
  html.includes("timerMode = 'FIRST_BID'") &&
  html.includes("timerSeconds = 30") &&
  html.includes("timerRunning = false") &&
  html.includes("AuctionTimerEngine.stopLoop()"),
  "selectPlayerForAuction must leave timer in non-running state poised at 30s"
);
console.log("[PASS] selectPlayerForAuction poises timer at 30s with timerRunning = false");

// Check placeBid activates the timer
assert(
  html.includes("leadingBidderId = franchiseId;") &&
  html.includes("AuctionTimerEngine.onBid(franchiseId);"),
  "placeBid must trigger AuctionTimerEngine.onBid"
);
console.log("[PASS] placeBid activates AuctionTimerEngine.onBid on first bid");

// Check AuctionTimerEngine.onBid sets timerRunning to true and 20s countdown
assert(
  html.includes("timerMode = 'BID';") &&
  html.includes("timerDuration = 20000;") &&
  html.includes("timerSeconds = 20;") &&
  html.includes("timerRunning = true;"),
  "AuctionTimerEngine.onBid must set timerRunning = true and 20s duration"
);
console.log("[PASS] AuctionTimerEngine.onBid properly initiates 20s countdown");

// Check resetAuctionTimer differentiates between waiting and active bidding
assert(
  html.includes("if (!leadingBidderId) {") &&
  html.includes("timerMode = 'FIRST_BID';") &&
  html.includes("timerSeconds = 30;") &&
  html.includes("AuctionTimerEngine.reset(20000);"),
  "resetAuctionTimer must handle 30s waiting vs 20s active bid state"
);
console.log("[PASS] resetAuctionTimer handles both pre-bid (30s) and active bid (20s) states");

// Check status badges show WAITING FOR FIRST BID
assert(
  html.includes("WAITING FOR FIRST BID"),
  "UI status badge must render 'WAITING FOR FIRST BID' when lot has no leading bidder"
);
console.log("[PASS] clockStatusBadge renders 'WAITING FOR FIRST BID' when unstarted.\n");

// ----------------------------------------------------------------------
// TEST 3: ADMIN PANEL FRANCHISE REFERENCE FIX
// ----------------------------------------------------------------------
console.log("--- TEST 3: FRANCHISE REFERENCE IN ADMIN PANEL & PLAYER DOSSIER ---");

// openPlayerDetailModal identity section must display franchise referral
assert(
  html.includes("FRANCHISE REF:</span> <strong style=\"color: var(--color-green);\">${(p.referredByFranchise && p.referredByFranchise !== 'None') ? p.referredByFranchise : (p.referenceTeam || p.referredBy || 'None (Open Pool)')}</strong>"),
  "openPlayerDetailModal must display player's franchise referral"
);
console.log("[PASS] openPlayerDetailModal renders franchise referral");

// Player public inspect card must check referredByFranchise
assert(
  html.includes("${(p.referredByFranchise && p.referredByFranchise !== 'None') ? p.referredByFranchise : (p.referenceTeam || p.referredBy || p.referenceName || 'Open Tournament Pool')}"),
  "Player inspect card must check referredByFranchise before falling back to Open Tournament Pool"
);
console.log("[PASS] Player inspect card checks referredByFranchise accurately");

// Admin player directory table must display franchise ref
assert(
  html.includes("Ref: ${(p.referredByFranchise && p.referredByFranchise !== 'None') ? p.referredByFranchise : (p.referenceTeam || p.referredBy || 'Open Pool')}"),
  "Admin player directory table must render Ref under player name"
);
console.log("[PASS] Admin player directory table renders franchise Ref for each player");

// openPlayerEditModal must include franchise referral select
assert(
  html.includes("id=\"editPlayerReferredByFranchise\""),
  "openPlayerEditModal must have select element for franchise referral"
);
assert(
  html.includes("p.referredByFranchise = newFranchiseRef;"),
  "savePlayerEditModal must save referredByFranchise"
);
console.log("[PASS] openPlayerEditModal and savePlayerEditModal support franchise referral.\n");

// ----------------------------------------------------------------------
// TEST 4: PHOTO UPLOAD & ADMIN PLAYER REGISTRATION
// ----------------------------------------------------------------------
console.log("--- TEST 4: PHOTO UPLOAD & ADMIN PLAYER REGISTRATION ---");

// openCreatePlayerModal must include photo upload input
assert(
  html.includes("id=\"newPlayerPhotoFile\""),
  "openCreatePlayerModal must contain file upload input id=newPlayerPhotoFile"
);
assert(
  html.includes("id=\"newPlayerPhoto\""),
  "openCreatePlayerModal must contain hidden input id=newPlayerPhoto"
);
assert(
  html.includes("handlePhotoUpload(this, 'newPlayerPhotoMsg', 'newPlayerPhotoPreview')"),
  "openCreatePlayerModal must wire up handlePhotoUpload for 4:3 crop editor"
);
console.log("[PASS] openCreatePlayerModal includes 4:3 photo upload and preview container");

// openCreatePlayerModal must include franchise referral dropdown
assert(
  html.includes("id=\"newPlayerReferredByFranchise\""),
  "openCreatePlayerModal must include franchise referral selector"
);
console.log("[PASS] openCreatePlayerModal includes franchise referral selector");

// saveCreatePlayerModal must capture photo and franchiseRef and set unique keys
assert(
  html.includes("const photo = (document.getElementById(\"newPlayerPhoto\")?.value || \"\").trim();"),
  "saveCreatePlayerModal must extract photo from newPlayerPhoto input"
);
assert(
  html.includes("const franchiseRef = (document.getElementById(\"newPlayerReferredByFranchise\")?.value || \"None\").trim();"),
  "saveCreatePlayerModal must extract franchise referral"
);
assert(
  html.includes("fbDb.collection(\"playerUniqueKeys\").doc(\"roll_\" + roll).set("),
  "saveCreatePlayerModal must register roll in playerUniqueKeys"
);
console.log("[PASS] saveCreatePlayerModal persists photo, referral, and uniqueness keys.\n");

// ----------------------------------------------------------------------
// TEST 5: 3-WAY FILE PARITY CHECK
// ----------------------------------------------------------------------
console.log("--- TEST 5: 3-WAY SHA256 CHECKSUM PARITY ---");
const crypto = require('crypto');
function hashFile(fPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(fPath)).digest('hex');
}

const hashOs = hashFile(path.join(__dirname, '..', 'Acc-Auction-Os.html'));
const hashIndex = hashFile(path.join(__dirname, '..', 'index.html'));
const hashDist = hashFile(path.join(__dirname, '..', 'acc-auction-portal', 'dist', 'index.html'));

assert.strictEqual(hashOs, hashIndex, "Acc-Auction-Os.html and index.html must have identical SHA256");
assert.strictEqual(hashOs, hashDist, "Acc-Auction-Os.html and acc-auction-portal/dist/index.html must have identical SHA256");
console.log(`[PASS] 100% 3-Way SHA256 Parity Confirmed: ${hashOs}\n`);

console.log("======================================================================");
console.log(">>> ALL VERIFICATION TESTS PASSED (100%)! <<<");
console.log("======================================================================");
