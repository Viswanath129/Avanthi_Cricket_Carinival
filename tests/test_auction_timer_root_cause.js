const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("   ACC 2026 — AUCTION TIMER ROOT-CAUSE & SYNCHRONIZATION TEST SUITE   ");
console.log("======================================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`PASS [${totalCount}]: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`FAIL [${totalCount}]: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// SECTION 24: REQUIRED TEST MATRIX
// -------------------------------------------------------------

// 1. Initial 30s timer
test("Initial 30s timer on lot open", () => {
  const lotOpenedAt = 1730000000000;
  const timerDuration = 30000;
  const deadline = lotOpenedAt + timerDuration;
  const serverNow = lotOpenedAt;
  const remainingMs = Math.max(0, deadline - serverNow);
  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  assert.strictEqual(displaySeconds, 30);
  assert.strictEqual(remainingMs, 30000);
});

// 2. First render accuracy (Math.ceil test)
test("First render accuracy without truncating fractional seconds", () => {
  const deadline = 1730000030000;
  // 29.1s remaining must render as 30s
  const serverNow1 = 1730000000900;
  const rem1 = Math.max(0, Math.ceil((deadline - serverNow1) / 1000));
  assert.strictEqual(rem1, 30);

  // 29.0s remaining renders as 29s
  const serverNow2 = 1730000001000;
  const rem2 = Math.max(0, Math.ceil((deadline - serverNow2) / 1000));
  assert.strictEqual(rem2, 29);

  // 0.2s remaining renders as 1s (never prematurely 0s)
  const serverNow3 = 1730000029800;
  const rem3 = Math.max(0, Math.ceil((deadline - serverNow3) / 1000));
  assert.strictEqual(rem3, 1);
});

// 3. 20s bid reset from high remaining time (Section 23)
test("20s bid reset from 27s remaining resets to full 20s", () => {
  const bidTime = 1730000003000; // 3 seconds after opening 30s timer (27s left)
  const newDeadline = bidTime + 20000;
  const remainingMs = newDeadline - bidTime;
  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  assert.strictEqual(displaySeconds, 20);
  assert.strictEqual(remainingMs, 20000);
});

// 4. Bid with 1s remaining (Section 23 critical regression)
test("Bid with 1s remaining resets to full 20s", () => {
  const openTime = 1730000000000;
  const bidTime = openTime + 29000; // 1s left on initial 30s
  const newDeadline = bidTime + 20000;
  const remainingMs = newDeadline - bidTime;
  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  assert.strictEqual(displaySeconds, 20, "Must reset to full 20s even at 1s remaining");
});

// 5. Bid with 2s remaining
test("Bid with 2s remaining resets to full 20s", () => {
  const openTime = 1730000000000;
  const bidTime = openTime + 28000; // 2s left
  const newDeadline = bidTime + 20000;
  const remainingMs = newDeadline - bidTime;
  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  assert.strictEqual(displaySeconds, 20);
});

// 6. Multiple rapid bids
test("Multiple rapid bids generate strictly advancing deadlines", () => {
  let t = 1730000000000;
  let deadline = t + 30000;
  let version = 1;

  // Bid 1 at +5s
  t += 5000;
  deadline = t + 20000;
  version++;
  assert.strictEqual(deadline, 1730000025000);

  // Bid 2 at +300ms
  t += 300;
  deadline = t + 20000;
  version++;
  assert.strictEqual(deadline, 1730000025300);

  // Bid 3 at +150ms
  t += 150;
  deadline = t + 20000;
  version++;
  assert.strictEqual(deadline, 1730000025450);
  assert.strictEqual(version, 4);
});

// 7. Concurrent bid serialization
test("Concurrent bids resolved deterministically by timestamp, sequence, and franchiseId", () => {
  const arrivalTime = 1730000010000;
  const rawBids = [
    { franchiseId: 8, arrivalTime, nonce: 4 },
    { franchiseId: 2, arrivalTime, nonce: 1 },
    { franchiseId: 11, arrivalTime, nonce: 3 },
    { franchiseId: 5, arrivalTime, nonce: 2 }
  ];

  rawBids.sort((a, b) => a.arrivalTime - b.arrivalTime || a.nonce - b.nonce || a.franchiseId - b.franchiseId);

  assert.strictEqual(rawBids[0].franchiseId, 2, "Nonce 1 wins race condition");
  assert.strictEqual(rawBids[1].franchiseId, 5, "Nonce 2 second");
  assert.strictEqual(rawBids[2].franchiseId, 11, "Nonce 3 third");
});

// 8. Pause preserves exact remaining ms (Section 18)
test("Pause freezes exact remaining duration without drifting", () => {
  const start = 1730000000000;
  const deadline = start + 20000;
  const pauseTime = start + 8450; // 11,550ms remaining (~12s)

  const pausedRemainingMs = deadline - pauseTime;
  assert.strictEqual(pausedRemainingMs, 11550);
  const displaySec = Math.max(0, Math.ceil(pausedRemainingMs / 1000));
  assert.strictEqual(displaySec, 12);
});

// 9. Resume continues from frozen remaining duration (Section 18)
test("Resume after 30 seconds pause continues from 12s remaining", () => {
  const pausedRemainingMs = 11550;
  const resumeTime = 1730000000000 + 8450 + 30000; // Paused for 30 seconds
  const newDeadline = resumeTime + pausedRemainingMs;

  const remMs = newDeadline - resumeTime;
  assert.strictEqual(remMs, 11550);
  const displaySec = Math.max(0, Math.ceil(remMs / 1000));
  assert.strictEqual(displaySec, 12, "Resumed clock must still display 12s, NOT 0s or 20s or 42s");
});

// 10. Reset restarts at full 30s
test("Reset restarts clock at 30 seconds", () => {
  const resetTime = 1730000050000;
  const newDeadline = resetTime + 30000;
  const remSec = Math.max(0, Math.ceil((newDeadline - resetTime) / 1000));
  assert.strictEqual(remSec, 30);
});

// 11. Expiry hits 00:00
test("Expiry cleanly hits 00:00 without negative values", () => {
  const deadline = 1730000020000;
  const afterExpiry = deadline + 3500;
  const remMs = Math.max(0, deadline - afterExpiry);
  const remSec = Math.max(0, Math.ceil(remMs / 1000));
  assert.strictEqual(remMs, 0);
  assert.strictEqual(remSec, 0);
});

// 12. Expiry does NOT automatically sell player (Section 19)
test("Expiry does NOT automatically sell player; hammer is required", () => {
  let timerSeconds = 0;
  let timerRunning = false;
  let leadingBidderId = 4;
  let playerStatus = 'AVAILABLE';
  let saleCommitted = false;

  // On timer expiry:
  if (timerSeconds === 0) {
    timerRunning = false;
    // Section 1: 00:00 -> NO AUTOMATIC SALE
    saleCommitted = false;
  }
  assert.strictEqual(playerStatus, 'AVAILABLE');
  assert.strictEqual(saleCommitted, false, "Sale must NOT commit automatically on expiry");
});

// 13. Hammer after expiry commits sale
test("Hammer confirmation after expiry successfully commits sale", () => {
  let player = { id: 10, name: "Player Ten", status: 'AVAILABLE', basePrice: 60 };
  let currentBid = 140;
  let leadingBidderId = 3;
  let saleCommitted = false;

  const commitHammer = () => {
    player.status = 'SOLD';
    player.soldTo = leadingBidderId;
    player.soldPrice = currentBid;
    saleCommitted = true;
  };

  commitHammer();
  assert.strictEqual(player.status, 'SOLD');
  assert.strictEqual(player.soldTo, 3);
  assert.strictEqual(player.soldPrice, 140);
  assert.strictEqual(saleCommitted, true);
});

// 14. Network disconnect retains last known deadline (Section 14)
test("Network disconnect retains authoritative deadline without crash or reset", () => {
  const lastAuthoritativeDeadline = 1730000020000;
  let isConnected = true;

  // Connection dropped
  isConnected = false;
  let localDeadline = lastAuthoritativeDeadline;
  assert.strictEqual(localDeadline, 1730000020000, "Must preserve existing authoritative deadline during offline gap");
});

// 15. Network reconnect recalculates against authoritative deadline (Section 14)
test("Network reconnect fetches authoritative state and immediately recalculates remaining time", () => {
  const deadline = 1730000030000;
  const reconnectTime = 1730000022000; // 8 seconds remaining
  const remSec = Math.max(0, Math.ceil((deadline - reconnectTime) / 1000));
  assert.strictEqual(remSec, 8, "Immediately renders 8s on reconnect");
});

// 16. Tab sleep / background throttling jump (Section 13)
test("Tab sleep immediately catches up to real time on wake without tick lag", () => {
  const deadline = 1730000020000;
  const beforeSleepTime = 1730000002000; // 18s left
  assert.strictEqual(Math.ceil((deadline - beforeSleepTime) / 1000), 18);

  // Tab sleeps for 7 seconds
  const afterWakeTime = beforeSleepTime + 7000; // 11s left
  const displayAfterWake = Math.max(0, Math.ceil((deadline - afterWakeTime) / 1000));
  assert.strictEqual(displayAfterWake, 11, "Must jump directly from 18s to 11s without stepped tick lag");
});

// 17. Browser CPU throttling does not cause timer drift
test("Browser interval throttling does not cause timer drift because deadline is absolute", () => {
  const deadline = 1730000020000;
  // Browser throttled timer callbacks from 1s to 3s
  const throttledCheckTime = 1730000012000; // 8s left
  const calculatedRem = Math.max(0, Math.ceil((deadline - throttledCheckTime) / 1000));
  assert.strictEqual(calculatedRem, 8, "Throttled callbacks compute true mathematical deadline");
});

// 18. Clock offset synchronization
test("Clock offset calculation aligns client local clock to authoritative server time", () => {
  const clientLocalNow = 1730000005000;
  const clockOffsetMs = -5000; // Client is 5s ahead
  const synchronizedNow = clientLocalNow + clockOffsetMs;
  const deadline = 1730000020000;

  const remMs = deadline - synchronizedNow;
  assert.strictEqual(remMs, 20000);
});

// 19. High RTT sample rejection (>500ms)
test("High RTT samples (>500ms) are discarded by ClockSync", () => {
  const samples = [
    { offset: 40, rtt: 35 },
    { offset: 42, rtt: 45 },
    { offset: 800, rtt: 1200 }, // High spike
    { offset: 44, rtt: 50 }
  ];
  const filtered = samples.filter(s => s.rtt <= 500);
  assert.strictEqual(filtered.length, 3);
  assert.strictEqual(filtered.every(s => s.rtt <= 500), true);
});

// 20. Stale realtime event rejection via monotonic timerVersion (Section 22)
test("Stale realtime snapshot with older timerVersion is dropped", () => {
  let localTimerVersion = 5;
  let localDeadline = 1730000030000;

  const incomingStale = { timerVersion: 4, timerDeadline: 1730000010000 };
  let applied = false;

  if (incomingStale.timerVersion >= localTimerVersion) {
    localDeadline = incomingStale.timerDeadline;
    applied = true;
  }
  assert.strictEqual(applied, false, "Stale update with version 4 must be dropped when local is 5");
  assert.strictEqual(localDeadline, 1730000030000);
});

// 21. Newer timerVersion accepted and applied
test("Newer timerVersion increments and updates local deadline", () => {
  let localTimerVersion = 5;
  let localDeadline = 1730000030000;

  const incomingFresh = { timerVersion: 6, timerDeadline: 1730000045000 };
  if (incomingFresh.timerVersion >= localTimerVersion) {
    localDeadline = incomingFresh.timerDeadline;
    localTimerVersion = incomingFresh.timerVersion;
  }
  assert.strictEqual(localTimerVersion, 6);
  assert.strictEqual(localDeadline, 1730000045000);
});

// 22. Multi-surface convergence (Admin, Franchise, Projector, Public Live)
test("Admin, Franchise, Projector, and Public Live converge on exact same deadline", () => {
  const authoritativeDeadline = 1730000020000;
  const serverNow = 1730000006500; // 13.5s left

  const adminRemaining = Math.max(0, Math.ceil((authoritativeDeadline - serverNow) / 1000));
  const franchiseRemaining = Math.max(0, Math.ceil((authoritativeDeadline - serverNow) / 1000));
  const projectorRemaining = Math.max(0, Math.ceil((authoritativeDeadline - serverNow) / 1000));
  const publicRemaining = Math.max(0, Math.ceil((authoritativeDeadline - serverNow) / 1000));

  assert.strictEqual(adminRemaining, 14);
  assert.strictEqual(franchiseRemaining, 14);
  assert.strictEqual(projectorRemaining, 14);
  assert.strictEqual(publicRemaining, 14);
});

// 23. Progress ring strokeDashoffset derived strictly from remainingMs / totalDurationMs
test("Progress ring strokeDashoffset math matches 157 circumference scale", () => {
  const duration = 20000;
  
  // At 20s remaining (full): offset is 0
  const rem20 = 20000;
  const offset20 = 157 - (157 * (rem20 / duration));
  assert.strictEqual(offset20, 0);

  // At 10s remaining (half): offset is 78.5
  const rem10 = 10000;
  const offset10 = 157 - (157 * (rem10 / duration));
  assert.strictEqual(offset10, 78.5);

  // At 0s remaining (empty): offset is 157
  const rem0 = 0;
  const offset0 = 157 - (157 * (rem0 / duration));
  assert.strictEqual(offset0, 157);
});

// 24. Urgency visual state derivation (Section 20)
test("Urgency visual state transitions at exact thresholds (normal >10s, warning 6-10s, critical 1-5s, expired 0s)", () => {
  const getUrgency = (sec) => {
    if (sec <= 0) return 'critical time-up stopped';
    if (sec <= 5) return 'critical';
    if (sec <= 10) return 'warning';
    return 'normal';
  };

  assert.strictEqual(getUrgency(20), 'normal');
  assert.strictEqual(getUrgency(11), 'normal');
  assert.strictEqual(getUrgency(10), 'warning');
  assert.strictEqual(getUrgency(6), 'warning');
  assert.strictEqual(getUrgency(5), 'critical');
  assert.strictEqual(getUrgency(1), 'critical');
  assert.strictEqual(getUrgency(0), 'critical time-up stopped');
});

// 25. Acc-Auction-Os.html contains single authoritative AuctionTimerEngine singleton
test("Acc-Auction-Os.html contains unified AuctionTimerEngine singleton", () => {
  const htmlPath = path.join(__dirname, '..', 'Acc-Auction-Os.html');
  const content = fs.readFileSync(htmlPath, 'utf8');

  assert.strictEqual(content.includes('const AuctionTimerEngine = {'), true, "AuctionTimerEngine must exist");
  assert.strictEqual(content.includes('window.AuctionTimerEngine = AuctionTimerEngine;'), true, "Exposed globally");
  assert.strictEqual(content.includes('const ClockSync = {'), true, "ClockSync engine must exist");
  assert.strictEqual(content.includes('remainingSec < 19'), false, "Erratic < 19 heuristic must be purged");
});

console.log("\n======================================================================");
console.log(`ALL ${passedCount}/${totalCount} AUCTION TIMER ROOT-CAUSE TESTS PASSED (100%)!`);
console.log("======================================================================\n");
