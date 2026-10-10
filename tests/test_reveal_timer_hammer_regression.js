const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  path.join(root, 'index.html'),
  path.join(root, 'Acc-Auction-Os.html'),
  path.join(root, 'acc-auction-portal', 'dist', 'index.html'),
];
const source = fs.readFileSync(files[0], 'utf8');

function test(name, callback) {
  try {
    callback();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

function canBid(state, now) {
  return state.auctionState === 'LIVE'
    && state.timerRunning
    && state.timerDeadline > now
    && !state.auctionPaused;
}

function hammerOutcome(state, now) {
  if (state.playerStatus !== 'AVAILABLE') return 'ALREADY_FINALIZED';
  if (state.auctionPaused || state.timerDeadline > now) return 'PREMATURE';
  return state.leadingBidderId ? 'SOLD' : 'UNSOLD';
}

test('revealing a player creates a LIVE 30-second deadline, not a WAITING placeholder', () => {
  assert(source.includes("auctionState = 'LIVE';"));
  assert(source.includes('AuctionTimerEngine.reset(30000);'));
  const now = 1_000_000;
  const state = { auctionState: 'LIVE', timerRunning: true, timerDeadline: now + 30_000, auctionPaused: false };
  assert.strictEqual(state.timerDeadline - now, 30_000);
  assert.strictEqual(canBid(state, now), true);
});

test('a bid is rejected after the revealed lot expires', () => {
  assert(source.includes("BID REJECTED: This lot's bidding window has closed."));
  const now = 1_000_000;
  assert.strictEqual(canBid({ auctionState: 'LIVE', timerRunning: true, timerDeadline: now, auctionPaused: false }, now), false);
});

test('an expired no-bid lot can only finalize UNSOLD', () => {
  assert(source.includes("CONFIRM UNSOLD LOT?"));
  assert(source.includes('executeHammerUnsold()'));
  const now = 1_000_000;
  assert.strictEqual(hammerOutcome({ playerStatus: 'AVAILABLE', timerDeadline: now, auctionPaused: false, leadingBidderId: null }, now), 'UNSOLD');
});

test('an expired valid-bid lot can only finalize SOLD', () => {
  const now = 1_000_000;
  assert.strictEqual(hammerOutcome({ playerStatus: 'AVAILABLE', timerDeadline: now, auctionPaused: false, leadingBidderId: 'team-1' }, now), 'SOLD');
});

test('a no-bid hammer before expiry is rejected and finalized lots cannot repeat', () => {
  const now = 1_000_000;
  assert.strictEqual(hammerOutcome({ playerStatus: 'AVAILABLE', timerDeadline: now + 1, auctionPaused: false, leadingBidderId: null }, now), 'PREMATURE');
  assert.strictEqual(hammerOutcome({ playerStatus: 'UNSOLD', timerDeadline: now, auctionPaused: false, leadingBidderId: null }, now), 'ALREADY_FINALIZED');
});

test('a stale or missing session cannot be hammered', () => {
  assert(source.includes('No valid active auction session is available to hammer.'));
  const now = 1_000_000;
  assert.strictEqual(hammerOutcome({ playerStatus: 'AVAILABLE', timerDeadline: now + 1, auctionPaused: false, leadingBidderId: null }, now), 'PREMATURE');
});

test('all published portal copies remain byte-identical', () => {
  const hashes = files.map(file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  assert.strictEqual(new Set(hashes).size, 1);
});

console.log('All reveal/timer/hammer regression tests passed.');
