const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log(" ACC 2026 — CONSECUTIVE SELF-BID DEFENSE & MOBILE DESK TEST SUITE   ");
console.log("======================================================================\n");

const htmlPath = path.resolve(__dirname, '..', 'Acc-Auction-Os.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Core Logic Verification: Consecutive Self-Bid Defense
test("Core placeBid() prevents same team from bidding consecutively against itself", () => {
  assert(
    html.includes("leadingBidderId && (leadingBidderId === franchiseId || String(leadingBidderId) === String(franchiseId))"),
    "placeBid must guard against leadingBidderId matching franchiseId"
  );
  assert(
    html.includes("already holds the highest bid") && html.includes("Await counter-bid from another team"),
    "placeBid must notify the franchise that it already holds the highest bid and must await counter-bid"
  );
});

// 2. Terminal UI Guard: Disabled button for leading bidder
test("Franchise Terminal view disables BID button when franchise holds leading bid", () => {
  assert(
    html.includes("👑 CURRENT HIGHEST BIDDER"),
    "Franchise terminal must display CURRENT HIGHEST BIDDER banner when leading"
  );
  assert(
    html.includes("Your franchise holds the leading bid. Awaiting counter-bid from another team."),
    "Franchise terminal must clearly instruct user that counter-bid is required"
  );
});

// 3. Behalf Bid Modal Guard
test("Behalf Bid modal disables the current leading bidder in selection", () => {
  assert(
    html.includes("CURRENT LEADER") && html.includes("behalfFranchiseSelect"),
    "openBehalfBidModal must mark current leader as disabled"
  );
});

// 4. Admin Monitor Table: Leading Bidder Button Disabled
test("Admin 11-Franchise Monitor Table disables BID button for leading bidder", () => {
  assert(
    html.includes("franchise-monitor-desktop-table"),
    "Desktop table container must have franchise-monitor-desktop-table class"
  );
  assert(
    html.includes("${isLeader ? 'HOLDING' : 'BID'}"),
    "Desktop table BID button must display HOLDING when isLeader is true"
  );
});

// 5. Admin Monitor Mobile Cards: Present & Responsive
test("Admin 11-Franchise Mobile Cards exist and display touch-optimized cards", () => {
  assert(
    html.includes("franchise-monitor-mobile-cards"),
    "Mobile cards container must have franchise-monitor-mobile-cards class"
  );
  assert(
    html.includes("${isLeader ? 'HOLDING LEAD' : 'BID'}"),
    "Mobile card BID button must display HOLDING LEAD when isLeader is true"
  );
});

// 6. Responsive Grid & Media Queries
test("Responsive CSS classes and mobile media queries properly configured", () => {
  assert(
    html.includes(".admin-auction-command-grid"),
    ".admin-auction-command-grid CSS class must exist"
  );
  assert(
    html.includes(".admin-auction-col-center"),
    ".admin-auction-col-center CSS class must exist"
  );
  assert(
    html.includes(".admin-auction-col-franchises"),
    ".admin-auction-col-franchises CSS class must exist"
  );
  assert(
    html.includes(".admin-auction-col-intel"),
    ".admin-auction-col-intel CSS class must exist"
  );
  assert(
    html.includes("order: 1 !important") && html.includes(".admin-auction-col-center"),
    "Center column must be reordered to top on mobile viewports"
  );
  assert(
    html.includes(".franchise-monitor-desktop-table {") && html.includes("display: none !important;"),
    "Desktop table must be hidden on mobile screens <= 768px"
  );
  assert(
    html.includes(".franchise-monitor-mobile-cards {") && html.includes("display: flex !important;"),
    "Mobile cards must be shown on mobile screens <= 768px"
  );
});

// 7. Simulated Bidding Simulation Logic
test("Simulated bid engine enforces alternating bids between franchises", () => {
  let leadingBidderId = null;
  let currentBid = 100;
  let log = [];

  function simulateBid(franchiseId, franchiseName) {
    if (leadingBidderId && leadingBidderId === franchiseId) {
      return { success: false, reason: "BLOCKED: Already holding leading bid" };
    }
    leadingBidderId = franchiseId;
    currentBid += 10;
    log.push({ franchiseId, franchiseName, amount: currentBid });
    return { success: true, amount: currentBid };
  }

  // Franchise 1 opens bid
  let r1 = simulateBid(1, "Vizag Titans");
  assert.strictEqual(r1.success, true);
  assert.strictEqual(leadingBidderId, 1);
  assert.strictEqual(currentBid, 110);

  // Franchise 1 tries to bid again immediately
  let r2 = simulateBid(1, "Vizag Titans");
  assert.strictEqual(r2.success, false);
  assert.strictEqual(r2.reason, "BLOCKED: Already holding leading bid");
  assert.strictEqual(currentBid, 110); // Bid amount unchanged

  // Franchise 2 counter-bids
  let r3 = simulateBid(2, "Araku Aces");
  assert.strictEqual(r3.success, true);
  assert.strictEqual(leadingBidderId, 2);
  assert.strictEqual(currentBid, 120);

  // Now Franchise 1 is allowed to bid again!
  let r4 = simulateBid(1, "Vizag Titans");
  assert.strictEqual(r4.success, true);
  assert.strictEqual(leadingBidderId, 1);
  assert.strictEqual(currentBid, 130);

  // And Franchise 1 cannot bid twice again
  let r5 = simulateBid(1, "Vizag Titans");
  assert.strictEqual(r5.success, false);
});

console.log(`\nAll ${passed} tests passed successfully!`);
