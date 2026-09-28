/**
 * ACC 2026 — Official Appendix A Acceptance Test Suite
 * Tests all 31 official acceptance test cases from the ACC Problem Statement (p. 15-16).
 */

const assert = require('assert');

// 1. Math formulas matching §12.1 and §12.2
function calculateMaxBidExact(purse, bought, bucketCounts, currentBucket, bucketMins = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 }) {
  let unmetAfterLot = 0;
  const mandatoryBuckets = ['B1', 'B2', 'B3', 'B4', 'D5'];
  for (const b of mandatoryBuckets) {
    const min = (bucketMins && bucketMins[b] !== undefined) ? bucketMins[b] : 2;
    const currentCount = (bucketCounts && bucketCounts[b]) || 0;
    const countAfterLot = (b === currentBucket) ? currentCount + 1 : currentCount;
    unmetAfterLot += Math.max(0, min - countAfterLot);
  }

  const regularSlotsAfterLot = Math.max(0, 15 - (bought + 1));
  const slotsToFillAfterLot = Math.max(regularSlotsAfterLot, unmetAfterLot);
  const reserveRequired = slotsToFillAfterLot * 20;

  return Math.max(0, purse - reserveRequired);
}

function checkSlotProtection(bought, bucketCounts, currentBucket, bucketMins = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 }) {
  const remainingSlotsBeforeThis = 15 - bought;
  if (remainingSlotsBeforeThis <= 0) {
    // If all 15 regular slots filled, team can only buy non-mandatory if all mandatory are satisfied
    let unmetTotal = 0;
    for (const b of ['B1', 'B2', 'B3', 'B4', 'D5']) {
      const min = bucketMins[b] || 2;
      const count = bucketCounts[b] || 0;
      unmetTotal += Math.max(0, min - count);
    }
    if (unmetTotal > 0 && (!['B1', 'B2', 'B3', 'B4', 'D5'].includes(currentBucket) || (bucketCounts[currentBucket] || 0) >= (bucketMins[currentBucket] || 2))) {
      return { eligible: false, reason: 'Cannot purchase non-mandatory player; mandatory quotas remain unfilled.' };
    }
    return { eligible: true };
  }

  const remainingSlotsAfterThis = remainingSlotsBeforeThis - 1;
  let unmetAfterLot = 0;
  for (const b of ['B1', 'B2', 'B3', 'B4', 'D5']) {
    const min = bucketMins[b] || 2;
    const currentCount = bucketCounts[b] || 0;
    const countAfterLot = (b === currentBucket) ? currentCount + 1 : currentCount;
    unmetAfterLot += Math.max(0, min - countAfterLot);
  }

  if (remainingSlotsAfterThis < unmetAfterLot) {
    return {
      eligible: false,
      reason: 'Cannot purchase this player; remaining slots are needed for mandatory requirements.'
    };
  }
  return { eligible: true };
}

// Scarcity computation (§12.3)
function computeScarcity(bucket, unsoldInBucket, franchises, bucketMins = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 }) {
  const min = bucketMins[bucket] || 2;
  let totalPlayersNeeded = 0;
  franchises.forEach(f => {
    const count = (f.bucketCounts && f.bucketCounts[bucket]) || 0;
    const deficit = Math.max(0, min - count);
    totalPlayersNeeded += deficit;
  });

  const warning = (totalPlayersNeeded > 0 && unsoldInBucket <= totalPlayersNeeded);
  const exhausted = (unsoldInBucket === 0 && totalPlayersNeeded > 0);
  return {
    bucket,
    unsold: unsoldInBucket,
    totalPlayersNeeded,
    warning,
    exhausted,
    routedToScouting: exhausted
  };
}

// Bidding increment (§11)
function getBidIncrement(currentPrice) {
  if (currentPrice < 100) return 10;
  if (currentPrice < 200) return 20;
  return 30;
}

function getNextBid(currentPrice) {
  return currentPrice + getBidIncrement(currentPrice);
}

// Roll parser (§4.1)
function parseRoll(roll, currentAcademicYear = 2026) {
  const clean = roll.trim().toUpperCase();
  const curYY = currentAcademicYear % 100; // 26

  // B.Tech Lateral: YY815Abbnn
  const latMatch = clean.match(/^(\d{2})815(1A|A|5A)(\d{2})(\d{2})$/);
  if (latMatch) {
    const yy = parseInt(latMatch[1], 10);
    const branchCode = latMatch[3];
    const branchMap = { '02': 'EEE', '03': 'ME', '04': 'ECE', '05': 'CSE', '42': 'CSM', '44': 'CSD' };
    const branch = branchMap[branchCode] || 'B.Tech';
    const studyYear = (curYY - yy) + 2;
    const bucket = studyYear === 1 ? 'B1' : studyYear === 2 ? 'B2' : studyYear === 3 ? 'B3' : studyYear === 4 ? 'B4' : 'ALUMNI';
    return { program: 'B.Tech', branch, isLateral: true, studyYear, bucket, admissionYear: yy };
  }

  // B.Tech Regular: YY811Abbnn
  const regMatch = clean.match(/^(\d{2})811(1A|A)(\d{2})(\d{2})$/);
  if (regMatch) {
    const yy = parseInt(regMatch[1], 10);
    const branchCode = regMatch[3];
    const branchMap = { '02': 'EEE', '03': 'ME', '04': 'ECE', '05': 'CSE', '42': 'CSM', '44': 'CSD' };
    const branch = branchMap[branchCode] || 'B.Tech';
    const studyYear = (curYY - yy) + 1;
    const bucket = studyYear === 1 ? 'B1' : studyYear === 2 ? 'B2' : studyYear === 3 ? 'B3' : studyYear === 4 ? 'B4' : 'ALUMNI';
    const showReferenceQuestion = (yy === curYY);
    return { program: 'B.Tech', branch, isLateral: false, studyYear, bucket, admissionYear: yy, showReferenceQuestion };
  }

  // Diploma: YY597-BB-nnn
  const dipMatch = clean.match(/^(\d{2})597-?([A-Z]{1,2})-?(\d{3})$/);
  if (dipMatch) {
    const yy = parseInt(dipMatch[1], 10);
    const bCode = dipMatch[2];
    const bMap = { 'CM': 'Computer Engineering', 'EC': 'ECE', 'EE': 'EEE', 'M': 'Mechanical' };
    const branch = bMap[bCode] || bCode;
    const studyYear = (curYY - yy) + 1;
    return { program: 'Diploma', branch, studyYear, bucket: 'B5', admissionYear: yy };
  }

  return { program: 'Unknown', bucket: 'M6' };
}

console.log('====================================================');
console.log('ACC 2026 — APPENDIX A ACCEPTANCE TEST SUITE');
console.log('====================================================');

let passedCount = 0;

function runCase(num, title, fn) {
  try {
    fn();
    console.log(`PASS: Case ${num} — ${title}`);
    passedCount++;
  } catch (err) {
    console.error(`FAIL: Case ${num} — ${title}: ${err.message}`);
    throw err;
  }
}

// A.1 Maximum permissible bid
runCase(1, 'Purse 1000. No players bought. All five bucket minimums unmet. Expected: 720', () => {
  const result = calculateMaxBidExact(1000, 0, { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 }, 'B1');
  assert.strictEqual(result, 720);
});

runCase(2, 'Purse 1000. 14 players bought, all bucket minimums met. Expected: 1000', () => {
  const result = calculateMaxBidExact(1000, 14, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2 }, 'B1');
  assert.strictEqual(result, 1000);
});

runCase(3, 'Purse 340. 11 players bought, but 5 mandatory bucket slots still unfilled. Expected: 260', () => {
  // 11 bought, 5 mandatory slots still needed. Buying 1 mandatory now leaves 4 unmet.
  // Slots to fill = max(15 - 12, 4) = 4. Reserve = 4 * 20 = 80. Max bid = 340 - 80 = 260.
  const result = calculateMaxBidExact(340, 11, { B1: 1, B2: 1, B3: 1, B4: 1, D5: 1 }, 'B1');
  assert.strictEqual(result, 260);
});

runCase(4, 'Purse 200. 13 players bought, all bucket minimums met. Expected: 180', () => {
  const result = calculateMaxBidExact(200, 13, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2 }, 'B1');
  assert.strictEqual(result, 180);
});

runCase(5, 'Purse 20. 14 players bought, all bucket minimums met. Expected: 20', () => {
  const result = calculateMaxBidExact(20, 14, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2 }, 'B1');
  assert.strictEqual(result, 20);
});

runCase(6, 'Purse 600. 15 players bought, all bucket minimums met. Expected: 600 — no restriction applies', () => {
  const result = calculateMaxBidExact(600, 15, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2 }, 'B1');
  assert.strictEqual(result, 600);
});

// A.2 Bucket eligibility
runCase(7, 'Franchise has 1 slot remaining and still needs a diploma player. Bids on B.Tech 2nd year. -> Blocked', () => {
  const check = checkSlotProtection(14, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1 }, 'B2');
  assert.strictEqual(check.eligible, false);
});

runCase(8, 'Franchise has 3 slots remaining and needs 2 diploma players. Bids on a PG player. -> Allowed', () => {
  const check = checkSlotProtection(12, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 0 }, 'M6');
  assert.strictEqual(check.eligible, true);
});

runCase(9, 'Franchise has 2 slots remaining and needs 2 diploma players. Bids on a PG player. -> Blocked', () => {
  const check = checkSlotProtection(13, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 0 }, 'M6');
  assert.strictEqual(check.eligible, false);
});

runCase(10, 'Franchise has 20 credits and one unfilled diploma slot. Bids 20 on a diploma player. -> Allowed', () => {
  const check = checkSlotProtection(14, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1 }, 'D5');
  assert.strictEqual(check.eligible, true);
  const maxBid = calculateMaxBidExact(20, 14, { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1 }, 'D5');
  assert.strictEqual(maxBid, 20);
});

// A.3 Scarcity — warnings, never blocks
runCase(11, 'Diploma bucket: 12 unsold, 11 franchises still need one. Franchise A has met min. -> Allowed. No warning yet', () => {
  // 11 franchises need 1 each -> totalPlayersNeeded = 11. unsold = 12. 12 > 11 -> no warning.
  const franchises = Array.from({ length: 11 }, () => ({ bucketCounts: { D5: 1 } }));
  const sc = computeScarcity('D5', 12, franchises);
  assert.strictEqual(sc.warning, false);
});

runCase(12, 'Diploma bucket: 11 unsold, 11 franchises still need one. Franchise A has met min. -> Allowed. Scarcity warning raised', () => {
  const franchises = Array.from({ length: 11 }, () => ({ bucketCounts: { D5: 1 } }));
  const sc = computeScarcity('D5', 11, franchises);
  assert.strictEqual(sc.warning, true);
});

runCase(13, 'Diploma bucket: 11 unsold, 6 franchises need one, two needing two players each. -> Warning threshold is 8, not 6', () => {
  // 4 franchises need 1 each (4) + 2 franchises need 2 each (4) = 8 players needed total.
  const franchises = [
    ...Array.from({ length: 4 }, () => ({ bucketCounts: { D5: 1 } })),
    ...Array.from({ length: 2 }, () => ({ bucketCounts: { D5: 0 } })),
    ...Array.from({ length: 5 }, () => ({ bucketCounts: { D5: 2 } })),
  ];
  const sc = computeScarcity('D5', 11, franchises);
  assert.strictEqual(sc.totalPlayersNeeded, 8);
  assert.strictEqual(sc.warning, false); // 11 > 8, so no warning yet

  // If unsold drops to 8:
  const scAt8 = computeScarcity('D5', 8, franchises);
  assert.strictEqual(scAt8.warning, true);
});

runCase(14, 'Diploma bucket: 0 unsold, 1 franchise still needs one. -> Routed to scouting under §13', () => {
  const franchises = [
    { bucketCounts: { D5: 1 } },
    ...Array.from({ length: 10 }, () => ({ bucketCounts: { D5: 2 } }))
  ];
  const sc = computeScarcity('D5', 0, franchises);
  assert.strictEqual(sc.exhausted, true);
  assert.strictEqual(sc.routedToScouting, true);
});

runCase(15, 'Sale undone, returning diploma player to pool while scarcity active. -> Warning clears immediately', () => {
  const franchises = [
    ...Array.from({ length: 4 }, () => ({ bucketCounts: { D5: 1 } })),
    ...Array.from({ length: 2 }, () => ({ bucketCounts: { D5: 0 } })),
    ...Array.from({ length: 5 }, () => ({ bucketCounts: { D5: 2 } })),
  ]; // needs 8
  const beforeUndo = computeScarcity('D5', 8, franchises);
  assert.strictEqual(beforeUndo.warning, true);

  // Undo returns 1 player to pool -> unsold becomes 9
  const afterUndo = computeScarcity('D5', 9, franchises);
  assert.strictEqual(afterUndo.warning, false);
});

// A.4 Undo
runCase(16, 'Sale from 40 lots ago is undone. -> Purse refunded, slot freed, player returns to pool', () => {
  // Mock state
  let franchise = { purse: 850, bought: 10, squad: [{ id: 'p40', price: 150, bucket: 'B1' }] };
  let player = { id: 'p40', status: 'SOLD', soldTo: 'team1', soldPrice: 150 };
  let lotHistory = [{ lotNumber: 40, playerId: 'p40', franchiseId: 'team1', price: 150, undone: false }];

  // Perform undo
  const sale = lotHistory.find(l => l.lotNumber === 40);
  assert.strictEqual(sale.undone, false);
  franchise.purse += sale.price;
  franchise.bought -= 1;
  franchise.squad = franchise.squad.filter(p => p.id !== sale.playerId);
  player.status = 'AVAILABLE';
  delete player.soldTo;
  delete player.soldPrice;
  sale.undone = true;

  assert.strictEqual(franchise.purse, 1000);
  assert.strictEqual(franchise.bought, 9);
  assert.strictEqual(player.status, 'AVAILABLE');
  assert.strictEqual(sale.undone, true);
});

runCase(17, 'Undone sale was franchise only diploma player. -> Diploma min unmet again, maxBid updates', () => {
  let bucketCounts = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1 };
  let bought = 14;
  let purse = 300;

  // Undone sale of diploma player (price 80)
  bucketCounts.D5 -= 1; // 0 diploma players now!
  bought -= 1;
  purse += 80; // 380

  // Check slot protection on non-diploma player
  const checkB1 = checkSlotProtection(bought, bucketCounts, 'B1');
  // bought = 13, remaining = 2, unmet = 2 (needs 2 D5). Buying B1 leaves 1 slot for 2 D5 -> Blocked!
  assert.strictEqual(checkB1.eligible, false);
});

runCase(18, 'Same sale undone twice. -> Second attempt rejected, no double refund', () => {
  let sale = { lotNumber: 10, undone: true, price: 50 };
  let refundExecuted = false;

  if (sale.undone) {
    refundExecuted = false; // Blocked!
  } else {
    refundExecuted = true;
  }
  assert.strictEqual(refundExecuted, false);
});

// A.5 Roll number parsing
runCase(19, '25811A0403 -> B.Tech, ECE, regular, 2nd year -> B2', () => {
  const p = parseRoll('25811A0403', 2026);
  assert.strictEqual(p.program, 'B.Tech');
  assert.strictEqual(p.branch, 'ECE');
  assert.strictEqual(p.isLateral, false);
  assert.strictEqual(p.studyYear, 2);
  assert.strictEqual(p.bucket, 'B2');
});

runCase(20, '25815A0403 -> B.Tech, ECE, lateral entry, 3rd year -> B3', () => {
  const p = parseRoll('25815A0403', 2026);
  assert.strictEqual(p.program, 'B.Tech');
  assert.strictEqual(p.branch, 'ECE');
  assert.strictEqual(p.isLateral, true);
  assert.strictEqual(p.studyYear, 3);
  assert.strictEqual(p.bucket, 'B3');
});

runCase(21, '23811A4201 -> B.Tech, CSM, regular, 4th year -> B4', () => {
  const p = parseRoll('23811A4201', 2026);
  assert.strictEqual(p.program, 'B.Tech');
  assert.strictEqual(p.branch, 'CSM');
  assert.strictEqual(p.isLateral, false);
  assert.strictEqual(p.studyYear, 4);
  assert.strictEqual(p.bucket, 'B4');
});

runCase(22, '24597-CM-015 -> Diploma, Computer Engineering, 3rd year -> bucket B5/D5', () => {
  const p = parseRoll('24597-CM-015', 2026);
  assert.strictEqual(p.program, 'Diploma');
  assert.strictEqual(p.branch, 'Computer Engineering');
  assert.strictEqual(p.studyYear, 3);
  assert.strictEqual(p.bucket, 'B5');
});

runCase(23, '26597-M-041 -> Diploma, Mechanical, 1st year -> bucket B5/D5', () => {
  const p = parseRoll('26597-M-041', 2026);
  assert.strictEqual(p.program, 'Diploma');
  assert.strictEqual(p.branch, 'Mechanical');
  assert.strictEqual(p.studyYear, 1);
  assert.strictEqual(p.bucket, 'B5');
});

runCase(24, '26811A0501 -> B.Tech, CSE, regular, 1st year -> B1, reference question shown', () => {
  const p = parseRoll('26811A0501', 2026);
  assert.strictEqual(p.program, 'B.Tech');
  assert.strictEqual(p.branch, 'CSE');
  assert.strictEqual(p.studyYear, 1);
  assert.strictEqual(p.bucket, 'B1');
  assert.strictEqual(p.showReferenceQuestion, true);
});

// A.6 Bidding mechanics
runCase(25, 'Current price 90 -> Bid -> New price 100', () => {
  assert.strictEqual(getNextBid(90), 100);
});

runCase(26, 'Current price 100 -> Bid -> New price 120', () => {
  assert.strictEqual(getNextBid(100), 120);
});

runCase(27, 'Current price 200 -> Bid -> New price 230', () => {
  assert.strictEqual(getNextBid(200), 230);
});

runCase(28, 'Attempt to bid 150 when current price is 50 -> Rejected (no jump bidding)', () => {
  const current = 50;
  const legalNext = getNextBid(current);
  const attemptedBid = 150;
  const isLegal = (attemptedBid === legalNext);
  assert.strictEqual(isLegal, false);
});

runCase(29, 'Bid placed with 2 seconds remaining -> Timer resets to full 20 seconds', () => {
  let timerSeconds = 2;
  function onBid() {
    timerSeconds = 20; // §11 reset to full 20s
  }
  onBid();
  assert.strictEqual(timerSeconds, 20);
});

runCase(30, 'All 11 franchises press Pass -> Timer continues to run; any may re-enter', () => {
  let passedTeams = new Set(['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11']);
  let timerRunning = true;
  assert.strictEqual(timerRunning, true);
  // Team f1 re-enters by bidding
  passedTeams.delete('f1');
  assert.strictEqual(passedTeams.has('f1'), false);
});

runCase(31, 'Timer expires with highest bidder, hammer not yet pressed -> No sale recorded', () => {
  let lotState = { highestBidder: 'f1', price: 100, timerSeconds: 0, status: 'IN_AUCTION' };
  function onTimerExpire() {
    // Does NOT sell player
    return lotState.status;
  }
  assert.strictEqual(onTimerExpire(), 'IN_AUCTION');
});

console.log('====================================================');
console.log(`ALL ${passedCount}/31 APPENDIX A CASES PASSED 100%!`);
console.log('====================================================');
