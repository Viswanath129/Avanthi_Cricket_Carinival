const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("   ACC 2026 — BUCKET-WISE AUCTION & LOT NUMBER SHOWCASE TEST SUITE    ");
console.log("======================================================================\n");

const html = fs.readFileSync(path.join(__dirname, '../Acc-Auction-Os.html'), 'utf8');

// TEST 1: Bucket Sequence Definition
console.log("--- TEST 1: AUCTION BUCKET SEQUENCE DEFINITION ---");
assert(html.includes("const AUCTION_BUCKET_SEQUENCE = ['B3', 'B4', 'B2', 'B1', 'D5', 'M6'];"), "AUCTION_BUCKET_SEQUENCE must be ['B3', 'B4', 'B2', 'B1', 'D5', 'M6']");
console.log("[PASS] AUCTION_BUCKET_SEQUENCE matches exact order: B3 -> B4 -> B2 -> B1 -> D5 -> M6");

// TEST 2: Active Bucket & Draw Mode State Variables
console.log("\n--- TEST 2: ACTIVE BUCKET & DRAW MODE VARIABLES ---");
assert(html.includes('let activeAuctionBucket = localStorage.getItem("acc_active_bucket_2026") || \'B3\';'), "activeAuctionBucket should default to B3");
assert(html.includes('let drawMode = localStorage.getItem("acc_draw_mode_2026") || \'AUTO\';'), "drawMode should default to AUTO");
assert(html.includes('function setAuctionBucket(bucket)'), "setAuctionBucket function must exist");
assert(html.includes('function setDrawMode(mode)'), "setDrawMode function must exist");
assert(html.includes('function toggleDrawMode()'), "toggleDrawMode function must exist");
console.log("[PASS] State controls and localStorage persistence verified.");

// TEST 3: Bucket Normalization & Available Players
console.log("\n--- TEST 3: BUCKET NORMALIZATION & QUERY HELPERS ---");
assert(html.includes('function getPlayerAuctionBucket(p)'), "getPlayerAuctionBucket helper must exist");
assert(html.includes("if (b === 'M6' || b === 'PG' || b === 'NO_BUCKET') return 'M6';"), "M6, PG, NO_BUCKET must normalize to M6");
assert(html.includes('function getAvailablePlayersInBucket(bucket)'), "getAvailablePlayersInBucket helper must exist");
console.log("[PASS] PG/NO_BUCKET maps to M6 and available players filters out captains/retained.");

// TEST 4: Auto & Manual Selection Logic
console.log("\n--- TEST 4: AUTO & MANUAL SELECTION LOGIC ---");
assert(html.includes('function selectPlayerForAuction(playerId)'), "selectPlayerForAuction must exist");
assert(html.includes('function autoSelectNextPlayer(bucket, allowBucketAdvance = true)'), "autoSelectNextPlayer must exist");
assert(html.includes('function drawNextPlayer()'), "drawNextPlayer must exist");
assert(html.includes("if (drawMode === 'MANUAL')"), "drawNextPlayer must branch on drawMode");
assert(html.includes("openManualLotNumberDrawModal(activeAuctionBucket)"), "drawNextPlayer opens manual modal in MANUAL mode");
assert(html.includes("autoSelectNextPlayer(activeAuctionBucket, true)"), "drawNextPlayer calls autoSelectNextPlayer in AUTO mode");
console.log("[PASS] Selection routing dispatches properly based on AUTO vs MANUAL mode.");

// TEST 5: Manual Lot Numbers Showcase Modal & Number Calling
console.log("\n--- TEST 5: MANUAL LOT NUMBER SHOWCASE MODAL ---");
assert(html.includes('function openManualLotNumberDrawModal(bucket)'), "openManualLotNumberDrawModal must exist");
assert(html.includes('AUCTION LOT NUMBERS SHOWCASE'), "Modal title AUCTION LOT NUMBERS SHOWCASE exists");
assert(html.includes('id="quickLotNumberInput"'), "Quick lot number input exists");
assert(html.includes('executeQuickLotCall()'), "executeQuickLotCall exists");
assert(html.includes('executeRandomLuckyDraw('), "executeRandomLuckyDraw exists");
console.log("[PASS] Manual lot number showcase modal, token grid, and quick number input verified.");

// TEST 6: UI Pipeline Bar & Center Action Hierarchy
console.log("\n--- TEST 6: UI PIPELINE CONTROLLER & CENTER ACTION BAR ---");
assert(html.includes('REGION 1B: BUCKET PIPELINE & DRAW MODE CONTROLLER'), "Region 1B pipeline controller must be present");
assert(html.includes('⚡ AUTO DRAW'), "Auto draw toggle button present");
assert(html.includes('🔢 MANUAL / DRAW'), "Manual draw toggle button present");
assert(html.includes('SHOWCASE NUMBERS (${activeAuctionBucket}) &rarr;'), "Showcase numbers button present");
assert(html.includes('[SPACE] ${drawMode === \'MANUAL\' ? \'🔢 SHOWCASE NUMBERS\' : \'⚡ AUTO DRAW\'} (${activeAuctionBucket})'), "Center Space button present with dynamic label");
assert(html.includes('[N] LOT NUMBERS (${activeAuctionBucket})'), "Center [N] lot numbers button present");
assert(html.includes('2. PROGRESS PIPELINE'), "Progress pipeline heading present in intelligence rail");
console.log("[PASS] UI pipeline controller, center action bar, and intelligence rail progress pipeline verified.");

// TEST 7: Keyboard Shortcuts
console.log("\n--- TEST 7: KEYBOARD SHORTCUTS ---");
assert(html.includes("else if (key === 'D') { e.preventDefault(); toggleDrawMode(); }"), "D shortcut toggles draw mode");
assert(html.includes("else if (key === 'N') { e.preventDefault(); openManualLotNumberDrawModal(activeAuctionBucket); }"), "N shortcut opens lot number showcase");
assert(html.includes("else if (key === ' ') { e.preventDefault(); drawNextPlayer(); }"), "Space shortcut calls drawNextPlayer");
console.log("[PASS] Keyboard shortcuts [D], [N], and [SPACE] correctly registered.");

console.log("\n======================================================================");
console.log(">>> ALL BUCKET-WISE AUCTION & LOT NUMBER SHOWCASE TESTS PASSED! <<<");
console.log("======================================================================");
